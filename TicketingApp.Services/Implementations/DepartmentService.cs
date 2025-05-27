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

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<DepartmentService> _logger;

    public DepartmentService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<DepartmentService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<DepartmentDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByIdAsync), new { id });

            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            if (department == null || !department.IsActive)
            {
                _logger.LogWarning("Department not found or inactive with ID: {DepartmentId}", id);
                throw new NotFoundException("Department not found");
            }

            var result = _mapper.Map<DepartmentDto>(department);
            _logger.LogServiceMethodSuccess(nameof(GetByIdAsync), new
            {
                departmentId = id,
                name = result.Name,
                teamCount = result.Teams?.Count ?? 0
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetByIdAsync), new { id });
            throw;
        }
    }

    public async Task<DepartmentDetailsDto> GetDetailsByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetDetailsByIdAsync), new { id });

            using (new PerformanceLogger(_logger, "GetDepartmentDetails", new { departmentId = id }))
            {
                var department = await _unitOfWork.Departments.GetDepartmentWithTeamsAsync(id);
                if (department == null || !department.IsActive)
                {
                    _logger.LogWarning("Department not found or inactive for details: {DepartmentId}", id);
                    throw new NotFoundException("Department not found");
                }

                var departmentWithUsers = await _unitOfWork.Departments.GetDepartmentWithUsersAsync(id);

                // Combine the data
                department.UserRoles = departmentWithUsers.UserRoles;

                var result = _mapper.Map<DepartmentDetailsDto>(department);

                _logger.LogServiceMethodSuccess(nameof(GetDetailsByIdAsync), new
                {
                    departmentId = id,
                    name = result.Name,
                    teamCount = result.Teams.Count,
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

    public async Task<IEnumerable<DepartmentDto>> GetAllActiveAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllActiveAsync));

            using (new PerformanceLogger(_logger, "GetAllActiveDepartments"))
            {
                var departments = await _unitOfWork.Departments.GetActiveDepartmentsAsync();
                var result = _mapper.Map<IEnumerable<DepartmentDto>>(departments);

                _logger.LogServiceMethodSuccess(nameof(GetAllActiveAsync), new
                {
                    departmentCount = result.Count()
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

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDepartmentDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(CreateAsync), new
            {
                name = createDepartmentDto.Name,
                description = createDepartmentDto.Description
            });

            // Validate input
            if (string.IsNullOrWhiteSpace(createDepartmentDto.Name))
            {
                _logger.LogValidationError("Department", "Name is required");
                throw new ValidationException("Department name is required");
            }

            // Check name uniqueness
            if (!await IsDepartmentNameUniqueAsync(createDepartmentDto.Name))
            {
                _logger.LogValidationError("Department", $"Name already exists: {createDepartmentDto.Name}");
                throw new ValidationException("Department name already exists");
            }

            _logger.LogInformation("Creating new department with name: {DepartmentName}", createDepartmentDto.Name);

            var department = _mapper.Map<Department>(createDepartmentDto);

            await _unitOfWork.Departments.AddAsync(department);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("DepartmentCreated", new
            {
                departmentId = department.Id,
                name = department.Name
            });

            var result = _mapper.Map<DepartmentDto>(department);
            _logger.LogServiceMethodSuccess(nameof(CreateAsync), new
            {
                departmentId = result.Id,
                name = result.Name
            });

            return result;
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(CreateAsync), new
            {
                name = createDepartmentDto.Name,
                description = createDepartmentDto.Description
            });
            throw;
        }
    }

    public async Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto updateDepartmentDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(UpdateAsync), new
            {
                id,
                name = updateDepartmentDto.Name,
                description = updateDepartmentDto.Description,
                isActive = updateDepartmentDto.IsActive
            });

            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            if (department == null || !department.IsActive)
            {
                _logger.LogWarning("Department not found or inactive for update: {DepartmentId}", id);
                throw new NotFoundException("Department not found");
            }

            // Store original values for logging
            var originalName = department.Name;
            var originalDescription = department.Description;
            var originalActiveStatus = department.IsActive;

            // Validate name uniqueness if changed
            if (department.Name != updateDepartmentDto.Name &&
                !await IsDepartmentNameUniqueAsync(updateDepartmentDto.Name, id))
            {
                _logger.LogValidationError("Department", $"Name already exists: {updateDepartmentDto.Name}");
                throw new ValidationException("Department name already exists");
            }

            _logger.LogInformation("Updating department {DepartmentId} ({OriginalName})", id, originalName);

            // Update properties
            _mapper.Map(updateDepartmentDto, department);
            await _unitOfWork.CompleteAsync();

            // Log changes
            var changes = new List<string>();
            if (originalName != department.Name) changes.Add($"Name: '{originalName}' -> '{department.Name}'");
            if (originalDescription != department.Description) changes.Add($"Description changed");
            if (originalActiveStatus != department.IsActive) changes.Add($"Status: {originalActiveStatus} -> {department.IsActive}");

            _logger.LogBusinessEvent("DepartmentUpdated", new
            {
                departmentId = id,
                changes = string.Join(", ", changes),
                changeCount = changes.Count
            });

            var result = _mapper.Map<DepartmentDto>(department);
            _logger.LogServiceMethodSuccess(nameof(UpdateAsync), new
            {
                departmentId = result.Id,
                name = result.Name,
                changesCount = changes.Count
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(UpdateAsync), new
            {
                id,
                name = updateDepartmentDto.Name
            });
            throw;
        }
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(DeactivateAsync), new { id });

            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            if (department == null)
            {
                _logger.LogWarning("Department not found for deactivation: {DepartmentId}", id);
                throw new NotFoundException("Department not found");
            }

            if (!department.IsActive)
            {
                _logger.LogWarning("Department {DepartmentId} is already inactive", id);
                return true; // Already inactive, consider it successful
            }

            // Check if department has active teams or users
            var departmentWithTeams = await _unitOfWork.Departments.GetDepartmentWithTeamsAsync(id);
            var activeTeamsCount = departmentWithTeams.Teams.Count(t => t.IsActive);

            if (activeTeamsCount > 0)
            {
                _logger.LogWarning("Cannot deactivate department {DepartmentId} - has {ActiveTeamsCount} active teams",
                    id, activeTeamsCount);
                throw new ValidationException($"Cannot deactivate department with {activeTeamsCount} active teams");
            }

            var departmentWithUsers = await _unitOfWork.Departments.GetDepartmentWithUsersAsync(id);
            var activeUsersCount = departmentWithUsers.UserRoles.Count(ur => ur.User.IsActive);

            if (activeUsersCount > 0)
            {
                _logger.LogWarning("Cannot deactivate department {DepartmentId} - has {ActiveUsersCount} active users",
                    id, activeUsersCount);
                throw new ValidationException($"Cannot deactivate department with {activeUsersCount} active users");
            }

            _logger.LogInformation("Deactivating department {DepartmentId} ({Name})", id, department.Name);

            department.IsActive = false;
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("DepartmentDeactivated", new
            {
                departmentId = id,
                name = department.Name
            });
            _logger.LogServiceMethodSuccess(nameof(DeactivateAsync), new { departmentId = id });

            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(DeactivateAsync), new { id });
            throw;
        }
    }

    public async Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentsByUserIdAsync(int userId)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetDepartmentsByUserIdAsync), new { userId });

            using (new PerformanceLogger(_logger, "GetDepartmentsByUser", new { userId }))
            {
                var departments = await _unitOfWork.Departments.GetDepartmentsByUserIdAsync(userId);
                var result = _mapper.Map<IEnumerable<DepartmentSummaryDto>>(departments);

                _logger.LogServiceMethodSuccess(nameof(GetDepartmentsByUserIdAsync), new
                {
                    userId,
                    departmentCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetDepartmentsByUserIdAsync), new { userId });
            throw;
        }
    }

    public async Task<bool> IsDepartmentNameUniqueAsync(string name, int? excludeDepartmentId = null)
    {
        try
        {
            _logger.LogDebug("Checking department name uniqueness: {Name} (excluding ID: {ExcludeId})",
                name, excludeDepartmentId);

            var isUnique = await _unitOfWork.Departments.IsDepartmentNameUniqueAsync(name, excludeDepartmentId);

            _logger.LogDebug("Department name uniqueness check result: {IsUnique} for name: {Name}",
                isUnique, name);

            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking department name uniqueness for: {Name}", name);
            throw;
        }
    }
}
