using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using SmartFixApi.Models;

namespace SmartFixApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<RepairRequest> RepairRequests => Set<RepairRequest>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<User>(entity =>
    {
        entity.Property(u => u.Name).IsRequired();              
        entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
        entity.Property(u => u.PasswordHash).IsRequired(false);      

        entity.Property(u => u.Role)
              .HasDefaultValue(0);    

        entity.HasIndex(u => u.Email).IsUnique();
    });

    base.OnModelCreating(modelBuilder);
}
}