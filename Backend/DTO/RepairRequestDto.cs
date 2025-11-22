using SmartFixApi.Models;

public class RepairRequestDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public int? TechnicianId { get; set; }
    public string? TechnicianName { get; set; }
    public string Device { get; set; } = null!;
    public string IssueDescription { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public List<Comment> Comments { get; set; } = new();
}
