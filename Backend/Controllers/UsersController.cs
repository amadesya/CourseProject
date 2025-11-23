using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFixApi.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SmartFixApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new User
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                PasswordHash = u.PasswordHash,
                Role = u.Role,
                IsVerified = u.IsVerified,
                Phone = u.Phone,   
                Avatar = u.Avatar  
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("technicians")]
    public async Task<IActionResult> GetTechnicians()
    {
        var technicians = await _context.Users
            .Where(u => u.Role == 1) 
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsVerified = u.IsVerified,
                Phone = u.Phone,
                Avatar = u.Avatar
            })
            .ToListAsync();

        return Ok(technicians);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
        {
            return NotFound(new { message = "Пользователь не найден" });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsVerified = user.IsVerified,
            Phone = user.Phone,
            Avatar = user.Avatar
        };

        return Ok(userDto);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var currentUserRole = int.Parse(User.FindFirst(ClaimTypes.Role)?.Value ?? "0");
        
        if (currentUserId != id && currentUserRole != 2) 
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
        {
            return NotFound(new { message = "Пользователь не найден" });
        }

        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            user.Name = dto.Name;
        }

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email && u.Id != id);
            
            if (emailExists)
            {
                return BadRequest(new { message = "Email уже используется" });
            }
            
            user.Email = dto.Email;
        }

        if (!string.IsNullOrWhiteSpace(dto.Phone))
        {
            user.Phone = dto.Phone;
        }

        if (!string.IsNullOrWhiteSpace(dto.Avatar))
        {
            user.Avatar = dto.Avatar;
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        try
        {
            await _context.SaveChangesAsync();
            
            var updatedUserDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsVerified = user.IsVerified,
                Phone = user.Phone,
                Avatar = user.Avatar
            };

            return Ok(updatedUserDto);
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении пользователя" });
        }
    }
}