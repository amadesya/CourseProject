namespace SmartFixApi.Models;

public class Comment
{
    public int Id { get; set; }
    public int RepairRequestId { get; set; }
    public string Author { get; set; } = null!;
    public string Text { get; set; } = null!;
    public DateTime Date { get; set; } 
}
