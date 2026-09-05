using MongoDB.Driver;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class WishlistService
{
    private readonly MongoDbContext _context;

    public WishlistService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistResponse> ToggleWishlist(string userId, string carId)
    {
        if (_context.IsMongoAvailable)
        {
            var existing = await _context.WishlistItems
                .Find(w => w.UserId == userId && w.CarId == carId)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                await _context.WishlistItems.DeleteOneAsync(w => w.Id == existing.Id);
                var countAfterRemove = await _context.WishlistItems
                    .CountDocumentsAsync(w => w.UserId == userId);
                return new WishlistResponse { IsInWishlist = false, TotalCount = (int)countAfterRemove };
            }
            else
            {
                var item = new WishlistItem
                {
                    UserId = userId,
                    CarId = carId,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.WishlistItems.InsertOneAsync(item);
                var countAfterAdd = await _context.WishlistItems
                    .CountDocumentsAsync(w => w.UserId == userId);
                return new WishlistResponse { IsInWishlist = true, TotalCount = (int)countAfterAdd };
            }
        }
        else
        {
            var existing = _context.InMemoryWishlistItems
                .FirstOrDefault(w => w.UserId == userId && w.CarId == carId);

            if (existing != null)
            {
                _context.InMemoryWishlistItems.Remove(existing);
                var count = _context.InMemoryWishlistItems.Count(w => w.UserId == userId);
                return new WishlistResponse { IsInWishlist = false, TotalCount = count };
            }
            else
            {
                var item = new WishlistItem
                {
                    Id = Guid.NewGuid().ToString("N").Substring(0, 24),
                    UserId = userId,
                    CarId = carId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.InMemoryWishlistItems.Add(item);
                var count = _context.InMemoryWishlistItems.Count(w => w.UserId == userId);
                return new WishlistResponse { IsInWishlist = true, TotalCount = count };
            }
        }
    }

    public async Task<bool> IsInWishlist(string userId, string carId)
    {
        if (_context.IsMongoAvailable)
        {
            var exists = await _context.WishlistItems
                .Find(w => w.UserId == userId && w.CarId == carId)
                .AnyAsync();
            return exists;
        }
        else
        {
            return _context.InMemoryWishlistItems
                .Any(w => w.UserId == userId && w.CarId == carId);
        }
    }

    public async Task<List<string>> GetUserWishlistCarIds(string userId)
    {
        if (_context.IsMongoAvailable)
        {
            var items = await _context.WishlistItems
                .Find(w => w.UserId == userId)
                .SortByDescending(w => w.CreatedAt)
                .ToListAsync();
            return items.Select(w => w.CarId).ToList();
        }
        else
        {
            return _context.InMemoryWishlistItems
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => w.CarId)
                .ToList();
        }
    }

    public async Task<List<WishlistCarResponse>> GetUserWishlist(string userId)
    {
        var carIds = await GetUserWishlistCarIds(userId);
        if (!carIds.Any()) return new List<WishlistCarResponse>();

        List<Car> cars;
        if (_context.IsMongoAvailable)
        {
            cars = await _context.Cars
                .Find(c => carIds.Contains(c.Id) && c.IsActive)
                .ToListAsync();
        }
        else
        {
            cars = _context.InMemoryCars
                .Where(c => carIds.Contains(c.Id) && c.IsActive)
                .ToList();
        }

        var carDict = cars.ToDictionary(c => c.Id);
        var result = new List<WishlistCarResponse>();

        foreach (var carId in carIds)
        {
            if (carDict.TryGetValue(carId, out var car))
            {
                result.Add(new WishlistCarResponse
                {
                    Id = Guid.NewGuid().ToString("N").Substring(0, 24),
                    CarId = car.Id,
                    Title = car.Title,
                    Brand = car.Brand,
                    Model = car.Model,
                    Year = car.Year,
                    Price = car.Price,
                    KmDriven = car.KmDriven,
                    FuelType = car.FuelType,
                    Transmission = car.Transmission,
                    ImageUrl = car.ImageUrl,
                    Location = car.Location,
                    IsVerified = car.IsVerified,
                    AddedAt = DateTime.UtcNow
                });
            }
        }

        return result;
    }

    public async Task<int> GetUserWishlistCount(string userId)
    {
        if (_context.IsMongoAvailable)
        {
            var count = await _context.WishlistItems
                .CountDocumentsAsync(w => w.UserId == userId);
            return (int)count;
        }
        else
        {
            return _context.InMemoryWishlistItems.Count(w => w.UserId == userId);
        }
    }
}
