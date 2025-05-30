public class TicketPriorityDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
}

public class CreateTicketPriorityDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; } = "#ff9800";
    public string Icon { get; set; } = "PriorityHigh";
}

public class UpdateTicketPriorityDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
}