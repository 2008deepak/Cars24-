using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("password")]
    public string Password { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("fcmTokens")]
    public List<string> FcmTokens { get; set; } = new();

    [BsonElement("notificationPreferences")]
    public NotificationPreferences NotificationPreferences { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class NotificationPreferences
{
    [BsonElement("appointmentUpdates")]
    public bool AppointmentUpdates { get; set; } = true;

    [BsonElement("bidUpdates")]
    public bool BidUpdates { get; set; } = true;

    [BsonElement("priceDrops")]
    public bool PriceDrops { get; set; } = true;

    [BsonElement("chatMessages")]
    public bool ChatMessages { get; set; } = true;
}

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? ReferralCode { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserResponse User { get; set; } = null!;
}

public class UserResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class FcmTokenRequest
{
    public string Token { get; set; } = string.Empty;
}

public class NotificationPreferencesRequest
{
    public bool? AppointmentUpdates { get; set; }
    public bool? BidUpdates { get; set; }
    public bool? PriceDrops { get; set; }
    public bool? ChatMessages { get; set; }
}
