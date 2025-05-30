public class TicketCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTicketCategoryDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateTicketCategoryDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
}