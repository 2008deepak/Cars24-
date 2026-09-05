using MongoDB.Driver;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class MongoDbContext
{
    private readonly IMongoDatabase? _database;
    public bool IsMongoAvailable { get; }

    public MongoDbContext(IConfiguration configuration)
    {
        try
        {
            var connectionString = configuration.GetConnectionString("MongoDB") ?? "";
            var databaseName = configuration["MongoDB:DatabaseName"] ?? "Cars24DB";

            if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("<db_password>"))
            {
                throw new Exception("MongoDB connection string not configured");
            }

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            client.ListDatabaseNames().First();
            IsMongoAvailable = true;
            Console.WriteLine("[OK] Connected to MongoDB Atlas");
        }
        catch (Exception ex)
        {
            IsMongoAvailable = false;
            Console.WriteLine($"[WARN] MongoDB not available: {ex.Message}");
            Console.WriteLine("[INFO] Running with in-memory data store");
            InMemoryUsers = new List<User>();
            InMemoryCars = new List<Car>();
            InMemoryAppointments = new List<Appointment>();
            InMemoryReferralCodes = new List<ReferralCode>();
            InMemoryReferrals = new List<Referral>();
            InMemoryWallets = new List<Wallet>();
            InMemoryWalletTransactions = new List<WalletTransaction>();
            InMemoryWishlistItems = new List<WishlistItem>();
        }
    }

    public IMongoCollection<User> Users =>
        IsMongoAvailable ? _database!.GetCollection<User>("Users") : null!;

    public IMongoCollection<Car> Cars =>
        IsMongoAvailable ? _database!.GetCollection<Car>("Cars") : null!;

    public IMongoCollection<Appointment> Appointments =>
        IsMongoAvailable ? _database!.GetCollection<Appointment>("Appointments") : null!;

    public IMongoCollection<ReferralCode> ReferralCodes =>
        IsMongoAvailable ? _database!.GetCollection<ReferralCode>("ReferralCodes") : null!;

    public IMongoCollection<Referral> Referrals =>
        IsMongoAvailable ? _database!.GetCollection<Referral>("Referrals") : null!;

    public IMongoCollection<Wallet> Wallets =>
        IsMongoAvailable ? _database!.GetCollection<Wallet>("Wallets") : null!;

    public IMongoCollection<WalletTransaction> WalletTransactions =>
        IsMongoAvailable ? _database!.GetCollection<WalletTransaction>("WalletTransactions") : null!;

    public IMongoCollection<WishlistItem> WishlistItems =>
        IsMongoAvailable ? _database!.GetCollection<WishlistItem>("WishlistItems") : null!;

    // In-memory fallback collections
    public List<User> InMemoryUsers { get; } = new();
    public List<Car> InMemoryCars { get; } = new();
    public List<Appointment> InMemoryAppointments { get; } = new();
    public List<ReferralCode> InMemoryReferralCodes { get; } = new();
    public List<Referral> InMemoryReferrals { get; } = new();
    public List<Wallet> InMemoryWallets { get; } = new();
    public List<WalletTransaction> InMemoryWalletTransactions { get; } = new();
    public List<WishlistItem> InMemoryWishlistItems { get; } = new();
}
