using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFixApi.Data;
using SmartFixApi.Models;

namespace SmartFixApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase {
    private readonly AppDbContext _db;
    public CommentsController(AppDbContext db){ _db = db; }

    [HttpGet("{requestId}")]
    public async Task<IEnumerable<Comment>> Get(int requestId) =>
        await _db.Comments.Where(c => c.RepairRequestId == requestId).ToListAsync();
}
