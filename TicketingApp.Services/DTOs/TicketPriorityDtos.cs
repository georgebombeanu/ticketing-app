public record TicketPriorityDto(int Id, string Name, string Description);

public record CreateTicketPriorityDto(string Name, string Description);

public record UpdateTicketPriorityDto(string Name, string Description);
