using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Data;
using SmartFix.Api.Models;

namespace SmartFix.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // ← важно, чтобы работал JWT
public class RequestsController : ControllerBase
{
    private readonly SmartFixContext _db;

    public RequestsController(SmartFixContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetRequests()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);

        if (user == null) return NotFound();

        IQueryable<RepairRequest> query = _db.RepairRequests.Include(r => r.Client).Include(r => r.Technician).Include(r => r.Comments);

        query = user.Role switch
        {
            Role.Admin => query,
            Role.Technician => query.Where(r => r.TechnicianId == userId || r.Status == RequestStatus.New),
            Role.Client => query.Where(r => r.ClientId == userId),
            _ => query.Where(r => false)
        };

        var requests = await query.OrderByDescending(r => r.Id).ToListAsync();
        return Ok(requests);
    }
}