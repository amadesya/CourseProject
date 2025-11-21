public class RepairRequestCreateDto
{
    public int ClientId { get; set; }
    public int? TechnicianId { get; set; }
    public string Device { get; set; } = null!;
    public string IssueDescription { get; set; } = null!;
}
