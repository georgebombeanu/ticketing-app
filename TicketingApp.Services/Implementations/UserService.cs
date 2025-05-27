using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.Common.Logging;
using TicketingApp.Services.Common.Security;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByIdAsync), new { id });

            var user = await _unitOfWork.Users.GetUserWithRolesAsync(id);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive with ID: {UserId}", id);
                throw new NotFoundException("User not found");
            }

            var result = _mapper.Map<UserDto>(user);
            _logger.LogServiceMethodSuccess(nameof(GetByIdAsync), new { userId = id, hasRoles = result.UserRoles.Count });
            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetByIdAsync), new { id });
            throw;
        }
    }

    public async Task<UserDto> GetByEmailAsync(string email)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByEmailAsync), new { email });

            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogValidationError("User", "Email cannot be null or empty");
                throw new ValidationException("Email is required");
            }

            var user = await _unitOfWork.Users.GetUserByEmailAsync(email);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive with email: {Email}", email);
                throw new NotFoundException("User not found");
            }

            var result = _mapper.Map<UserDto>(user);
            _logger.LogServiceMethodSuccess(nameof(GetByEmailAsync), new { userId = result.Id, email });
            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetByEmailAsync), new { email });
            throw;
        }
    }

    public async Task<IEnumerable<UserDto>> GetAllActiveAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllActiveAsync));

            using (new PerformanceLogger(_logger, "GetAllActiveUsers"))
            {
                var users = await _unitOfWork.Users.GetActiveUsersAsync();
                var result = _mapper.Map<IEnumerable<UserDto>>(users);

                _logger.LogServiceMethodSuccess(nameof(GetAllActiveAsync), new { userCount = result.Count() });
                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetAllActiveAsync));
            throw;
        }
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(CreateAsync), new
            {
                email = createUserDto.Email,
                firstName = createUserDto.FirstName,
                lastName = createUserDto.LastName,
                roleCount = createUserDto.UserRoles.Count
            });

            // Validate input
            if (string.IsNullOrWhiteSpace(createUserDto.Email))
            {
                _logger.LogValidationError("User", "Email is required");
                throw new ValidationException("Email is required");
            }

            if (string.IsNullOrWhiteSpace(createUserDto.Password))
            {
                _logger.LogValidationError("User", "Password is required");
                throw new ValidationException("Password is required");
            }

            // Check email uniqueness
            if (!await _unitOfWork.Users.IsEmailUniqueAsync(createUserDto.Email))
            {
                _logger.LogValidationError("User", $"Email already exists: {createUserDto.Email}");
                throw new ValidationException("Email already exists");
            }

            _logger.LogInformation("Creating new user with email: {Email}", createUserDto.Email);

            // Create user entity
            var user = _mapper.Map<User>(createUserDto);
            user.PasswordHash = _passwordHasher.HashPassword(createUserDto.Password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            _logger.LogDebug("Adding user to database");
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("UserCreated", new { userId = user.Id, email = user.Email });

            // Add user roles
            if (createUserDto.UserRoles.Any())
            {
                _logger.LogDebug("Adding {RoleCount} roles to user {UserId}", createUserDto.UserRoles.Count, user.Id);

                foreach (var roleDto in createUserDto.UserRoles)
                {
                    // Validate role exists
                    var role = await _unitOfWork.Roles.GetByIdAsync(roleDto.RoleId);
                    if (role == null)
                    {
                        _logger.LogWarning("Invalid role ID {RoleId} for user {UserId}", roleDto.RoleId, user.Id);
                        throw new ValidationException($"Invalid role ID: {roleDto.RoleId}");
                    }

                    // Validate department if specified
                    if (roleDto.DepartmentId.HasValue)
                    {
                        var department = await _unitOfWork.Departments.GetByIdAsync(roleDto.DepartmentId.Value);
                        if (department == null || !department.IsActive)
                        {
                            _logger.LogWarning("Invalid department ID {DepartmentId} for user {UserId}",
                                roleDto.DepartmentId.Value, user.Id);
                            throw new ValidationException($"Invalid department ID: {roleDto.DepartmentId.Value}");
                        }
                    }

                    // Validate team if specified
                    if (roleDto.TeamId.HasValue)
                    {
                        var team = await _unitOfWork.Teams.GetByIdAsync(roleDto.TeamId.Value);
                        if (team == null || !team.IsActive)
                        {
                            _logger.LogWarning("Invalid team ID {TeamId} for user {UserId}",
                                roleDto.TeamId.Value, user.Id);
                            throw new ValidationException($"Invalid team ID: {roleDto.TeamId.Value}");
                        }

                        // Ensure team belongs to the specified department
                        if (roleDto.DepartmentId.HasValue && team.DepartmentId != roleDto.DepartmentId.Value)
                        {
                            _logger.LogWarning("Team {TeamId} does not belong to department {DepartmentId}",
                                roleDto.TeamId.Value, roleDto.DepartmentId.Value);
                            throw new ValidationException("Team does not belong to the specified department");
                        }
                    }

                    user.UserRoles.Add(new UserRole
                    {
                        UserId = user.Id,
                        RoleId = roleDto.RoleId,
                        DepartmentId = roleDto.DepartmentId,
                        TeamId = roleDto.TeamId,
                        AssignedAt = DateTime.UtcNow,
                    });
                }

                await _unitOfWork.CompleteAsync();
                _logger.LogBusinessEvent("UserRolesAssigned", new
                {
                    userId = user.Id,
                    roleCount = createUserDto.UserRoles.Count
                });
            }

            var result = _mapper.Map<UserDto>(await _unitOfWork.Users.GetUserWithRolesAsync(user.Id));
            _logger.LogServiceMethodSuccess(nameof(CreateAsync), new
            {
                userId = result.Id,
                email = result.Email,
                roleCount = result.UserRoles.Count
            });

            return result;
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(CreateAsync), new
            {
                email = createUserDto.Email,
                firstName = createUserDto.FirstName,
                lastName = createUserDto.LastName
            });
            throw;
        }
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto updateUserDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(UpdateAsync), new
            {
                id,
                firstName = updateUserDto.FirstName,
                lastName = updateUserDto.LastName,
                isActive = updateUserDto.IsActive,
                roleCount = updateUserDto.UserRoles.Count
            });

            var user = await _unitOfWork.Users.GetUserWithRolesAsync(id);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive for update: {UserId}", id);
                throw new NotFoundException("User not found");
            }

            _logger.LogInformation("Updating user {UserId} ({Email})", user.Id, user.Email);

            // Store original values for logging
            var originalName = $"{user.FirstName} {user.LastName}";
            var originalActiveStatus = user.IsActive;
            var originalRoleCount = user.UserRoles.Count;

            // Update basic properties
            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.IsActive = updateUserDto.IsActive;

            // Log status change if applicable
            if (originalActiveStatus != updateUserDto.IsActive)
            {
                _logger.LogBusinessEvent("UserStatusChanged", new
                {
                    userId = id,
                    from = originalActiveStatus,
                    to = updateUserDto.IsActive
                });
            }

            // Remove existing roles
            _logger.LogDebug("Removing {RoleCount} existing roles for user {UserId}", originalRoleCount, id);
            user.UserRoles.Clear();

            // Add new roles with validation
            if (updateUserDto.UserRoles.Any())
            {
                _logger.LogDebug("Adding {RoleCount} new roles to user {UserId}", updateUserDto.UserRoles.Count, id);

                foreach (var roleDto in updateUserDto.UserRoles)
                {
                    // Validate role, department, and team (same validation as Create)
                    var role = await _unitOfWork.Roles.GetByIdAsync(roleDto.RoleId);
                    if (role == null)
                    {
                        _logger.LogWarning("Invalid role ID {RoleId} for user {UserId}", roleDto.RoleId, id);
                        throw new ValidationException($"Invalid role ID: {roleDto.RoleId}");
                    }

                    if (roleDto.DepartmentId.HasValue)
                    {
                        var department = await _unitOfWork.Departments.GetByIdAsync(roleDto.DepartmentId.Value);
                        if (department == null || !department.IsActive)
                        {
                            _logger.LogWarning("Invalid department ID {DepartmentId} for user {UserId}",
                                roleDto.DepartmentId.Value, id);
                            throw new ValidationException($"Invalid department ID: {roleDto.DepartmentId.Value}");
                        }
                    }

                    if (roleDto.TeamId.HasValue)
                    {
                        var team = await _unitOfWork.Teams.GetByIdAsync(roleDto.TeamId.Value);
                        if (team == null || !team.IsActive)
                        {
                            _logger.LogWarning("Invalid team ID {TeamId} for user {UserId}",
                                roleDto.TeamId.Value, id);
                            throw new ValidationException($"Invalid team ID: {roleDto.TeamId.Value}");
                        }

                        if (roleDto.DepartmentId.HasValue && team.DepartmentId != roleDto.DepartmentId.Value)
                        {
                            _logger.LogWarning("Team {TeamId} does not belong to department {DepartmentId}",
                                roleDto.TeamId.Value, roleDto.DepartmentId.Value);
                            throw new ValidationException("Team does not belong to the specified department");
                        }
                    }

                    user.UserRoles.Add(new UserRole
                    {
                        UserId = user.Id,
                        RoleId = roleDto.RoleId,
                        DepartmentId = roleDto.DepartmentId,
                        TeamId = roleDto.TeamId,
                        AssignedAt = DateTime.UtcNow,
                    });
                }
            }

            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("UserUpdated", new
            {
                userId = id,
                originalName,
                newName = $"{user.FirstName} {user.LastName}",
                statusChanged = originalActiveStatus != user.IsActive,
                roleCountChanged = originalRoleCount != user.UserRoles.Count
            });

            var result = _mapper.Map<UserDto>(await _unitOfWork.Users.GetUserWithRolesAsync(user.Id));
            _logger.LogServiceMethodSuccess(nameof(UpdateAsync), new
            {
                userId = result.Id,
                email = result.Email,
                roleCount = result.UserRoles.Count
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(UpdateAsync), new
            {
                id,
                firstName = updateUserDto.FirstName,
                lastName = updateUserDto.LastName
            });
            throw;
        }
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(DeactivateAsync), new { id });

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found for deactivation: {UserId}", id);
                throw new NotFoundException("User not found");
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("User {UserId} is already inactive", id);
                return true; // Already inactive, consider it successful
            }

            _logger.LogInformation("Deactivating user {UserId} ({Email})", user.Id, user.Email);

            user.IsActive = false;
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("UserDeactivated", new { userId = id, email = user.Email });
            _logger.LogServiceMethodSuccess(nameof(DeactivateAsync), new { userId = id });

            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(DeactivateAsync), new { id });
            throw;
        }
    }

    public async Task<IEnumerable<UserDto>> GetUsersByDepartmentAsync(int departmentId)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetUsersByDepartmentAsync), new { departmentId });

            using (new PerformanceLogger(_logger, "GetUsersByDepartment", new { departmentId }))
            {
                var users = await _unitOfWork.Users.GetUsersByDepartmentAsync(departmentId);
                var result = _mapper.Map<IEnumerable<UserDto>>(users);

                _logger.LogServiceMethodSuccess(nameof(GetUsersByDepartmentAsync), new
                {
                    departmentId,
                    userCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetUsersByDepartmentAsync), new { departmentId });
            throw;
        }
    }

    public async Task<IEnumerable<UserDto>> GetUsersByTeamAsync(int teamId)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetUsersByTeamAsync), new { teamId });

            using (new PerformanceLogger(_logger, "GetUsersByTeam", new { teamId }))
            {
                var users = await _unitOfWork.Users.GetUsersByTeamAsync(teamId);
                var result = _mapper.Map<IEnumerable<UserDto>>(users);

                _logger.LogServiceMethodSuccess(nameof(GetUsersByTeamAsync), new
                {
                    teamId,
                    userCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetUsersByTeamAsync), new { teamId });
            throw;
        }
    }
}