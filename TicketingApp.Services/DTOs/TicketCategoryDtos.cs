public record TicketCategoryDto(int Id, string Name, string Description, bool IsActive);

public record CreateTicketCategoryDto(string Name, string Description);

public record UpdateTicketCategoryDto(string Name, string Description, bool IsActive);
