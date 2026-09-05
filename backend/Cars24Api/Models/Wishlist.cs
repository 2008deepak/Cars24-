using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24Api.Models;

public class WishlistItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("carId")]
    public string CarId { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class WishlistToggleRequest
{
    public string CarId { get; set; } = string.Empty;
}

public class WishlistResponse
{
    public bool IsInWishlist { get; set; }
    public int TotalCount { get; set; }
}

public class WishlistCarResponse
{
    public string Id { get; set; } = string.Empty;
    public string CarId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public decimal Price { get; set; }
    public int KmDriven { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public DateTime AddedAt { get; set; }
}
