// TicketingApp.Services/DTOs/TeamDtos.cs
using System;
using System.Collections.Generic;

namespace TicketingApp.Services.DTOs;

public record TeamDto(
    int Id,
    int DepartmentId,
    string Name,
    string Description,
    DateTime CreatedAt,
    bool IsActive,
    string DepartmentName
);

public record TeamDetailsDto(
    int Id,
    int DepartmentId,
    string Name,
    string Description,
    DateTime CreatedAt,
    bool IsActive,
    string DepartmentName,
    ICollection<UserSummaryDto> Users,
    int ActiveTicketsCount
);

public record CreateTeamDto(int DepartmentId, string Name, string Description);

public record UpdateTeamDto(string Name, string Description, bool IsActive);
