public class TicketStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
}

public class CreateTicketStatusDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; } = "#4caf50";
    public string Icon { get; set; } = "Schedule";
}

public class UpdateTicketStatusDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
}