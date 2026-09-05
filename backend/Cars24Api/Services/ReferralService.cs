using MongoDB.Driver;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class ReferralService
{
    private readonly MongoDbContext _context;
    private readonly WalletService _walletService;

    public ReferralService(MongoDbContext context, WalletService walletService)
    {
        _context = context;
        _walletService = walletService;
    }

    public async Task<ReferralCodeResponse> GenerateReferralCode(string userId)
    {
        // Check if user already has an active code
        ReferralCode? existing;
        if (_context.IsMongoAvailable)
        {
            existing = await _context.ReferralCodes
                .Find(c => c.UserId == userId && c.IsActive)
                .FirstOrDefaultAsync();
        }
        else
        {
            existing = _context.InMemoryReferralCodes
                .FirstOrDefault(c => c.UserId == userId && c.IsActive);
        }

        if (existing != null)
        {
            return new ReferralCodeResponse
            {
                Code = existing.Code,
                UsageCount = existing.UsageCount,
                IsActive = existing.IsActive,
                CreatedAt = existing.CreatedAt,
                ShareUrl = $"https://cars24.com/register?ref={existing.Code}"
            };
        }

        var code = GenerateUniqueCode();

        var referralCode = new ReferralCode
        {
            UserId = userId,
            Code = code,
            IsActive = true,
            UsageCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
            await _context.ReferralCodes.InsertOneAsync(referralCode);
        else
        {
            referralCode.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryReferralCodes.Add(referralCode);
        }

        return new ReferralCodeResponse
        {
            Code = code,
            UsageCount = 0,
            IsActive = true,
            CreatedAt = referralCode.CreatedAt,
            ShareUrl = $"https://cars24.com/register?ref={code}"
        };
    }

    public async Task<ApplyReferralResponse> ApplyReferralCode(string referredUserId, string code)
    {
        if (string.IsNullOrEmpty(code))
            return new ApplyReferralResponse { Success = false, Message = "Referral code is required" };

        // Find the referral code
        ReferralCode? referralCode;
        if (_context.IsMongoAvailable)
        {
            referralCode = await _context.ReferralCodes
                .Find(c => c.Code == code && c.IsActive)
                .FirstOrDefaultAsync();
        }
        else
        {
            referralCode = _context.InMemoryReferralCodes
                .FirstOrDefault(c => c.Code == code && c.IsActive);
        }

        if (referralCode == null)
            return new ApplyReferralResponse { Success = false, Message = "Invalid referral code" };

        // Cannot refer yourself
        if (referralCode.UserId == referredUserId)
            return new ApplyReferralResponse { Success = false, Message = "You cannot use your own referral code" };

        // Check max usage
        if (referralCode.UsageCount >= ReferralConfig.MaxReferralUses)
            return new ApplyReferralResponse { Success = false, Message = "Referral code has reached maximum uses" };

        // Check if already referred
        Referral? existingReferral;
        if (_context.IsMongoAvailable)
        {
            existingReferral = await _context.Referrals
                .Find(r => r.ReferredId == referredUserId)
                .FirstOrDefaultAsync();
        }
        else
        {
            existingReferral = _context.InMemoryReferrals
                .FirstOrDefault(r => r.ReferredId == referredUserId);
        }

        if (existingReferral != null)
            return new ApplyReferralResponse { Success = false, Message = "You have already been referred" };

        // Create the referral record
        var referral = new Referral
        {
            ReferrerId = referralCode.UserId,
            ReferredId = referredUserId,
            Code = code,
            Status = "pending",
            ReferrerReward = ReferralConfig.ReferrerPoints,
            ReferredReward = ReferralConfig.ReferredPoints,
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
            await _context.Referrals.InsertOneAsync(referral);
        else
        {
            referral.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryReferrals.Add(referral);
        }

        // Increment usage count
        if (_context.IsMongoAvailable)
        {
            var update = Builders<ReferralCode>.Update.Inc(c => c.UsageCount, 1);
            await _context.ReferralCodes.UpdateOneAsync(c => c.Id == referralCode.Id, update);
        }
        else
        {
            referralCode.UsageCount++;
        }

        // Credit the referred user immediately
        await _walletService.CreditPoints(
            referredUserId,
            ReferralConfig.ReferredPoints,
            $"Bonus for being referred by a friend",
            referral.Id
        );

        return new ApplyReferralResponse
        {
            Success = true,
            BonusPoints = ReferralConfig.ReferredPoints,
            Message = $"Welcome! You received {ReferralConfig.ReferredPoints} bonus points"
        };
    }

    public async Task CompleteReferral(string referredUserId, string appointmentId)
    {
        Referral? referral;
        if (_context.IsMongoAvailable)
        {
            referral = await _context.Referrals
                .Find(r => r.ReferredId == referredUserId && r.Status == "pending")
                .FirstOrDefaultAsync();
        }
        else
        {
            referral = _context.InMemoryReferrals
                .FirstOrDefault(r => r.ReferredId == referredUserId && r.Status == "pending");
        }

        if (referral == null) return;

        // Update status
        if (_context.IsMongoAvailable)
        {
            var update = Builders<Referral>.Update
                .Set(r => r.Status, "completed")
                .Set(r => r.CompletedAt, DateTime.UtcNow);
            await _context.Referrals.UpdateOneAsync(r => r.Id == referral.Id, update);
        }
        else
        {
            referral.Status = "completed";
            referral.CompletedAt = DateTime.UtcNow;
        }

        // Credit the referrer
        await _walletService.CreditPoints(
            referral.ReferrerId,
            ReferralConfig.ReferrerPoints,
            $"Referral reward: friend completed a purchase",
            referral.Id
        );

        // Credit appointment bonus to both
        await _walletService.CreditPoints(
            referredUserId,
            ReferralConfig.AppointmentBonusPoints,
            "Appointment completion bonus",
            appointmentId
        );
        await _walletService.CreditPoints(
            referral.ReferrerId,
            ReferralConfig.AppointmentBonusPoints,
            "Friend's appointment completion bonus",
            appointmentId
        );
    }

    public async Task<ReferralStatsResponse> GetReferralStats(string userId)
    {
        List<Referral> referrals;
        ReferralCode? currentCode;

        if (_context.IsMongoAvailable)
        {
            referrals = await _context.Referrals
                .Find(r => r.ReferrerId == userId)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
            currentCode = await _context.ReferralCodes
                .Find(c => c.UserId == userId && c.IsActive)
                .FirstOrDefaultAsync();
        }
        else
        {
            referrals = _context.InMemoryReferrals
                .Where(r => r.ReferrerId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToList();
            currentCode = _context.InMemoryReferralCodes
                .FirstOrDefault(c => c.UserId == userId && c.IsActive);
        }

        var referredUserIds = referrals.Select(r => r.ReferredId).ToList();
        var referredUsers = new Dictionary<string, string>();

        if (_context.IsMongoAvailable)
        {
            var users = await _context.Users
                .Find(u => referredUserIds.Contains(u.Id))
                .ToListAsync();
            foreach (var u in users) referredUsers[u.Id] = u.Name;
        }
        else
        {
            var users = _context.InMemoryUsers
                .Where(u => referredUserIds.Contains(u.Id));
            foreach (var u in users) referredUsers[u.Id] = u.Name;
        }

        return new ReferralStatsResponse
        {
            TotalReferred = referrals.Count,
            CompletedReferrals = referrals.Count(r => r.Status == "completed"),
            PendingReferrals = referrals.Count(r => r.Status == "pending"),
            TotalPointsEarned = referrals.Where(r => r.Status == "completed").Sum(r => r.ReferrerReward),
            CurrentCode = currentCode != null ? new ReferralCodeResponse
            {
                Code = currentCode.Code,
                UsageCount = currentCode.UsageCount,
                IsActive = currentCode.IsActive,
                CreatedAt = currentCode.CreatedAt,
                ShareUrl = $"https://cars24.com/register?ref={currentCode.Code}"
            } : null,
            Referrals = referrals.Select(r => new ReferralResponse
            {
                Id = r.Id,
                ReferredUserName = referredUsers.GetValueOrDefault(r.ReferredId, "Unknown"),
                Status = r.Status,
                ReferrerReward = r.ReferrerReward,
                ReferredReward = r.ReferredReward,
                CreatedAt = r.CreatedAt,
                CompletedAt = r.CompletedAt
            }).ToList()
        };
    }

    private static string GenerateUniqueCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 8)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
