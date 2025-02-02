public record TicketAttachmentDto(
    int Id,
    int TicketId,
    int UserId,
    string UserName,
    string FileName,
    string FilePath,
    DateTime UploadedAt
);

public record CreateTicketAttachmentDto(int TicketId, string FileName, string FilePath);
