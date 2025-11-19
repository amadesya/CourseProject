// Data/SeedData.cs
using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Models;

namespace SmartFix.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        await using var context = serviceProvider.GetRequiredService<SmartFixContext>();
        if (await context.Users.AnyAsync()) return;

        var users = new[]
        {
            new User { Name = "Администратор", Email = "admin@smartfix.com", Role = Role.Admin, IsVerified = true, Phone = "+7 (999) 111-22-33", Avatar = "data:image/svg+xml;..." },
            new User { Name = "Иван Петров", Email = "ivan@smartfix.com", Role = Role.Technician, IsVerified = true, Phone = "+7 (921) 555-44-33" },
            new User { Name = "Сергей Сидоров", Email = "sergey@smartfix.com", Role = Role.Technician, IsVerified = true },
            new User { Name = "Анна Кузнецова", Email = "anna@client.com", Role = Role.Client, IsVerified = true, Phone = "+7 (911) 123-45-67" },
            new User { Name = "Пётр Иванов", Email = "petr@client.com", Role = Role.Client, IsVerified = true }
        };
        context.Users.AddRange(users);
        await context.SaveChangesAsync();
    }
}