namespace SmartFix.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PasswordHash { get; set; } = null!;
    public Role Role { get; set; }
    public bool IsVerified { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }

    public ICollection<RepairRequest> ClientRequests { get; set; } = new List<RepairRequest>();
    public ICollection<RepairRequest> TechnicianRequests { get; set; } = new List<RepairRequest>();
}