namespace TicketingApp.Services.DTOs;

public class TicketStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateTicketStatusDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateTicketStatusDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}