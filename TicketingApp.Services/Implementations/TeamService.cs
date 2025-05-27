using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.Common.Logging;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class TeamService : ITeamService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<TeamService> _logger;

    public TeamService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<TeamService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TeamDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByIdAsync), new { id });

            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null || !team.IsActive)
            {
                _logger.LogWarning("Team not found or inactive with ID: {TeamId}", id);
                throw new NotFoundException("Team not found");
            }

            var result = _mapper.Map<TeamDto>(team);
            _logger.LogServiceMethodSuccess(nameof(GetByIdAsync), new
            {
                teamId = id,
                name = result.Name,
                departmentId = result.DepartmentId,
                departmentName = result.DepartmentName
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetByIdAsync), new { id });
            throw;
        }
    }

    public async Task<TeamDetailsDto> GetDetailsByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetDetailsByIdAsync), new { id });

            using (new PerformanceLogger(_logger, "GetTeamDetails", new { teamId = id }))
            {
                var teamWithUsers = await _unitOfWork.Teams.GetTeamWithUsersAsync(id);
                if (teamWithUsers == null || !teamWithUsers.IsActive)
                {
                    _logger.LogWarning("Team not found or inactive for details: {TeamId}", id);
                    throw new NotFoundException("Team not found");
                }

                var teamWithTickets = await _unitOfWork.Teams.GetTeamWithTicketsAsync(id);

                // Combine the data
                teamWithUsers.Tickets = teamWithTickets.Tickets;

                var result = _mapper.Map<TeamDetailsDto>(teamWithUsers);

                _logger.LogServiceMethodSuccess(nameof(GetDetailsByIdAsync), new
                {
                    teamId = id,
                    name = result.Name,
                    departmentName = result.DepartmentName,
                    userCount = result.Users.Count,
                    activeTicketsCount = result.ActiveTicketsCount
                });

                return result;
            }
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetDetailsByIdAsync), new { id });
            throw;
        }
    }

    public async Task<IEnumerable<TeamDto>> GetAllActiveAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllActiveAsync));

            using (new PerformanceLogger(_logger, "GetAllActiveTeams"))
            {
                var teams = await _unitOfWork.Teams.GetActiveTeamsAsync();
                var result = _mapper.Map<IEnumerable<TeamDto>>(teams);

                _logger.LogServiceMethodSuccess(nameof(GetAllActiveAsync), new
                {
                    teamCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetAllActiveAsync));
            throw;
        }
    }

    public async Task<TeamDto> CreateAsync(CreateTeamDto createTeamDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(CreateAsync), new
            {
                name = createTeamDto.Name,
                description = createTeamDto.Description,
                departmentId = createTeamDto.DepartmentId
            });

            // Validate input
            if (string.IsNullOrWhiteSpace(createTeamDto.Name))
            {
                _logger.LogValidationError("Team", "Name is required");
                throw new ValidationException("Team name is required");
            }

            // Validate department exists and is active
            var department = await _unitOfWork.Departments.GetByIdAsync(createTeamDto.DepartmentId);
            if (department == null || !department.IsActive)
            {
                _logger.LogValidationError("Team", $"Invalid department ID: {createTeamDto.DepartmentId}");
                throw new ValidationException("Invalid department");
            }

            // Check name uniqueness within department
            if (!await IsTeamNameUniqueInDepartmentAsync(createTeamDto.Name, createTeamDto.DepartmentId))
            {
                _logger.LogValidationError("Team",
                    $"Team name '{createTeamDto.Name}' already exists in department {createTeamDto.DepartmentId}");
                throw new ValidationException("Team name already exists in this department");
            }

            _logger.LogInformation("Creating new team '{TeamName}' in department '{DepartmentName}' (ID: {DepartmentId})",
                createTeamDto.Name, department.Name, createTeamDto.DepartmentId);

            var team = _mapper.Map<Team>(createTeamDto);

            await _unitOfWork.Teams.AddAsync(team);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TeamCreated", new
            {
                teamId = team.Id,
                name = team.Name,
                departmentId = team.DepartmentId,
                departmentName = department.Name
            });

            var result = _mapper.Map<TeamDto>(team);
            _logger.LogServiceMethodSuccess(nameof(CreateAsync), new
            {
                teamId = result.Id,
                name = result.Name,
                departmentId = result.DepartmentId
            });

            return result;
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(CreateAsync), new
            {
                name = createTeamDto.Name,
                departmentId = createTeamDto.DepartmentId
            });
            throw;
        }
    }

    public async Task<TeamDto> UpdateAsync(int id, UpdateTeamDto updateTeamDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(UpdateAsync), new
            {
                id,
                name = updateTeamDto.Name,
                description = updateTeamDto.Description,
                isActive = updateTeamDto.IsActive
            });

            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null || !team.IsActive)
            {
                _logger.LogWarning("Team not found or inactive for update: {TeamId}", id);
                throw new NotFoundException("Team not found");
            }

            // Store original values for logging
            var originalName = team.Name;
            var originalDescription = team.Description;
            var originalActiveStatus = team.IsActive;

            // Validate name uniqueness if changed
            if (team.Name != updateTeamDto.Name &&
                !await IsTeamNameUniqueInDepartmentAsync(updateTeamDto.Name, team.DepartmentId, id))
            {
                _logger.LogValidationError("Team",
                    $"Team name '{updateTeamDto.Name}' already exists in department {team.DepartmentId}");
                throw new ValidationException("Team name already exists in this department");
            }

            _logger.LogInformation("Updating team {TeamId} ('{OriginalName}') in department {DepartmentId}",
                id, originalName, team.DepartmentId);

            // Update properties
            _mapper.Map(updateTeamDto, team);
            await _unitOfWork.CompleteAsync();

            // Log changes
            var changes = new List<string>();
            if (originalName != team.Name) changes.Add($"Name: '{originalName}' -> '{team.Name}'");
            if (originalDescription != team.Description) changes.Add($"Description changed");
            if (originalActiveStatus != team.IsActive) changes.Add($"Status: {originalActiveStatus} -> {team.IsActive}");

            _logger.LogBusinessEvent("TeamUpdated", new
            {
                teamId = id,
                departmentId = team.DepartmentId,
                changes = string.Join(", ", changes),
                changeCount = changes.Count
            });

            var result = _mapper.Map<TeamDto>(team);
            _logger.LogServiceMethodSuccess(nameof(UpdateAsync), new
            {
                teamId = result.Id,
                name = result.Name,
                departmentId = result.DepartmentId,
                changesCount = changes.Count
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(UpdateAsync), new
            {
                id,
                name = updateTeamDto.Name
            });
            throw;
        }
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(DeactivateAsync), new { id });

            var team = await _unitOfWork.Teams.GetByIdAsync(id);
            if (team == null)
            {
                _logger.LogWarning("Team not found for deactivation: {TeamId}", id);
                throw new NotFoundException("Team not found");
            }

            if (!team.IsActive)
            {
                _logger.LogWarning("Team {TeamId} is already inactive", id);
                return true; // Already inactive, consider it successful
            }

            // Check if team has active users
            var teamWithUsers = await _unitOfWork.Teams.GetTeamWithUsersAsync(id);
            var activeUsersCount = teamWithUsers.UserRoles.Count(ur => ur.User.IsActive);

            if (activeUsersCount > 0)
            {
                _logger.LogWarning("Cannot deactivate team {TeamId} - has {ActiveUsersCount} active users",
                    id, activeUsersCount);
                throw new ValidationException($"Cannot deactivate team with {activeUsersCount} active users");
            }

            // Check if team has active tickets
            var teamWithTickets = await _unitOfWork.Teams.GetTeamWithTicketsAsync(id);
            var activeTicketsCount = teamWithTickets.Tickets.Count(t => !t.ClosedAt.HasValue);

            if (activeTicketsCount > 0)
            {
                _logger.LogWarning("Cannot deactivate team {TeamId} - has {ActiveTicketsCount} active tickets",
                    id, activeTicketsCount);
                throw new ValidationException($"Cannot deactivate team with {activeTicketsCount} active tickets");
            }

            _logger.LogInformation("Deactivating team {TeamId} ('{Name}') in department {DepartmentId}",
                id, team.Name, team.DepartmentId);

            team.IsActive = false;
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TeamDeactivated", new
            {
                teamId = id,
                name = team.Name,
                departmentId = team.DepartmentId
            });
            _logger.LogServiceMethodSuccess(nameof(DeactivateAsync), new { teamId = id });

            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(DeactivateAsync), new { id });
            throw;
        }
    }

    public async Task<IEnumerable<TeamDto>> GetTeamsByDepartmentAsync(int departmentId)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetTeamsByDepartmentAsync), new { departmentId });

            using (new PerformanceLogger(_logger, "GetTeamsByDepartment", new { departmentId }))
            {
                var teams = await _unitOfWork.Teams.GetTeamsByDepartmentAsync(departmentId);
                var result = _mapper.Map<IEnumerable<TeamDto>>(teams);

                _logger.LogServiceMethodSuccess(nameof(GetTeamsByDepartmentAsync), new
                {
                    departmentId,
                    teamCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetTeamsByDepartmentAsync), new { departmentId });
            throw;
        }
    }

    public async Task<IEnumerable<TeamDto>> GetTeamsByUserIdAsync(int userId)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetTeamsByUserIdAsync), new { userId });

            using (new PerformanceLogger(_logger, "GetTeamsByUser", new { userId }))
            {
                var teams = await _unitOfWork.Teams.GetTeamsByUserIdAsync(userId);
                var result = _mapper.Map<IEnumerable<TeamDto>>(teams);

                _logger.LogServiceMethodSuccess(nameof(GetTeamsByUserIdAsync), new
                {
                    userId,
                    teamCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetTeamsByUserIdAsync), new { userId });
            throw;
        }
    }

    public async Task<bool> IsTeamNameUniqueInDepartmentAsync(string name, int departmentId, int? excludeTeamId = null)
    {
        try
        {
            _logger.LogDebug("Checking team name uniqueness: '{Name}' in department {DepartmentId} (excluding ID: {ExcludeId})",
                name, departmentId, excludeTeamId);

            var isUnique = await _unitOfWork.Teams.IsTeamNameUniqueInDepartmentAsync(name, departmentId, excludeTeamId);

            _logger.LogDebug("Team name uniqueness check result: {IsUnique} for name: '{Name}' in department {DepartmentId}",
                isUnique, name, departmentId);

            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking team name uniqueness for: '{Name}' in department {DepartmentId}",
                name, departmentId);
            throw;
        }
    }
}