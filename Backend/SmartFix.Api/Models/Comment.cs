namespace SmartFix.Api.Models;

public class Comment
{
    public int Id { get; set; }
    public int RepairRequestId { get; set; }
    public RepairRequest RepairRequest { get; set; } = null!;
    public string Author { get; set; } = null!;
    public string Text { get; set; } = null!;
    public string Date { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
}