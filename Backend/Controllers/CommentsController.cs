using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFixApi.Data;
using SmartFixApi.Models;

namespace SmartFixApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CommentsController(AppDbContext db) { _db = db; }

    [HttpGet("{requestId}")]
    public async Task<IActionResult> Get(int requestId)
    {
        var comments = await _db.Comments
            .Where(c => c.RepairRequestId == requestId)
            .Include(c => c.User)
            .OrderBy(c => c.Date)
            .Select(c => new
            {
                c.Id,
                c.RepairRequestId,
                c.UserId,
                c.Text,
                c.Date,
                UserName = c.User.Name
            })
            .ToListAsync();

        return Ok(comments);
    }

    // Создайте DTO класс
    public class CreateCommentDto
    {
        public int RepairRequestId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; } = null!;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCommentDto commentDto)
    {
        var comment = new Comment
        {
            RepairRequestId = commentDto.RepairRequestId,
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            Date = DateTime.UtcNow
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return Ok(comment);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Comment updatedComment)
    {
        if (id != updatedComment.Id) return BadRequest();

        var comment = await _db.Comments.FindAsync(id);
        if (comment == null) return NotFound();

        comment.Text = updatedComment.Text;
        comment.RepairRequestId = updatedComment.RepairRequestId;
        comment.UserId = updatedComment.UserId;

        _db.Entry(comment).State = EntityState.Modified;
        await _db.SaveChangesAsync();

        return Ok(comment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var comment = await _db.Comments.FindAsync(id);
        if (comment == null) return NotFound();

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Комментарий удалён", commentId = id });
    }
}
