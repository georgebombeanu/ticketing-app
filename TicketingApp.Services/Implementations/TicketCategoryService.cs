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

public class TicketCategoryService : ITicketCategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<TicketCategoryService> _logger;

    public TicketCategoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<TicketCategoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TicketCategoryDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetByIdAsync), new { id });

            var category = await _unitOfWork.TicketCategories.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Ticket category not found with ID: {CategoryId}", id);
                throw new NotFoundException("Ticket category not found");
            }

            var result = _mapper.Map<TicketCategoryDto>(category);
            _logger.LogServiceMethodSuccess(nameof(GetByIdAsync), new
            {
                categoryId = id,
                name = result.Name,
                isActive = result.IsActive
            });

            return result;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogServiceMethodError(ex, nameof(GetByIdAsync), new { id });
            throw;
        }
    }

    public async Task<IEnumerable<TicketCategoryDto>> GetAllAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetAllAsync));

            using (new PerformanceLogger(_logger, "GetAllTicketCategories"))
            {
                var categories = await _unitOfWork.TicketCategories.GetAllAsync();
                var result = _mapper.Map<IEnumerable<TicketCategoryDto>>(categories);

                _logger.LogServiceMethodSuccess(nameof(GetAllAsync), new
                {
                    categoryCount = result.Count(),
                    activeCount = result.Count(c => c.IsActive)
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

    public async Task<IEnumerable<TicketCategoryDto>> GetActiveAsync()
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(GetActiveAsync));

            using (new PerformanceLogger(_logger, "GetActiveTicketCategories"))
            {
                var categories = await _unitOfWork.TicketCategories.GetActiveCategories();
                var result = _mapper.Map<IEnumerable<TicketCategoryDto>>(categories);

                _logger.LogServiceMethodSuccess(nameof(GetActiveAsync), new
                {
                    activeCategoryCount = result.Count()
                });

                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogServiceMethodError(ex, nameof(GetActiveAsync));
            throw;
        }
    }

    public async Task<TicketCategoryDto> CreateAsync(CreateTicketCategoryDto createCategoryDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(CreateAsync), new
            {
                name = createCategoryDto.Name,
                description = createCategoryDto.Description
            });

            // Validate input
            if (string.IsNullOrWhiteSpace(createCategoryDto.Name))
            {
                _logger.LogValidationError("TicketCategory", "Name is required");
                throw new ValidationException("Category name is required");
            }

            // Check name uniqueness
            if (!await IsCategoryNameUniqueAsync(createCategoryDto.Name))
            {
                _logger.LogValidationError("TicketCategory", $"Name already exists: {createCategoryDto.Name}");
                throw new ValidationException("Category name already exists");
            }

            _logger.LogInformation("Creating new ticket category: {CategoryName}", createCategoryDto.Name);

            var category = _mapper.Map<TicketCategory>(createCategoryDto);
            category.IsActive = true;

            await _unitOfWork.TicketCategories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TicketCategoryCreated", new
            {
                categoryId = category.Id,
                name = category.Name
            });

            var result = _mapper.Map<TicketCategoryDto>(category);
            _logger.LogServiceMethodSuccess(nameof(CreateAsync), new
            {
                categoryId = result.Id,
                name = result.Name
            });

            return result;
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(CreateAsync), new
            {
                name = createCategoryDto.Name,
                description = createCategoryDto.Description
            });
            throw;
        }
    }

    public async Task<TicketCategoryDto> UpdateAsync(int id, UpdateTicketCategoryDto updateCategoryDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(UpdateAsync), new
            {
                id,
                name = updateCategoryDto.Name,
                description = updateCategoryDto.Description,
                isActive = updateCategoryDto.IsActive
            });

            var category = await _unitOfWork.TicketCategories.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Ticket category not found for update: {CategoryId}", id);
                throw new NotFoundException("Ticket category not found");
            }

            // Store original values for logging
            var originalName = category.Name;
            var originalDescription = category.Description;
            var originalActiveStatus = category.IsActive;

            // Validate name uniqueness if changed
            if (category.Name != updateCategoryDto.Name &&
                !await IsCategoryNameUniqueAsync(updateCategoryDto.Name, id))
            {
                _logger.LogValidationError("TicketCategory", $"Name already exists: {updateCategoryDto.Name}");
                throw new ValidationException("Category name already exists");
            }

            _logger.LogInformation("Updating ticket category {CategoryId} ('{OriginalName}')", id, originalName);

            // Update properties
            _mapper.Map(updateCategoryDto, category);
            await _unitOfWork.CompleteAsync();

            // Log changes
            var changes = new List<string>();
            if (originalName != category.Name) changes.Add($"Name: '{originalName}' -> '{category.Name}'");
            if (originalDescription != category.Description) changes.Add("Description changed");
            if (originalActiveStatus != category.IsActive) changes.Add($"Status: {originalActiveStatus} -> {category.IsActive}");

            _logger.LogBusinessEvent("TicketCategoryUpdated", new
            {
                categoryId = id,
                changes = string.Join(", ", changes),
                changeCount = changes.Count
            });

            var result = _mapper.Map<TicketCategoryDto>(category);
            _logger.LogServiceMethodSuccess(nameof(UpdateAsync), new
            {
                categoryId = result.Id,
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
                name = updateCategoryDto.Name
            });
            throw;
        }
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(DeactivateAsync), new { id });

            var category = await _unitOfWork.TicketCategories.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Ticket category not found for deactivation: {CategoryId}", id);
                throw new NotFoundException("Ticket category not found");
            }

            if (!category.IsActive)
            {
                _logger.LogWarning("Ticket category {CategoryId} is already inactive", id);
                return true;
            }

            // Check if category is being used by active tickets
            var ticketsCount = await _unitOfWork.Tickets.CountAsync(t => t.CategoryId == id && !t.ClosedAt.HasValue);
            if (ticketsCount > 0)
            {
                _logger.LogWarning("Cannot deactivate ticket category {CategoryId} - has {ActiveTicketsCount} active tickets",
                    id, ticketsCount);
                throw new ValidationException($"Cannot deactivate category with {ticketsCount} active tickets");
            }

            _logger.LogInformation("Deactivating ticket category {CategoryId} ('{Name}')", id, category.Name);

            category.IsActive = false;
            await _unitOfWork.CompleteAsync();

            _logger.LogBusinessEvent("TicketCategoryDeactivated", new
            {
                categoryId = id,
                name = category.Name
            });
            _logger.LogServiceMethodSuccess(nameof(DeactivateAsync), new { categoryId = id });

            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(DeactivateAsync), new { id });
            throw;
        }
    }

    public async Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null)
    {
        try
        {
            _logger.LogDebug("Checking ticket category name uniqueness: {Name} (excluding ID: {ExcludeId})",
                name, excludeCategoryId);

            var isUnique = await _unitOfWork.TicketCategories.IsCategoryNameUniqueAsync(name, excludeCategoryId);

            _logger.LogDebug("Ticket category name uniqueness check result: {IsUnique} for name: {Name}",
                isUnique, name);

            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ticket category name uniqueness for: {Name}", name);
            throw;
        }
    }
}