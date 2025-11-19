// Data/SmartFixContext.cs
using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Models;

namespace SmartFix.Api.Data;

public class SmartFixContext : DbContext
{
    public SmartFixContext(DbContextOptions<SmartFixContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RepairRequest> RepairRequests => Set<RepairRequest>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Service> Services => Set<Service>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // === Связь RepairRequest → Client (обязательная) ===
        modelBuilder.Entity<RepairRequest>()
            .HasOne(r => r.Client)
            .WithMany(u => u.ClientRequests)
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // === Связь RepairRequest → Technician (необязательная) ===
        modelBuilder.Entity<RepairRequest>()
            .HasOne(r => r.Technician)
            .WithMany(u => u.TechnicianRequests)
            .HasForeignKey(r => r.TechnicianId)
            .OnDelete(DeleteBehavior.SetNull);

        // === Комментарии ===
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.RepairRequest)
            .WithMany(r => r.Comments)
            .HasForeignKey(c => c.RepairRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}