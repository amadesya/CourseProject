// SmartFix.Api/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartFix.Api.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SmartFix.Api.Models;  // вместо SmartFix.Domain

namespace SmartFix.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SmartFixContext _db;
    private readonly IConfiguration _config;

    public AuthController(SmartFixContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !user.IsVerified)
            return Unauthorized("Неверный email или пользователь не подтверждён");

        // В реальном проекте тут BCrypt! Пока просто проверяем любой пароль
        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.Id, user.Name, user.Email, user.Role } });
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginDto(string Email, string Password);