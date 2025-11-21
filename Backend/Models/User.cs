public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;       
    public string Email { get; set; } = null!;
    public string? PasswordHash { get; set; }         
    public int Role { get; set; }
    public bool IsVerified { get; set; }
    public string? Phone { get; set; }           
    public string? Avatar { get; set; }           
}