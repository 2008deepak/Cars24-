using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReferralsController : ControllerBase
{
    private readonly ReferralService _referralService;

    public ReferralsController(ReferralService referralService)
    {
        _referralService = referralService;
    }

    [HttpPost("generate-code")]
    public async Task<ActionResult<ReferralCodeResponse>> GenerateCode()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _referralService.GenerateReferralCode(userId);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ReferralStatsResponse>> GetStats()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var stats = await _referralService.GetReferralStats(userId);
        return Ok(stats);
    }

    [HttpPost("apply")]
    public async Task<ActionResult<ApplyReferralResponse>> ApplyCode([FromBody] ApplyReferralRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _referralService.ApplyReferralCode(userId, request.Code);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
