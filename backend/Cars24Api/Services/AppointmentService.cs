using MongoDB.Driver;
using Cars24Api.Models;

namespace Cars24Api.Services;

public class AppointmentService
{
    private readonly MongoDbContext _context;

    public AppointmentService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<AppointmentResponse> CreateAppointment(string userId, AppointmentCreateRequest request)
    {
        var appointment = new Appointment
        {
            UserId = userId,
            CarId = request.CarId,
            Date = request.Date,
            Time = request.Time,
            Location = request.Location,
            Notes = request.Notes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        if (_context.IsMongoAvailable)
            await _context.Appointments.InsertOneAsync(appointment);
        else
        {
            appointment.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
            _context.InMemoryAppointments.Add(appointment);
        }

        return await MapToResponse(appointment);
    }

    public async Task<List<AppointmentResponse>> GetUserAppointments(string userId)
    {
        List<Appointment> appointments;
        if (_context.IsMongoAvailable)
            appointments = await _context.Appointments
                .Find(a => a.UserId == userId)
                .SortByDescending(a => a.CreatedAt)
                .ToListAsync();
        else
            appointments = _context.InMemoryAppointments
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToList();

        var responses = new List<AppointmentResponse>();
        foreach (var apt in appointments)
            responses.Add(await MapToResponse(apt));
        return responses;
    }

    public async Task<AppointmentResponse?> GetAppointmentById(string id)
    {
        Appointment? appointment;
        if (_context.IsMongoAvailable)
            appointment = await _context.Appointments.Find(a => a.Id == id).FirstOrDefaultAsync();
        else
            appointment = _context.InMemoryAppointments.FirstOrDefault(a => a.Id == id);

        if (appointment == null) return null;
        return await MapToResponse(appointment);
    }

    public async Task<AppointmentResponse> UpdateStatus(string id, string status)
    {
        if (_context.IsMongoAvailable)
        {
            var update = Builders<Appointment>.Update.Set(a => a.Status, status);
            await _context.Appointments.UpdateOneAsync(a => a.Id == id, update);
        }
        else
        {
            var apt = _context.InMemoryAppointments.FirstOrDefault(a => a.Id == id);
            if (apt != null) apt.Status = status;
        }

        var appt = _context.IsMongoAvailable
            ? await _context.Appointments.Find(a => a.Id == id).FirstOrDefaultAsync()
            : _context.InMemoryAppointments.FirstOrDefault(a => a.Id == id);

        return await MapToResponse(appt!);
    }

    public async Task DeleteAppointment(string id)
    {
        if (_context.IsMongoAvailable)
            await _context.Appointments.DeleteOneAsync(a => a.Id == id);
        else
            _context.InMemoryAppointments.RemoveAll(a => a.Id == id);
    }

    private async Task<AppointmentResponse> MapToResponse(Appointment appointment)
    {
        Car? car;
        if (_context.IsMongoAvailable)
            car = await _context.Cars.Find(c => c.Id == appointment.CarId).FirstOrDefaultAsync();
        else
            car = _context.InMemoryCars.FirstOrDefault(c => c.Id == appointment.CarId);

        return new AppointmentResponse
        {
            Id = appointment.Id,
            Car = car != null ? new CarResponse
            {
                Id = car.Id,
                Title = car.Title,
                Brand = car.Brand,
                Model = car.Model,
                Year = car.Year,
                Price = car.Price,
                ImageUrl = car.ImageUrl,
                Location = car.Location
            } : null,
            Date = appointment.Date,
            Time = appointment.Time,
            Location = appointment.Location,
            Status = appointment.Status,
            Notes = appointment.Notes,
            CreatedAt = appointment.CreatedAt
        };
    }
}
