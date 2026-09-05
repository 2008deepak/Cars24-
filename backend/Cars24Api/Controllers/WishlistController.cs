using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly WishlistService _wishlistService;

    public WishlistController(WishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    [HttpPost("toggle")]
    public async Task<ActionResult<WishlistResponse>> Toggle([FromBody] WishlistToggleRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _wishlistService.ToggleWishlist(userId, request.CarId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<WishlistCarResponse>>> GetWishlist()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var items = await _wishlistService.GetUserWishlist(userId);
        return Ok(items);
    }

    [HttpGet("check/{carId}")]
    public async Task<ActionResult<WishlistResponse>> CheckStatus(string carId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var isInWishlist = await _wishlistService.IsInWishlist(userId, carId);
        var count = await _wishlistService.GetUserWishlistCount(userId);
        return Ok(new WishlistResponse { IsInWishlist = isInWishlist, TotalCount = count });
    }

    [HttpGet("count")]
    public async Task<ActionResult<object>> GetCount()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var count = await _wishlistService.GetUserWishlistCount(userId);
        return Ok(new { count });
    }
}
