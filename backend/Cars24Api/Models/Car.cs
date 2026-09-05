using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24Api.Models;

public class Car
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("brand")]
    public string Brand { get; set; } = string.Empty;

    [BsonElement("model")]
    public string Model { get; set; } = string.Empty;

    [BsonElement("year")]
    public int Year { get; set; }

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("kmDriven")]
    public int KmDriven { get; set; }

    [BsonElement("fuelType")]
    public string FuelType { get; set; } = string.Empty;

    [BsonElement("transmission")]
    public string Transmission { get; set; } = string.Empty;

    [BsonElement("numberOfOwners")]
    public int NumberOfOwners { get; set; }

    [BsonElement("registrationNumber")]
    public string RegistrationNumber { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("imageUrl")]
    public string ImageUrl { get; set; } = string.Empty;

    [BsonElement("location")]
    public string Location { get; set; } = string.Empty;

    [BsonElement("sellerId")]
    public string SellerId { get; set; } = string.Empty;

    [BsonElement("isVerified")]
    public bool IsVerified { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CarCreateRequest
{
    public string Title { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public decimal Price { get; set; }
    public int KmDriven { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public int NumberOfOwners { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}

public class CarSearchFilter
{
    public string? Brand { get; set; }
    public string? FuelType { get; set; }
    public string? Transmission { get; set; }
    public int? MinYear { get; set; }
    public int? MaxYear { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Location { get; set; }
    public string? SortBy { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}
