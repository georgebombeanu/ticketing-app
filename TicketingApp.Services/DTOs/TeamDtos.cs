using System;
using System.Collections.Generic;

namespace TicketingApp.Services.DTOs;

public class TeamDto
{
    public int Id { get; set; }
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
}

public class TeamDetailsDto
{
    public int Id { get; set; }
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public ICollection<UserSummaryDto> Users { get; set; } = new List<UserSummaryDto>();
    public int ActiveTicketsCount { get; set; }
}

public class CreateTeamDto
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateTeamDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}