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
    public async Task<IEnumerable<RepairRequest>> GetRepairRequestById() => await _db.RepairRequests.ToListAsync();

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

        return CreatedAtAction(nameof(GetRepairRequestById),
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

        return NoContent();
    }
}

