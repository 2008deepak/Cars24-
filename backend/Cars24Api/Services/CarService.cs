using MongoDB.Driver;
using MongoDB.Bson;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class CarService
{
    private readonly MongoDbContext _context;

    public CarService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Car> CreateCar(CarCreateRequest request, string sellerId)
    {
        var car = new Car
        {
            Title = request.Title,
            Brand = request.Brand,
            Model = request.Model,
            Year = request.Year,
            Price = request.Price,
            KmDriven = request.KmDriven,
            FuelType = request.FuelType,
            Transmission = request.Transmission,
            NumberOfOwners = request.NumberOfOwners,
            RegistrationNumber = request.RegistrationNumber,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            Location = request.Location,
            SellerId = sellerId,
            IsVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
            await _context.Cars.InsertOneAsync(car);
        else
        {
            car.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryCars.Add(car);
        }

        return car;
    }

    public async Task<Car?> GetCarById(string id)
    {
        if (_context.IsMongoAvailable)
            return await _context.Cars.Find(c => c.Id == id).FirstOrDefaultAsync();
        return _context.InMemoryCars.FirstOrDefault(c => c.Id == id);
    }

    public async Task<(List<CarResponse> Cars, int TotalCount)> SearchCars(CarSearchFilter filter)
    {
        if (_context.IsMongoAvailable)
            return await SearchCarsMongo(filter);
        return SearchCarsInMemory(filter);
    }

    private async Task<(List<CarResponse> Cars, int TotalCount)> SearchCarsMongo(CarSearchFilter filter)
    {
        var builder = Builders<Car>.Filter;
        var filters = new List<FilterDefinition<Car>>
        {
            builder.Eq(c => c.IsActive, true)
        };

        if (!string.IsNullOrEmpty(filter.Brand))
            filters.Add(builder.Eq(c => c.Brand, filter.Brand));
        if (!string.IsNullOrEmpty(filter.FuelType))
            filters.Add(builder.Eq(c => c.FuelType, filter.FuelType));
        if (!string.IsNullOrEmpty(filter.Transmission))
            filters.Add(builder.Eq(c => c.Transmission, filter.Transmission));
        if (!string.IsNullOrEmpty(filter.Location))
            filters.Add(builder.Eq(c => c.Location, filter.Location));
        if (filter.MinYear.HasValue)
            filters.Add(builder.Gte(c => c.Year, filter.MinYear.Value));
        if (filter.MaxYear.HasValue)
            filters.Add(builder.Lte(c => c.Year, filter.MaxYear.Value));
        if (filter.MinPrice.HasValue)
            filters.Add(builder.Gte(c => c.Price, filter.MinPrice.Value));
        if (filter.MaxPrice.HasValue)
            filters.Add(builder.Lte(c => c.Price, filter.MaxPrice.Value));

        var combinedFilter = builder.And(filters);
        var totalCount = (int)await _context.Cars.CountDocumentsAsync(combinedFilter);

        var sortDefinition = filter.SortBy?.ToLower() switch
        {
            "price_asc" => Builders<Car>.Sort.Ascending(c => c.Price),
            "price_desc" => Builders<Car>.Sort.Descending(c => c.Price),
            "year_desc" => Builders<Car>.Sort.Descending(c => c.Year),
            "km_asc" => Builders<Car>.Sort.Ascending(c => c.KmDriven),
            _ => Builders<Car>.Sort.Descending(c => c.CreatedAt)
        };

        var cars = await _context.Cars
            .Find(combinedFilter)
            .Sort(sortDefinition)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Limit(filter.PageSize)
            .ToListAsync();

        return (MapToCarResponses(cars), totalCount);
    }

    private (List<CarResponse> Cars, int TotalCount) SearchCarsInMemory(CarSearchFilter filter)
    {
        var query = _context.InMemoryCars.Where(c => c.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(filter.Brand))
            query = query.Where(c => c.Brand == filter.Brand);
        if (!string.IsNullOrEmpty(filter.FuelType))
            query = query.Where(c => c.FuelType == filter.FuelType);
        if (!string.IsNullOrEmpty(filter.Transmission))
            query = query.Where(c => c.Transmission == filter.Transmission);
        if (!string.IsNullOrEmpty(filter.Location))
            query = query.Where(c => c.Location == filter.Location);
        if (filter.MinYear.HasValue)
            query = query.Where(c => c.Year >= filter.MinYear.Value);
        if (filter.MaxYear.HasValue)
            query = query.Where(c => c.Year <= filter.MaxYear.Value);
        if (filter.MinPrice.HasValue)
            query = query.Where(c => c.Price >= filter.MinPrice.Value);
        if (filter.MaxPrice.HasValue)
            query = query.Where(c => c.Price <= filter.MaxPrice.Value);

        var totalCount = query.Count();

        query = filter.SortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(c => c.Price),
            "price_desc" => query.OrderByDescending(c => c.Price),
            "year_desc" => query.OrderByDescending(c => c.Year),
            "km_asc" => query.OrderBy(c => c.KmDriven),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        var cars = query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return (MapToCarResponses(cars), totalCount);
    }

    public async Task<List<CarResponse>> GetCarsBySeller(string sellerId)
    {
        List<Car> cars;
        if (_context.IsMongoAvailable)
            cars = await _context.Cars.Find(c => c.SellerId == sellerId).ToListAsync();
        else
            cars = _context.InMemoryCars.Where(c => c.SellerId == sellerId).ToList();

        return MapToCarResponses(cars);
    }

    public async Task<Car?> UpdateCar(string id, CarCreateRequest request)
    {
        if (_context.IsMongoAvailable)
        {
            var update = Builders<Car>.Update
                .Set(c => c.Title, request.Title)
                .Set(c => c.Brand, request.Brand)
                .Set(c => c.Model, request.Model)
                .Set(c => c.Year, request.Year)
                .Set(c => c.Price, request.Price)
                .Set(c => c.KmDriven, request.KmDriven)
                .Set(c => c.FuelType, request.FuelType)
                .Set(c => c.Transmission, request.Transmission)
                .Set(c => c.NumberOfOwners, request.NumberOfOwners)
                .Set(c => c.RegistrationNumber, request.RegistrationNumber)
                .Set(c => c.Description, request.Description)
                .Set(c => c.ImageUrl, request.ImageUrl)
                .Set(c => c.Location, request.Location);
            await _context.Cars.UpdateOneAsync(c => c.Id == id, update);
        }
        else
        {
            var car = _context.InMemoryCars.FirstOrDefault(c => c.Id == id);
            if (car != null)
            {
                car.Title = request.Title;
                car.Brand = request.Brand;
                car.Model = request.Model;
                car.Year = request.Year;
                car.Price = request.Price;
                car.KmDriven = request.KmDriven;
                car.FuelType = request.FuelType;
                car.Transmission = request.Transmission;
                car.NumberOfOwners = request.NumberOfOwners;
                car.RegistrationNumber = request.RegistrationNumber;
                car.Description = request.Description;
                car.ImageUrl = request.ImageUrl;
                car.Location = request.Location;
            }
        }
        return await GetCarById(id);
    }

    public async Task DeleteCar(string id)
    {
        if (_context.IsMongoAvailable)
        {
            var update = Builders<Car>.Update.Set(c => c.IsActive, false);
            await _context.Cars.UpdateOneAsync(c => c.Id == id, update);
        }
        else
        {
            var car = _context.InMemoryCars.FirstOrDefault(c => c.Id == id);
            if (car != null) car.IsActive = false;
        }
    }

    public async Task<List<CarResponse>> GetFeaturedCars()
    {
        List<Car> cars;
        if (_context.IsMongoAvailable)
            cars = await _context.Cars.Find(c => c.IsActive && c.IsVerified)
                .SortByDescending(c => c.CreatedAt).Limit(8).ToListAsync();
        else
            cars = _context.InMemoryCars
                .Where(c => c.IsActive && c.IsVerified)
                .OrderByDescending(c => c.CreatedAt)
                .Take(8).ToList();

        return MapToCarResponses(cars);
    }

    private static List<CarResponse> MapToCarResponses(List<Car> cars) =>
        cars.Select(c => new CarResponse
        {
            Id = c.Id,
            Title = c.Title,
            Brand = c.Brand,
            Model = c.Model,
            Year = c.Year,
            Price = c.Price,
            ImageUrl = c.ImageUrl,
            Location = c.Location
        }).ToList();
}
