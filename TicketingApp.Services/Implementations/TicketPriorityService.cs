using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;
using Microsoft.Extensions.Logging;
using TicketingApp.Services.Common.Logging;

namespace TicketingApp.Services.Implementations;

public class TicketPriorityService : ITicketPriorityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<TicketPriorityService> _logger;

    public TicketPriorityService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<TicketPriorityService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TicketPriorityDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByIdAsync), new { id });

            var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(id);
            if (priority == null)
            {
                _logger.LogWarning("Ticket priority not found with ID: {PriorityId}", id);
                throw new NotFoundException("Ticket priority not found");
            }

            var result = _mapper.Map<TicketPriorityDto>(priority);
            _logger.LogServiceMethodSuccess(nameof(GetByIdAsync), new
            {
                priorityId = id,
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

    public async Task<IEnumerable<TicketPriorityDto>> GetAllAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllAsync));

            using (new PerformanceLogger(_logger, "GetAllTicketPriorities"))
            {
                var priorities = await _unitOfWork.TicketPriorities.GetAllAsync();
                var result = _mapper.Map<IEnumerable<TicketPriorityDto>>(priorities);

                _logger.LogServiceMethodSuccess(nameof(GetAllAsync), new
                {
                    priorityCount = result.Count()
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

    public async Task<IEnumerable<TicketPriorityDto>> GetAllOrderedByNameAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllOrderedByNameAsync));

            using (new PerformanceLogger(_logger, "GetAllTicketPrioritiesOrdered"))
            {
                var priorities = await _unitOfWork.TicketPriorities.GetAllOrderedByNameAsync();
                var result = _mapper.Map<IEnumerable<TicketPriorityDto>>(priorities);

                _logger.LogServiceMethodSuccess(nameof(GetAllOrderedByNameAsync), new
                {
                    priorityCount = result.Count()
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

    public async Task<TicketPriorityDto> CreateAsync(CreateTicketPriorityDto createPriorityDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(CreateAsync), new
            {
                name = createPriorityDto.Name,
                description = createPriorityDto.Description
            });

            // Validate input
            if (string.IsNullOrWhiteSpace(createPriorityDto.Name))
            {
                _logger.LogValidationError("TicketPriority", "Name is required");
                throw new ValidationException("Priority name is required");
            }

            // Check name uniqueness
            if (!await IsPriorityNameUniqueAsync(createPriorityDto.Name))
            {
                _logger.LogValidationError("TicketPriority", $"Name already exists: {createPriorityDto.Name}");
                throw new ValidationException("Priority name already exists");
            }

            _logger.LogInformation("Creating new ticket priority: {PriorityName}", createPriorityDto.Name);

            var priority = _mapper.Map<TicketPriority>(createPriorityDto);

            await _unitOfWork.TicketPriorities.AddAsync(priority);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TicketPriorityCreated", new
            {
                priorityId = priority.Id,
                name = priority.Name
            });

            var result = _mapper.Map<TicketPriorityDto>(priority);
            _logger.LogServiceMethodSuccess(nameof(CreateAsync), new
            {
                priorityId = result.Id,
                name = result.Name
            });

            return result;
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(CreateAsync), new
            {
                name = createPriorityDto.Name,
                description = createPriorityDto.Description
            });
            throw;
        }
    }

    public async Task<TicketPriorityDto> UpdateAsync(int id, UpdateTicketPriorityDto updatePriorityDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(UpdateAsync), new
            {
                id,
                name = updatePriorityDto.Name,
                description = updatePriorityDto.Description
            });

            var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(id);
            if (priority == null)
            {
                _logger.LogWarning("Ticket priority not found for update: {PriorityId}", id);
                throw new NotFoundException("Ticket priority not found");
            }

            // Store original values for logging
            var originalName = priority.Name;
            var originalDescription = priority.Description;

            // Validate name uniqueness if changed
            if (priority.Name != updatePriorityDto.Name &&
                !await IsPriorityNameUniqueAsync(updatePriorityDto.Name, id))
            {
                _logger.LogValidationError("TicketPriority", $"Name already exists: {updatePriorityDto.Name}");
                throw new ValidationException("Priority name already exists");
            }

            _logger.LogInformation("Updating ticket priority {PriorityId} ('{OriginalName}')", id, originalName);

            // Update properties
            _mapper.Map(updatePriorityDto, priority);
            await _unitOfWork.CompleteAsync();

            // Log changes
            var changes = new List<string>();
            if (originalName != priority.Name) changes.Add($"Name: '{originalName}' -> '{priority.Name}'");
            if (originalDescription != priority.Description) changes.Add("Description changed");

            _logger.LogBusinessEvent("TicketPriorityUpdated", new
            {
                priorityId = id,
                changes = string.Join(", ", changes),
                changeCount = changes.Count
            });

            var result = _mapper.Map<TicketPriorityDto>(priority);
            _logger.LogServiceMethodSuccess(nameof(UpdateAsync), new
            {
                priorityId = result.Id,
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
                name = updatePriorityDto.Name
            });
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(DeleteAsync), new { id });

            var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(id);
            if (priority == null)
            {
                _logger.LogWarning("Ticket priority not found for deletion: {PriorityId}", id);
                throw new NotFoundException("Ticket priority not found");
            }

            // Check if priority is being used by tickets
            var ticketsCount = await _unitOfWork.Tickets.CountAsync(t => t.PriorityId == id);
            if (ticketsCount > 0)
            {
                _logger.LogWarning("Cannot delete ticket priority {PriorityId} - has {TicketsCount} tickets",
                    id, ticketsCount);
                throw new ValidationException($"Cannot delete priority that is being used by {ticketsCount} tickets");
            }

            _logger.LogInformation("Deleting ticket priority {PriorityId} ('{Name}')", id, priority.Name);

            _unitOfWork.TicketPriorities.Remove(priority);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TicketPriorityDeleted", new
            {
                priorityId = id,
                name = priority.Name
            });
            _logger.LogServiceMethodSuccess(nameof(DeleteAsync), new { priorityId = id });

            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(DeleteAsync), new { id });
            throw;
        }
    }

    public async Task<bool> IsPriorityNameUniqueAsync(string name, int? excludePriorityId = null)
    {
        try
        {
            _logger.LogDebug("Checking ticket priority name uniqueness: {Name} (excluding ID: {ExcludeId})",
                name, excludePriorityId);

            var isUnique = await _unitOfWork.TicketPriorities.IsPriorityNameUniqueAsync(name, excludePriorityId);

            _logger.LogDebug("Ticket priority name uniqueness check result: {IsUnique} for name: {Name}",
                isUnique, name);

            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ticket priority name uniqueness for: {Name}", name);
            throw;
        }
    }
}