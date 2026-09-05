using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly AppointmentService _appointmentService;
    private readonly AuthService _authService;
    private readonly NotificationService _notificationService;
    private readonly ReferralService? _referralService;

    public AppointmentsController(
        AppointmentService appointmentService,
        AuthService authService,
        NotificationService notificationService,
        ReferralService? referralService = null)
    {
        _appointmentService = appointmentService;
        _authService = authService;
        _notificationService = notificationService;
        _referralService = referralService;
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> CreateAppointment(AppointmentCreateRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var appointment = await _appointmentService.CreateAppointment(userId, request);

        try
        {
            var user = await _authService.GetUserByIdRaw(userId);
            if (user != null && user.NotificationPreferences.AppointmentUpdates)
            {
                await _notificationService.SendAppointmentConfirmationAsync(
                    user,
                    appointment.Car?.Title ?? "Unknown Car",
                    appointment.Date.ToString("dd MMM yyyy"),
                    appointment.Time
                );
            }
        }
        catch
        {
            // Don't fail the appointment creation if notification fails
        }

        return Ok(appointment);
    }

    [HttpGet]
    public async Task<ActionResult<List<AppointmentResponse>>> GetMyAppointments()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var appointments = await _appointmentService.GetUserAppointments(userId);
        return Ok(appointments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentResponse>> GetAppointment(string id)
    {
        var appointment = await _appointmentService.GetAppointmentById(id);
        if (appointment == null) return NotFound();
        return Ok(appointment);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<AppointmentResponse>> UpdateStatus(string id, [FromBody] StatusRequest request)
    {
        var appointment = await _appointmentService.UpdateStatus(id, request.Status);

        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _authService.GetUserByIdRaw(userId);
                if (user != null && user.NotificationPreferences.AppointmentUpdates)
                {
                    var statusMessage = request.Status.ToLower() switch
                    {
                        "confirmed" => "has been confirmed",
                        "cancelled" => "has been cancelled",
                        "completed" => "has been completed",
                        _ => $"status updated to {request.Status}"
                    };

                    await _notificationService.SendToUserAsync(
                        user,
                        "Appointment Update",
                        $"Your appointment for {appointment.Car?.Title ?? "your car"} {statusMessage}.",
                        new Dictionary<string, string> { { "type", "appointment" }, { "url", "/profile" } }
                    );
                }

                // Trigger referral reward on appointment completion
                if (request.Status.ToLower() == "completed" && _referralService != null)
                {
                    try
                    {
                        await _referralService.CompleteReferral(userId, id);
                    }
                    catch
                    {
                        // Don't fail the status update if referral reward fails
                    }
                }
            }
        }
        catch
        {
            // Don't fail the status update if notification fails
        }

        return Ok(appointment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(string id)
    {
        await _appointmentService.DeleteAppointment(id);
        return NoContent();
    }
}

public class StatusRequest
{
    public string Status { get; set; } = string.Empty;
}
