public record TicketCommentDto(
    int Id,
    int TicketId,
    int UserId,
    string UserName,
    string Comment,
    DateTime CreatedAt,
    bool IsInternal
);

public record CreateTicketCommentDto(int TicketId, string Comment, bool IsInternal);
