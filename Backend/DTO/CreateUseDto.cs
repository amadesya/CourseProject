public class CreateUserDto
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public int Role { get; set; } = 0;  
    public bool? IsVerified { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
}
