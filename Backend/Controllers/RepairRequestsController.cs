using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFixApi.Data;
using SmartFixApi.Models;

namespace SmartFixApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RepairRequestsController : ControllerBase
{
    private readonly AppDbContext _db;
    public RepairRequestsController(AppDbContext db) => _db = db;

    [HttpGet]
    [HttpGet]
    public async Task<IEnumerable<RepairRequestDto>> GetRepairRequests()
    {
        var requests = await _db.RepairRequests.ToListAsync();
        var users = await _db.Users.ToListAsync();

        var result = requests.Select(r => new RepairRequestDto
        {
            Id = r.Id,
            ClientId = r.ClientId,
            ClientName = users.FirstOrDefault(u => u.Id == r.ClientId)?.Name ?? "Неизвестно",
            TechnicianId = r.TechnicianId,
            TechnicianName = r.TechnicianId.HasValue
                ? users.FirstOrDefault(u => u.Id == r.TechnicianId.Value)?.Name
                : "Не назначен",
            Device = r.Device,
            IssueDescription = r.IssueDescription,
            Status = r.Status,
            CreatedAt = r.CreatedAt,
            Comments = r.Comments
        }).ToList();

        return result;
    }
    [HttpGet("technician/{id}")]
    public async Task<IEnumerable<RepairRequestDto>> GetByTechnician(int id)
    {
        var requests = await _db.RepairRequests
            .Where(r => r.TechnicianId == id)
            .ToListAsync();

        var users = await _db.Users.ToListAsync();

        return requests.Select(r => new RepairRequestDto
        {
            Id = r.Id,
            ClientId = r.ClientId,
            ClientName = users.FirstOrDefault(u => u.Id == r.ClientId)?.Name ?? "Неизвестно",
            TechnicianId = r.TechnicianId,
            TechnicianName = r.TechnicianId.HasValue
                ? users.FirstOrDefault(u => u.Id == r.TechnicianId.Value)?.Name
                : "Не назначен",
            Device = r.Device,
            IssueDescription = r.IssueDescription,
            Status = r.Status,
            CreatedAt = r.CreatedAt,
            Comments = r.Comments
        });
    }

    [HttpPost]
    public async Task<ActionResult<RepairRequest>> CreateRepairRequest([FromBody] RepairRequestCreateDto dto)
    {
        if (!await _db.Users.AnyAsync(u => u.Id == dto.ClientId))
            return BadRequest("Client not found");

        if (dto.TechnicianId.HasValue)
        {
            if (!await _db.Users.AnyAsync(u => u.Id == dto.TechnicianId.Value))
                return BadRequest("Technician not found");
        }

        var request = new RepairRequest
        {
            ClientId = dto.ClientId,
            TechnicianId = dto.TechnicianId,
            Device = dto.Device,
            IssueDescription = dto.IssueDescription,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.RepairRequests.Add(request);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRepairRequests),
                            new { id = request.Id },
                            request);
    }

[HttpPut("{id}")]
public async Task<IActionResult> UpdateRepairRequest(int id, [FromBody] RepairRequestUpdateDto dto)
{
    var request = await _db.RepairRequests.FindAsync(id);

    if (request == null)
        return NotFound($"Repair request with id={id} not found.");

    request.Device = dto.Device;
    request.IssueDescription = dto.IssueDescription;
    request.Status = dto.Status;

    if (dto.TechnicianId.HasValue)
    {
        bool technicianExists = await _db.Users.AnyAsync(u => u.Id == dto.TechnicianId.Value && u.Role == 1);
        if (!technicianExists)
            return BadRequest("Technician not found or user is not a technician.");

        request.TechnicianId = dto.TechnicianId;
    }

    await _db.SaveChangesAsync();

    // Вместо NoContent() возвращаем обновленную заявку
    return Ok(new { 
        message = "Request updated successfully",
        id = request.Id 
    });
}
}

