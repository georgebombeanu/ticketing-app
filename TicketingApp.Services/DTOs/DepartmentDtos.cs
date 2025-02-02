// TicketingApp.Services/DTOs/DepartmentDtos.cs
using System;
using System.Collections.Generic;

namespace TicketingApp.Services.DTOs;

public record DepartmentDto(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAt,
    bool IsActive,
    ICollection<TeamSummaryDto>? Teams
);

public record DepartmentSummaryDto(int Id, string Name, string Description, bool IsActive);

public record CreateDepartmentDto(string Name, string Description);

public record UpdateDepartmentDto(string Name, string Description, bool IsActive);

// Light version of TeamDto to avoid circular references
public record TeamSummaryDto(int Id, string Name, string Description, bool IsActive);

public record DepartmentDetailsDto(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAt,
    bool IsActive,
    ICollection<TeamSummaryDto> Teams,
    ICollection<UserSummaryDto> Users,
    int ActiveTicketsCount
);

// Light version of UserDto to avoid circular references
public record UserSummaryDto(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    bool IsActive
);
