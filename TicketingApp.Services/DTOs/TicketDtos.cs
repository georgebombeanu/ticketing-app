using System;
using System.Collections.Generic;

namespace TicketingApp.Services.DTOs;

public class TicketDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int PriorityId { get; set; }
    public string PriorityName { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public ICollection<TicketCommentDto> Comments { get; set; } = new List<TicketCommentDto>();
    public ICollection<TicketAttachmentDto> Attachments { get; set; } = new List<TicketAttachmentDto>();
}

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int PriorityId { get; set; }
    public int DepartmentId { get; set; }
    public int? TeamId { get; set; }
    public int? AssignedToId { get; set; }
}

public class UpdateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int PriorityId { get; set; }
    public int StatusId { get; set; }
    public int? AssignedToId { get; set; }
    public int? TeamId { get; set; }
}