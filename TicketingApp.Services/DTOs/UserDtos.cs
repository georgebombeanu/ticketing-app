using System;
using System.Collections.Generic;

namespace TicketingApp.Services.DTOs;

public record UserDto(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLogin,
    ICollection<UserRoleDto> UserRoles
);

public record UserRoleDto(
    int RoleId,
    string RoleName,
    int? DepartmentId,
    string? DepartmentName,
    int? TeamId,
    string? TeamName,
    DateTime AssignedAt
);

public record CreateUserDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    ICollection<CreateUserRoleDto> UserRoles
);

public record CreateUserRoleDto(int RoleId, int? DepartmentId, int? TeamId);

public record UpdateUserDto(
    string FirstName,
    string LastName,
    bool IsActive,
    ICollection<CreateUserRoleDto> UserRoles
);
