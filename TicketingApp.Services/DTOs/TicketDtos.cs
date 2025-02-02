public record TicketDto(
    int Id,
    string Title,
    string Description,
    int CategoryId,
    string CategoryName,
    int PriorityId,
    string PriorityName,
    int StatusId,
    string StatusName,
    int CreatedById,
    string CreatedByName,
    int? AssignedToId,
    string AssignedToName,
    int DepartmentId,
    string DepartmentName,
    int? TeamId,
    string TeamName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? ClosedAt,
    ICollection<TicketCommentDto> Comments,
    ICollection<TicketAttachmentDto> Attachments
);

public record CreateTicketDto(
    string Title,
    string Description,
    int CategoryId,
    int PriorityId,
    int DepartmentId,
    int? TeamId,
    int? AssignedToId
);

public record UpdateTicketDto(
    string Title,
    string Description,
    int CategoryId,
    int PriorityId,
    int StatusId,
    int? AssignedToId,
    int? TeamId
);
