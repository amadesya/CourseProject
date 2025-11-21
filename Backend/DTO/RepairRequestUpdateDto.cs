public class RepairRequestUpdateDto
{
    public int? TechnicianId { get; set; }
    public string Device { get; set; } = null!;
    public string IssueDescription { get; set; } = null!;
    public string Status { get; set; } = null!;
}
