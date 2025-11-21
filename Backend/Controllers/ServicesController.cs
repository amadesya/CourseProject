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
}
