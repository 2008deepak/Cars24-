using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class NotificationService
{
    private readonly MongoDbContext _context;
    private readonly ILogger<NotificationService> _logger;
    private readonly IConfiguration _configuration;
    private static bool _firebaseInitialized = false;

    public NotificationService(MongoDbContext context, ILogger<NotificationService> logger, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
        InitializeFirebase();
    }

    private void InitializeFirebase()
    {
        if (_firebaseInitialized) return;

        try
        {
            var credentialPath = _configuration["Firebase:CredentialsPath"]
                ?? Environment.GetEnvironmentVariable("FIREBASE_CREDENTIALS_PATH");
            
            if (!string.IsNullOrEmpty(credentialPath))
            {
                // Resolve relative paths from content root
                if (!Path.IsPathRooted(credentialPath))
                {
                    var contentRoot = AppContext.BaseDirectory;
                    credentialPath = Path.Combine(contentRoot, credentialPath);
                }

                if (File.Exists(credentialPath))
                {
                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromFile(credentialPath),
                    });
                    _firebaseInitialized = true;
                    _logger.LogInformation("Firebase Admin initialized successfully from {Path}", credentialPath);
                }
                else
                {
                    _logger.LogWarning("Firebase credentials file not found at {Path}", credentialPath);
                }
            }
            else
            {
                _logger.LogWarning("Firebase credentials path not configured. Set Firebase:CredentialsPath in appsettings.json or FIREBASE_CREDENTIALS_PATH env var.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Firebase Admin");
        }
    }

    public async Task SendToUserAsync(User user, string title, string body, Dictionary<string, string>? data = null)
    {
        if (!_firebaseInitialized || user.FcmTokens == null || !user.FcmTokens.Any())
        {
            _logger.LogDebug("No FCM tokens for user {UserId} or Firebase not initialized", user.Id);
            return;
        }

        var message = new Message()
        {
            Token = user.FcmTokens.First(),
            Notification = new Notification()
            {
                Title = title,
                Body = body,
            },
            Data = data ?? new Dictionary<string, string>(),
            Webpush = new WebpushConfig()
            {
                Headers = new Dictionary<string, string>
                {
                    { "TTL", "86400" },
                },
                Notification = new WebpushNotification()
                {
                    Icon = "/favicon.ico",
                    Badge = "/favicon.ico",
                    Tag = data?.GetValueOrDefault("type", "general"),
                },
            },
        };

        try
        {
            var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
            _logger.LogInformation("Sent push notification to user {UserId}, message ID: {MessageId}", user.Id, response);

            // Send to remaining tokens
            foreach (var token in user.FcmTokens.Skip(1))
            {
                try
                {
                    var additionalMessage = new Message()
                    {
                        Token = token,
                        Notification = message.Notification,
                        Data = message.Data,
                        Webpush = message.Webpush,
                    };
                    await FirebaseMessaging.DefaultInstance.SendAsync(additionalMessage);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send to additional token");
                    await RemoveInvalidTokenAsync(user, token);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending push notification to user {UserId}", user.Id);

            if (ex.Message.Contains("InvalidRegistration") || ex.Message.Contains("NotRegistered"))
            {
                await RemoveAllTokensAsync(user);
            }
        }
    }

    public async Task SendAppointmentConfirmationAsync(User user, string carTitle, string appointmentDate, string time)
    {
        var data = new Dictionary<string, string>
        {
            { "type", "appointment" },
            { "url", "/profile" },
        };

        await SendToUserAsync(
            user,
            "Appointment Confirmed!",
            $"Your appointment for {carTitle} is confirmed for {appointmentDate} at {time}.",
            data
        );
    }

    public async Task SendPriceDropAlertAsync(User user, string carTitle, decimal oldPrice, decimal newPrice)
    {
        var data = new Dictionary<string, string>
        {
            { "type", "price_drop" },
            { "url", "/buy" },
        };

        await SendToUserAsync(
            user,
            "Price Drop Alert!",
            $"Price dropped on {carTitle} from ₹{oldPrice:N0} to ₹{newPrice:N0}.",
            data
        );
    }

    public async Task SendBidUpdateAsync(User user, string carTitle, bool outbid)
    {
        var data = new Dictionary<string, string>
        {
            { "type", "bid" },
            { "url", "/buy" },
        };

        var title = outbid ? "You've been outbid!" : "New bid on your car";
        var body = outbid
            ? $"Someone placed a higher bid on {carTitle}. Place a new bid now!"
            : $"A new bid has been placed on {carTitle}.";

        await SendToUserAsync(user, title, body, data);
    }

    public async Task SendChatMessageAsync(User user, string senderName, string message)
    {
        var data = new Dictionary<string, string>
        {
            { "type", "chat" },
            { "url", "/profile" },
        };

        await SendToUserAsync(
            user,
            $"New message from {senderName}",
            message.Length > 100 ? message[..100] + "..." : message,
            data
        );
    }

    private async Task RemoveInvalidTokenAsync(User user, string invalidToken)
    {
        user.FcmTokens.Remove(invalidToken);
        if (_context.IsMongoAvailable)
        {
            var update = MongoDB.Driver.Builders<User>.Update.Set(u => u.FcmTokens, user.FcmTokens);
            await _context.Users.ReplaceOneAsync(
                MongoDB.Driver.Builders<User>.Filter.Eq(u => u.Id, user.Id),
                user
            );
        }
        _logger.LogInformation("Removed invalid FCM token for user {UserId}", user.Id);
    }

    private async Task RemoveAllTokensAsync(User user)
    {
        user.FcmTokens.Clear();
        if (_context.IsMongoAvailable)
        {
            await _context.Users.ReplaceOneAsync(
                MongoDB.Driver.Builders<User>.Filter.Eq(u => u.Id, user.Id),
                user
            );
        }
        _logger.LogInformation("Removed all FCM tokens for user {UserId}", user.Id);
    }
}
