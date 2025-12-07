using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFixApi.Data;
using SmartFixApi.Models;

namespace SmartFixApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase {
    private readonly AppDbContext _db;
    public ServicesController(AppDbContext db){ _db = db; }

    [HttpGet]
    public async Task<IEnumerable<Service>> Get() => await _db.Services.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Service>> GetById(int id)
    {
        var service = await _db.Services.FindAsync(id);
        if (service == null) return NotFound();
        return service;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await _db.Services.FindAsync(id);
        if (service == null) return NotFound();
        _db.Services.Remove(service);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Услуга успешно удалена", serviceId = id });
    }

    public class ServiceDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public decimal Price { get; set; }
    }

    [HttpPost]
    public async Task<ActionResult<Service>> Create(ServiceDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price
        };
        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ServiceDto dto)
    {
        var service = await _db.Services.FindAsync(id);
        if (service == null) return NotFound();

        service.Name = dto.Name;
        service.Description = dto.Description;
        service.Price = dto.Price;

        _db.Entry(service).State = EntityState.Modified;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
