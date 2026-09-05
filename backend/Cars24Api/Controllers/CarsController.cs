using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly CarService _carService;

    public CarsController(CarService carService)
    {
        _carService = carService;
    }

    [HttpGet]
    public async Task<ActionResult> SearchCars([FromQuery] CarSearchFilter filter)
    {
        var (cars, totalCount) = await _carService.SearchCars(filter);
        return Ok(new { cars, totalCount, page = filter.Page, pageSize = filter.PageSize });
    }

    [HttpGet("featured")]
    public async Task<ActionResult<List<CarResponse>>> GetFeaturedCars()
    {
        var cars = await _carService.GetFeaturedCars();
        return Ok(cars);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Car>> GetCar(string id)
    {
        var car = await _carService.GetCarById(id);
        if (car == null) return NotFound();
        return Ok(car);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Car>> CreateCar(CarCreateRequest request)
    {
        var sellerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerId)) return Unauthorized();

        var car = await _carService.CreateCar(request, sellerId);
        return CreatedAtAction(nameof(GetCar), new { id = car.Id }, car);
    }

    [Authorize]
    [HttpGet("my-listings")]
    public async Task<ActionResult<List<CarResponse>>> GetMyListings()
    {
        var sellerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerId)) return Unauthorized();

        var cars = await _carService.GetCarsBySeller(sellerId);
        return Ok(cars);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<Car>> UpdateCar(string id, CarCreateRequest request)
    {
        var car = await _carService.UpdateCar(id, request);
        if (car == null) return NotFound();
        return Ok(car);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCar(string id)
    {
        await _carService.DeleteCar(id);
        return NoContent();
    }
}
