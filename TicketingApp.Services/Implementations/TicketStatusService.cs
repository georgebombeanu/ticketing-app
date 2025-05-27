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

public class TicketStatusService : ITicketStatusService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<TicketStatusService> _logger;

    public TicketStatusService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<TicketStatusService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TicketStatusDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByIdAsync), new { id });

            var status = await _unitOfWork.TicketStatuses.GetByIdAsync(id);
            if (status == null)
            {
                _logger.LogWarning("Ticket status not found with ID: {StatusId}", id);
                throw new NotFoundException("Ticket status not found");
            }

            var result = _mapper.Map<TicketStatusDto>(status);
            _logger.LogServiceMethodSuccess(nameof(GetByIdAsync), new
            {
                statusId = id,
                name = result.Name
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetByIdAsync), new { id });
            throw;
        }
    }

    public async Task<IEnumerable<TicketStatusDto>> GetAllAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllAsync));

            using (new PerformanceLogger(_logger, "GetAllTicketStatuses"))
            {
                var statuses = await _unitOfWork.TicketStatuses.GetAllAsync();
                var result = _mapper.Map<IEnumerable<TicketStatusDto>>(statuses);

                _logger.LogServiceMethodSuccess(nameof(GetAllAsync), new
                {
                    statusCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetAllAsync));
            throw;
        }
    }

    public async Task<IEnumerable<TicketStatusDto>> GetAllOrderedByNameAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllOrderedByNameAsync));

            using (new PerformanceLogger(_logger, "GetAllTicketStatusesOrdered"))
            {
                var statuses = await _unitOfWork.TicketStatuses.GetAllOrderedByNameAsync();
                var result = _mapper.Map<IEnumerable<TicketStatusDto>>(statuses);

                _logger.LogServiceMethodSuccess(nameof(GetAllOrderedByNameAsync), new
                {
                    statusCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetAllOrderedByNameAsync));
            throw;
        }
    }

    public async Task<TicketStatusDto> CreateAsync(CreateTicketStatusDto createStatusDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(CreateAsync), new
            {
                name = createStatusDto.Name,
                description = createStatusDto.Description
            });

            // Validate input
            if (string.IsNullOrWhiteSpace(createStatusDto.Name))
            {
                _logger.LogValidationError("TicketStatus", "Name is required");
                throw new ValidationException("Status name is required");
            }

            // Check name uniqueness
            if (!await IsStatusNameUniqueAsync(createStatusDto.Name))
            {
                _logger.LogValidationError("TicketStatus", $"Name already exists: {createStatusDto.Name}");
                throw new ValidationException("Status name already exists");
            }

            _logger.LogInformation("Creating new ticket status: {StatusName}", createStatusDto.Name);

            var status = _mapper.Map<TicketStatus>(createStatusDto);

            await _unitOfWork.TicketStatuses.AddAsync(status);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TicketStatusCreated", new
            {
                statusId = status.Id,
                name = status.Name
            });

            var result = _mapper.Map<TicketStatusDto>(status);
            _logger.LogServiceMethodSuccess(nameof(CreateAsync), new
            {
                statusId = result.Id,
                name = result.Name
            });

            return result;
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(CreateAsync), new
            {
                name = createStatusDto.Name,
                description = createStatusDto.Description
            });
            throw;
        }
    }

    public async Task<TicketStatusDto> UpdateAsync(int id, UpdateTicketStatusDto updateStatusDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(UpdateAsync), new
            {
                id,
                name = updateStatusDto.Name,
                description = updateStatusDto.Description
            });

            var status = await _unitOfWork.TicketStatuses.GetByIdAsync(id);
            if (status == null)
            {
                _logger.LogWarning("Ticket status not found for update: {StatusId}", id);
                throw new NotFoundException("Ticket status not found");
            }

            // Store original values for logging
            var originalName = status.Name;
            var originalDescription = status.Description;

            // Validate name uniqueness if changed
            if (status.Name != updateStatusDto.Name &&
                !await IsStatusNameUniqueAsync(updateStatusDto.Name, id))
            {
                _logger.LogValidationError("TicketStatus", $"Name already exists: {updateStatusDto.Name}");
                throw new ValidationException("Status name already exists");
            }

            _logger.LogInformation("Updating ticket status {StatusId} ('{OriginalName}')", id, originalName);

            // Update properties
            _mapper.Map(updateStatusDto, status);
            await _unitOfWork.CompleteAsync();

            // Log changes
            var changes = new List<string>();
            if (originalName != status.Name) changes.Add($"Name: '{originalName}' -> '{status.Name}'");
            if (originalDescription != status.Description) changes.Add("Description changed");

            _logger.LogBusinessEvent("TicketStatusUpdated", new
            {
                statusId = id,
                changes = string.Join(", ", changes),
                changeCount = changes.Count
            });

            var result = _mapper.Map<TicketStatusDto>(status);
            _logger.LogServiceMethodSuccess(nameof(UpdateAsync), new
            {
                statusId = result.Id,
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
                name = updateStatusDto.Name
            });
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(DeleteAsync), new { id });

            var status = await _unitOfWork.TicketStatuses.GetByIdAsync(id);
            if (status == null)
            {
                _logger.LogWarning("Ticket status not found for deletion: {StatusId}", id);
                throw new NotFoundException("Ticket status not found");
            }

            // Check if status is being used by tickets
            var ticketsCount = await _unitOfWork.Tickets.CountAsync(t => t.StatusId == id);
            if (ticketsCount > 0)
            {
                _logger.LogWarning("Cannot delete ticket status {StatusId} - has {TicketsCount} tickets",
                    id, ticketsCount);
                throw new ValidationException($"Cannot delete status that is being used by {ticketsCount} tickets");
            }

            // Check if this is a system-critical status
            var criticalStatuses = new[] { "open", "closed", "resolved", "in progress", "pending" };
            if (criticalStatuses.Any(cs => status.Name.ToLower().Contains(cs)))
            {
                _logger.LogWarning("Attempted to delete critical ticket status {StatusId} ('{StatusName}')",
                    id, status.Name);
                throw new ValidationException($"Cannot delete system-critical status: {status.Name}");
            }

            _logger.LogInformation("Deleting ticket status {StatusId} ('{Name}')", id, status.Name);

            _unitOfWork.TicketStatuses.Remove(status);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TicketStatusDeleted", new
            {
                statusId = id,
                name = status.Name
            });
            _logger.LogServiceMethodSuccess(nameof(DeleteAsync), new { statusId = id });

            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(DeleteAsync), new { id });
            throw;
        }
    }

    public async Task<bool> IsStatusNameUniqueAsync(string name, int? excludeStatusId = null)
    {
        try
        {
            _logger.LogDebug("Checking ticket status name uniqueness: {Name} (excluding ID: {ExcludeId})",
                name, excludeStatusId);

            var isUnique = await _unitOfWork.TicketStatuses.IsStatusNameUniqueAsync(name, excludeStatusId);

            _logger.LogDebug("Ticket status name uniqueness check result: {IsUnique} for name: {Name}",
                isUnique, name);

            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ticket status name uniqueness for: {Name}", name);
            throw;
        }
    }

    public async Task<int> GetTicketCountByStatusAsync(int statusId)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetTicketCountByStatusAsync), new { statusId });

            using (new PerformanceLogger(_logger, "GetTicketCountByStatus", new { statusId }))
            {
                var count = await _unitOfWork.TicketStatuses.GetTicketCountByStatusAsync(statusId);

                _logger.LogServiceMethodSuccess(nameof(GetTicketCountByStatusAsync), new
                {
                    statusId,
                    ticketCount = count
                });

                return count;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetTicketCountByStatusAsync), new { statusId });
            throw;
        }
    }
}