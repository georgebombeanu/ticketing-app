using System;
using System.Collections.Generic;

namespace TicketingApp.Services.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public ICollection<UserRoleDto> UserRoles { get; set; } = new List<UserRoleDto>();
}

public class UserRoleDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
    public DateTime AssignedAt { get; set; }
}

public class CreateUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ICollection<CreateUserRoleDto> UserRoles { get; set; } = new List<CreateUserRoleDto>();
}

public class CreateUserRoleDto
{
    public int RoleId { get; set; }
    public int? DepartmentId { get; set; }
    public int? TeamId { get; set; }
}

public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public ICollection<CreateUserRoleDto> UserRoles { get; set; } = new List<CreateUserRoleDto>();
}