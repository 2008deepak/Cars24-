using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WalletController : ControllerBase
{
    private readonly WalletService _walletService;

    public WalletController(WalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet]
    public async Task<ActionResult<WalletResponse>> GetWallet()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var wallet = await _walletService.GetWalletDetails(userId);
        return Ok(wallet);
    }

    [HttpPost("redeem")]
    public async Task<IActionResult> RedeemPoints([FromBody] RedeemPointsRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (request.Amount < ReferralConfig.MinRedeemAmount)
            return BadRequest(new { message = $"Minimum redemption amount is {ReferralConfig.MinRedeemAmount} points" });

        if (request.Amount > ReferralConfig.MaxRedeemAmount)
            return BadRequest(new { message = $"Maximum redemption amount is {ReferralConfig.MaxRedeemAmount} points" });

        var transaction = await _walletService.DebitPoints(userId, request.Amount, request.Description);
        if (transaction == null)
            return BadRequest(new { message = "Insufficient balance" });

        return Ok(new { message = $"Successfully redeemed {request.Amount} points", balance = (await _walletService.GetWalletDetails(userId)).Balance });
    }
}
