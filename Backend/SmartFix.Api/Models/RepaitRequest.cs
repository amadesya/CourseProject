namespace SmartFix.Api.Models;

public class RepairRequest
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public User Client { get; set; } = null!;

    public int? TechnicianId { get; set; }
    public User? Technician { get; set; }

    public string Device { get; set; } = null!;
    public string IssueDescription { get; set; } = null!;
    public RequestStatus Status { get; set; } = RequestStatus.New;
    public string CreatedAt { get; set; } = DateTime.Today.ToString("yyyy-MM-dd");

    public List<Comment> Comments { get; set; } = new();
}