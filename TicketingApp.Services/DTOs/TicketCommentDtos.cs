using System;

namespace TicketingApp.Services.DTOs;

public class TicketCommentDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsInternal { get; set; }
}

public class CreateTicketCommentDto
{
    public int TicketId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsInternal { get; set; }

    public CreateTicketCommentDto(int ticketId, string comment, bool isInternal)
    {
        TicketId = ticketId;
        Comment = comment;
        IsInternal = isInternal;
    }
}