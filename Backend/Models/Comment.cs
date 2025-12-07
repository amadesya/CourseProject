public class Comment
{
    public int Id { get; set; }
    public int RepairRequestId { get; set; }
    public int UserId { get; set; }
    public string Text { get; set; } = null!;
    public DateTime Date { get; set; }

    public User User { get; set; } = null!;
}