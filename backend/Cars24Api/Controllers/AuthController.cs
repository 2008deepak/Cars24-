using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        try
        {
            var result = await _authService.Register(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        try
        {
            var result = await _authService.Login(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserResponse>> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _authService.GetUserById(userId);
        return Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _authService.UpdateProfile(userId, request.Name, request.Phone);
        return Ok(user);
    }

    [Authorize]
    [HttpPost("fcm-token")]
    public async Task<IActionResult> RegisterFcmToken([FromBody] FcmTokenRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _authService.RegisterFcmToken(userId, request.Token);
        return Ok(new { message = "FCM token registered" });
    }

    [Authorize]
    [HttpDelete("fcm-token")]
    public async Task<IActionResult> RemoveFcmToken([FromBody] FcmTokenRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _authService.RemoveFcmToken(userId, request.Token);
        return Ok(new { message = "FCM token removed" });
    }

    [Authorize]
    [HttpGet("notification-preferences")]
    public async Task<ActionResult<NotificationPreferences>> GetNotificationPreferences()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var prefs = await _authService.GetNotificationPreferences(userId);
        return Ok(prefs);
    }

    [Authorize]
    [HttpPut("notification-preferences")]
    public async Task<IActionResult> UpdateNotificationPreferences(
        [FromBody] NotificationPreferencesRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var prefs = await _authService.UpdateNotificationPreferences(userId, request);
        return Ok(prefs);
    }
}

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
