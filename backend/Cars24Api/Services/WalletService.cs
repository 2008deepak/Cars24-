using MongoDB.Driver;
using MongoDB.Bson;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class WalletService
{
    private readonly MongoDbContext _context;

    public WalletService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Wallet> GetOrCreateWallet(string userId)
    {
        if (_context.IsMongoAvailable)
        {
            var wallet = await _context.Wallets.Find(w => w.UserId == userId).FirstOrDefaultAsync();
            if (wallet == null)
            {
                wallet = new Wallet
                {
                    UserId = userId,
                    Balance = 0,
                    TotalEarned = 0,
                    TotalRedeemed = 0,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Wallets.InsertOneAsync(wallet);
            }
            return wallet;
        }
        else
        {
            var wallet = _context.InMemoryWallets.FirstOrDefault(w => w.UserId == userId);
            if (wallet == null)
            {
                wallet = new Wallet
                {
                    Id = Guid.NewGuid().ToString("N").Substring(0, 24),
                    UserId = userId,
                    Balance = 0,
                    TotalEarned = 0,
                    TotalRedeemed = 0,
                    CreatedAt = DateTime.UtcNow
                };
                _context.InMemoryWallets.Add(wallet);
            }
            return wallet;
        }
    }

    public async Task<WalletTransaction> CreditPoints(string userId, int amount, string description, string referenceId = "")
    {
        var wallet = await GetOrCreateWallet(userId);

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            Amount = amount,
            Type = "credit",
            Description = description,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
        {
            await _context.WalletTransactions.InsertOneAsync(transaction);
            var update = Builders<Wallet>.Update
                .Inc(w => w.Balance, amount)
                .Inc(w => w.TotalEarned, amount);
            await _context.Wallets.UpdateOneAsync(w => w.Id == wallet.Id, update);
        }
        else
        {
            transaction.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryWalletTransactions.Add(transaction);
            wallet.Balance += amount;
            wallet.TotalEarned += amount;
        }

        return transaction;
    }

    public async Task<WalletTransaction?> DebitPoints(string userId, int amount, string description, string referenceId = "")
    {
        var wallet = await GetOrCreateWallet(userId);

        if (wallet.Balance < amount)
            return null;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            Amount = amount,
            Type = "debit",
            Description = description,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
        {
            await _context.WalletTransactions.InsertOneAsync(transaction);
            var update = Builders<Wallet>.Update
                .Inc(w => w.Balance, -amount)
                .Inc(w => w.TotalRedeemed, amount);
            await _context.Wallets.UpdateOneAsync(w => w.Id == wallet.Id, update);
        }
        else
        {
            transaction.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryWalletTransactions.Add(transaction);
            wallet.Balance -= amount;
            wallet.TotalRedeemed += amount;
        }

        return transaction;
    }

    public async Task<WalletResponse> GetWalletDetails(string userId)
    {
        var wallet = await GetOrCreateWallet(userId);

        List<WalletTransaction> transactions;
        if (_context.IsMongoAvailable)
        {
            transactions = await _context.WalletTransactions
                .Find(t => t.UserId == userId)
                .SortByDescending(t => t.CreatedAt)
                .Limit(50)
                .ToListAsync();
        }
        else
        {
            transactions = _context.InMemoryWalletTransactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Take(50)
                .ToList();
        }

        return new WalletResponse
        {
            Balance = wallet.Balance,
            TotalEarned = wallet.TotalEarned,
            TotalRedeemed = wallet.TotalRedeemed,
            Transactions = transactions.Select(t => new WalletTransactionResponse
            {
                Id = t.Id,
                Amount = t.Amount,
                Type = t.Type,
                Description = t.Description,
                CreatedAt = t.CreatedAt
            }).ToList()
        };
    }
}
