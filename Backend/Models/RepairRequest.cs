namespace SmartFixApi.Models;

public class RepairRequest
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public int? TechnicianId { get; set; } 
    public string Device { get; set; } = null!;
    public string IssueDescription { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }  

    public User Client { get; set; } = null!;
    public User? Technician { get; set; }   
    public List<Comment> Comments { get; set; } = new();
}
