public record TicketStatusDto(int Id, string Name, string Description);

public record CreateTicketStatusDto(string Name, string Description);

public record UpdateTicketStatusDto(string Name, string Description);
