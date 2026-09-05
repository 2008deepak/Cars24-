using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class AuthService
{
    private readonly MongoDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ReferralService? _referralService;

    public AuthService(MongoDbContext context, IConfiguration configuration, ReferralService? referralService = null)
    {
        _context = context;
        _configuration = configuration;
        _referralService = referralService;
    }

    public async Task<AuthResponse> Register(RegisterRequest request)
    {
        if (_context.IsMongoAvailable)
        {
            var existing = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (existing != null) throw new Exception("Email already registered");
        }
        else
        {
            if (_context.InMemoryUsers.Any(u => u.Email == request.Email))
                throw new Exception("Email already registered");
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
            await _context.Users.InsertOneAsync(user);
        else
        {
            user.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryUsers.Add(user);
        }

        // Apply referral code if provided
        if (!string.IsNullOrEmpty(request.ReferralCode) && _referralService != null)
        {
            try
            {
                await _referralService.ApplyReferralCode(user.Id, request.ReferralCode);
            }
            catch
            {
                // Don't fail registration if referral fails
            }
        }

        return new AuthResponse
        {
            Token = GenerateJwtToken(user),
            User = MapToUserResponse(user)
        };
    }

    public async Task<AuthResponse> Login(LoginRequest request)
    {
        User? user;
        if (_context.IsMongoAvailable)
            user = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
        else
            user = _context.InMemoryUsers.FirstOrDefault(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            throw new Exception("Invalid email or password");

        return new AuthResponse
        {
            Token = GenerateJwtToken(user),
            User = MapToUserResponse(user)
        };
    }

    public async Task<UserResponse> GetUserById(string id)
    {
        User? user;
        if (_context.IsMongoAvailable)
            user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        else
            user = _context.InMemoryUsers.FirstOrDefault(u => u.Id == id);

        if (user == null) throw new Exception("User not found");
        return MapToUserResponse(user);
    }

    public async Task<UserResponse> UpdateProfile(string id, string name, string phone)
    {
        if (_context.IsMongoAvailable)
        {
            var update = Builders<User>.Update
                .Set(u => u.Name, name)
                .Set(u => u.Phone, phone);
            await _context.Users.UpdateOneAsync(u => u.Id == id, update);
        }
        else
        {
            var user = _context.InMemoryUsers.FirstOrDefault(u => u.Id == id);
            if (user != null) { user.Name = name; user.Phone = phone; }
        }
        return await GetUserById(id);
    }

    public async Task RegisterFcmToken(string userId, string fcmToken)
    {
        if (_context.IsMongoAvailable)
        {
            var update = Builders<User>.Update.AddToSet(u => u.FcmTokens, fcmToken);
            await _context.Users.UpdateOneAsync(u => u.Id == userId, update);
        }
        else
        {
            var user = _context.InMemoryUsers.FirstOrDefault(u => u.Id == userId);
            if (user != null && !user.FcmTokens.Contains(fcmToken))
            {
                user.FcmTokens.Add(fcmToken);
            }
        }
    }

    public async Task RemoveFcmToken(string userId, string fcmToken)
    {
        if (_context.IsMongoAvailable)
        {
            var update = Builders<User>.Update.Pull(u => u.FcmTokens, fcmToken);
            await _context.Users.UpdateOneAsync(u => u.Id == userId, update);
        }
        else
        {
            var user = _context.InMemoryUsers.FirstOrDefault(u => u.Id == userId);
            if (user != null)
            {
                user.FcmTokens.Remove(fcmToken);
            }
        }
    }

    public async Task<NotificationPreferences> GetNotificationPreferences(string userId)
    {
        if (_context.IsMongoAvailable)
        {
            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            return user?.NotificationPreferences ?? new NotificationPreferences();
        }
        else
        {
            var user = _context.InMemoryUsers.FirstOrDefault(u => u.Id == userId);
            return user?.NotificationPreferences ?? new NotificationPreferences();
        }
    }

    public async Task<NotificationPreferences> UpdateNotificationPreferences(
        string userId, NotificationPreferencesRequest request)
    {
        var currentPrefs = await GetNotificationPreferences(userId);

        if (request.AppointmentUpdates.HasValue)
            currentPrefs.AppointmentUpdates = request.AppointmentUpdates.Value;
        if (request.BidUpdates.HasValue)
            currentPrefs.BidUpdates = request.BidUpdates.Value;
        if (request.PriceDrops.HasValue)
            currentPrefs.PriceDrops = request.PriceDrops.Value;
        if (request.ChatMessages.HasValue)
            currentPrefs.ChatMessages = request.ChatMessages.Value;

        if (_context.IsMongoAvailable)
        {
            var update = Builders<User>.Update
                .Set(u => u.NotificationPreferences, currentPrefs);
            await _context.Users.UpdateOneAsync(u => u.Id == userId, update);
        }
        else
        {
            var user = _context.InMemoryUsers.FirstOrDefault(u => u.Id == userId);
            if (user != null)
            {
                user.NotificationPreferences = currentPrefs;
            }
        }

        return currentPrefs;
    }

    public async Task<User?> GetUserByIdRaw(string userId)
    {
        if (_context.IsMongoAvailable)
            return await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        else
            return _context.InMemoryUsers.FirstOrDefault(u => u.Id == userId);
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? throw new InvalidOperationException("JWT key not configured.")));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "Cars24",
            audience: _configuration["Jwt:Audience"] ?? "Cars24",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserResponse MapToUserResponse(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Phone = user.Phone
    };
}
