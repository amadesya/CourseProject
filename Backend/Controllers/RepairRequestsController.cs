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
            Status = "New",
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

        return Ok(new { 
            message = "Request updated successfully",
            id = request.Id 
        });
    }

    // НОВЫЙ МЕТОД ДЛЯ ИМПОРТА
    [HttpPost("import")]
    public async Task<ActionResult<ImportResult>> ImportRequests([FromBody] List<RepairRequestImportDto> requests)
    {
        try
        {
            int imported = 0;
            int skipped = 0;
            var errors = new List<string>();

            foreach (var dto in requests)
            {
                // Валидация обязательных полей
                if (dto.ClientId <= 0)
                {
                    errors.Add($"Пропущена запись: не указан ID клиента");
                    skipped++;
                    continue;
                }

                if (string.IsNullOrEmpty(dto.Device))
                {
                    errors.Add($"Пропущена запись (ClientId={dto.ClientId}): не указано устройство");
                    skipped++;
                    continue;
                }

                // Проверка существования клиента
                if (!await _db.Users.AnyAsync(u => u.Id == dto.ClientId))
                {
                    errors.Add($"Пропущена запись: клиент с ID {dto.ClientId} не найден");
                    skipped++;
                    continue;
                }

                // Проверка существования мастера (если указан)
                if (dto.TechnicianId.HasValue)
                {
                    if (!await _db.Users.AnyAsync(u => u.Id == dto.TechnicianId.Value && u.Role == 1))
                    {
                        errors.Add($"Пропущена запись: мастер с ID {dto.TechnicianId} не найден");
                        skipped++;
                        continue;
                    }
                }

                var request = new RepairRequest
                {
                    ClientId = dto.ClientId,
                    TechnicianId = dto.TechnicianId,
                    Device = dto.Device,
                    IssueDescription = dto.IssueDescription ?? "",
                    Status = string.IsNullOrEmpty(dto.Status) ? "New" : dto.Status,
                    CreatedAt = dto.CreatedAt ?? DateTime.UtcNow,
                    Comments = new List<Comment>()
                };

                _db.RepairRequests.Add(request);
                imported++;
            }

            // Сохраняем все изменения одной транзакцией
            if (imported > 0)
            {
                await _db.SaveChangesAsync();
            }

            return Ok(new ImportResult
            {
                Imported = imported,
                Skipped = skipped,
                Errors = errors
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Ошибка импорта", error = ex.Message });
        }
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRepairRequest(int id)
    {
        var request = await _db.RepairRequests
            .Include(r => r.Comments)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
            return NotFound($"Repair request with id={id} not found.");

        if (request.Comments.Any())
            _db.Comments.RemoveRange(request.Comments);

        _db.RepairRequests.Remove(request);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Repair request deleted successfully", id });
    }
}

// DTO для импорта
public class RepairRequestImportDto
{
    public int ClientId { get; set; }
    public int? TechnicianId { get; set; }
    public string Device { get; set; } = string.Empty;
    public string? IssueDescription { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? Comments { get; set; }
}

// Результат импорта
public class ImportResult
{
    public int Imported { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
}

