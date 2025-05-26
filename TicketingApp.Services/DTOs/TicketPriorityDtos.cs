namespace TicketingApp.Services.DTOs;

public class TicketPriorityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateTicketPriorityDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateTicketPriorityDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}