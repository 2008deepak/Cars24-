using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Cars24Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add MongoDB
builder.Services.AddSingleton<MongoDbContext>();

// Add Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CarService>();
builder.Services.AddScoped<AppointmentService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<WalletService>();
builder.Services.AddScoped<ReferralService>();
builder.Services.AddScoped<WishlistService>();

// Add Controllers
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? throw new InvalidOperationException("JWT key not configured. Set Jwt:Key in appsettings.json or JWT_SECRET_KEY env var.");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "Cars24",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "Cars24",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Seed sample data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    await SeedData.SeedAsync(context);
}

if (app.Environment.IsDevelopment())
{
    // Swagger removed - use /api endpoints directly
}

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
