using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24Api.Models;

public class ReferralCode
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("usageCount")]
    public int UsageCount { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Referral
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("referrerId")]
    public string ReferrerId { get; set; } = string.Empty;

    [BsonElement("referredId")]
    public string ReferredId { get; set; } = string.Empty;

    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = "pending"; // pending, completed

    [BsonElement("referrerReward")]
    public int ReferrerReward { get; set; } = 0;

    [BsonElement("referredReward")]
    public int ReferredReward { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("completedAt")]
    public DateTime? CompletedAt { get; set; }
}

public class Wallet
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("balance")]
    public int Balance { get; set; } = 0;

    [BsonElement("totalEarned")]
    public int TotalEarned { get; set; } = 0;

    [BsonElement("totalRedeemed")]
    public int TotalRedeemed { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class WalletTransaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("walletId")]
    public string WalletId { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("amount")]
    public int Amount { get; set; }

    [BsonElement("type")]
    public string Type { get; set; } = string.Empty; // credit, debit

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("referenceId")]
    public string ReferenceId { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Request/Response DTOs
public class GenerateReferralCodeRequest { }

public class ReferralCodeResponse
{
    public string Code { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string ShareUrl { get; set; } = string.Empty;
}

public class ReferralResponse
{
    public string Id { get; set; } = string.Empty;
    public string ReferredUserName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ReferrerReward { get; set; }
    public int ReferredReward { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ReferralStatsResponse
{
    public int TotalReferred { get; set; }
    public int CompletedReferrals { get; set; }
    public int PendingReferrals { get; set; }
    public int TotalPointsEarned { get; set; }
    public ReferralCodeResponse? CurrentCode { get; set; }
    public List<ReferralResponse> Referrals { get; set; } = new();
}

public class ApplyReferralRequest
{
    public string Code { get; set; } = string.Empty;
}

public class ApplyReferralResponse
{
    public bool Success { get; set; }
    public int BonusPoints { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class WalletResponse
{
    public int Balance { get; set; }
    public int TotalEarned { get; set; }
    public int TotalRedeemed { get; set; }
    public List<WalletTransactionResponse> Transactions { get; set; } = new();
}

public class WalletTransactionResponse
{
    public string Id { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class RedeemPointsRequest
{
    public int Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class ReferralConfig
{
    public const int ReferrerPoints = 500;
    public const int ReferredPoints = 250;
    public const int AppointmentBonusPoints = 200;
    public const int MaxReferralUses = 50;
    public const int MinRedeemAmount = 100;
    public const int MaxRedeemAmount = 50000;
}
