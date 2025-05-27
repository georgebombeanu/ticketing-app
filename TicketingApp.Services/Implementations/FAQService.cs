using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class FAQService : IFAQService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<FAQService> _logger;

    public FAQService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<FAQService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    #region Category Operations

    public async Task<IEnumerable<FAQCategoryDto>> GetAllCategoriesAsync()
    {
        try
        {
            _logger.LogInformation("Getting all FAQ categories");
            var categories = await _unitOfWork.FAQCategories.GetActiveCategoriesAsync();
            return _mapper.Map<IEnumerable<FAQCategoryDto>>(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting FAQ categories");
            throw;
        }
    }

    public async Task<FAQCategoryDto> GetCategoryWithItemsAsync(int categoryId)
    {
        try
        {
            _logger.LogInformation("Getting FAQ category {CategoryId} with items", categoryId);
            var category = await _unitOfWork.FAQCategories.GetCategoryWithItemsAsync(categoryId);
            if (category == null)
                throw new NotFoundException("FAQ category not found");

            return _mapper.Map<FAQCategoryDto>(category);
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error getting FAQ category {CategoryId}", categoryId);
            throw;
        }
    }

    public async Task<FAQCategoryDto> CreateCategoryAsync(CreateFAQCategoryDto createCategoryDto)
    {
        try
        {
            _logger.LogInformation("Creating FAQ category: {Name}", createCategoryDto.Name);

            if (string.IsNullOrWhiteSpace(createCategoryDto.Name))
                throw new ValidationException("Category name is required");

            if (!await _unitOfWork.FAQCategories.IsCategoryNameUniqueAsync(createCategoryDto.Name))
                throw new ValidationException("Category name already exists");

            var category = _mapper.Map<FAQCategory>(createCategoryDto);
            category.IsActive = true;

            await _unitOfWork.FAQCategories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<FAQCategoryDto>(category);
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogError(ex, "Error creating FAQ category: {Name}", createCategoryDto.Name);
            throw;
        }
    }

    public async Task<FAQCategoryDto> UpdateCategoryAsync(int id, UpdateFAQCategoryDto updateCategoryDto)
    {
        try
        {
            _logger.LogInformation("Updating FAQ category {CategoryId}", id);

            var category = await _unitOfWork.FAQCategories.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException("FAQ category not found");

            if (category.Name != updateCategoryDto.Name &&
                !await _unitOfWork.FAQCategories.IsCategoryNameUniqueAsync(updateCategoryDto.Name, id))
                throw new ValidationException("Category name already exists");

            _mapper.Map(updateCategoryDto, category);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<FAQCategoryDto>(category);
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogError(ex, "Error updating FAQ category {CategoryId}", id);
            throw;
        }
    }

    public async Task<bool> DeactivateCategoryAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deactivating FAQ category {CategoryId}", id);

            var category = await _unitOfWork.FAQCategories.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException("FAQ category not found");

            category.IsActive = false;
            await _unitOfWork.CompleteAsync();
            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error deactivating FAQ category {CategoryId}", id);
            throw;
        }
    }

    #endregion

    #region FAQ Item Operations

    public async Task<FAQItemDto> GetFAQByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Getting FAQ {FAQId}", id);
            var faq = await _unitOfWork.FAQItems.GetFAQWithDetailsAsync(id);
            if (faq == null)
                throw new NotFoundException("FAQ not found");

            return _mapper.Map<FAQItemDto>(faq);
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error getting FAQ {FAQId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<FAQItemDto>> GetFAQsByCategoryAsync(int categoryId)
    {
        try
        {
            _logger.LogInformation("Getting FAQs for category {CategoryId}", categoryId);
            var faqs = await _unitOfWork.FAQItems.GetFAQsByCategoryAsync(categoryId);
            return _mapper.Map<IEnumerable<FAQItemDto>>(faqs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting FAQs for category {CategoryId}", categoryId);
            throw;
        }
    }

    public async Task<IEnumerable<FAQItemDto>> GetActiveFAQsAsync()
    {
        try
        {
            _logger.LogInformation("Getting all active FAQs");
            var faqs = await _unitOfWork.FAQItems.GetActiveFAQsAsync();
            return _mapper.Map<IEnumerable<FAQItemDto>>(faqs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active FAQs");
            throw;
        }
    }

    public async Task<IEnumerable<FAQItemDto>> SearchFAQsAsync(string searchTerm)
    {
        try
        {
            _logger.LogInformation("Searching FAQs with term: {SearchTerm}", searchTerm);
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new List<FAQItemDto>();

            var faqs = await _unitOfWork.FAQItems.SearchFAQsAsync(searchTerm);
            return _mapper.Map<IEnumerable<FAQItemDto>>(faqs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching FAQs with term: {SearchTerm}", searchTerm);
            throw;
        }
    }

    public async Task<FAQItemDto> CreateFAQAsync(CreateFAQItemDto createFAQDto, int createdByUserId)
    {
        try
        {
            _logger.LogInformation("Creating FAQ in category {CategoryId} by user {UserId}",
                createFAQDto.CategoryId, createdByUserId);

            if (string.IsNullOrWhiteSpace(createFAQDto.Question))
                throw new ValidationException("Question is required");

            if (string.IsNullOrWhiteSpace(createFAQDto.Answer))
                throw new ValidationException("Answer is required");

            // Validate category exists
            var category = await _unitOfWork.FAQCategories.GetByIdAsync(createFAQDto.CategoryId);
            if (category == null || !category.IsActive)
                throw new ValidationException("Invalid or inactive category");

            // Validate user exists
            var user = await _unitOfWork.Users.GetByIdAsync(createdByUserId);
            if (user == null || !user.IsActive)
                throw new ValidationException("Invalid user");

            var faq = _mapper.Map<FAQItem>(createFAQDto);
            faq.CreatedById = createdByUserId;
            faq.CreatedAt = DateTime.UtcNow;
            faq.UpdatedAt = DateTime.UtcNow;
            faq.IsActive = true;

            await _unitOfWork.FAQItems.AddAsync(faq);
            await _unitOfWork.CompleteAsync();

            var createdFaq = await _unitOfWork.FAQItems.GetFAQWithDetailsAsync(faq.Id);
            return _mapper.Map<FAQItemDto>(createdFaq);
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogError(ex, "Error creating FAQ for category {CategoryId}", createFAQDto.CategoryId);
            throw;
        }
    }

    public async Task<FAQItemDto> UpdateFAQAsync(int id, UpdateFAQItemDto updateFAQDto)
    {
        try
        {
            _logger.LogInformation("Updating FAQ {FAQId}", id);

            var faq = await _unitOfWork.FAQItems.GetByIdAsync(id);
            if (faq == null)
                throw new NotFoundException("FAQ not found");

            if (string.IsNullOrWhiteSpace(updateFAQDto.Question))
                throw new ValidationException("Question is required");

            if (string.IsNullOrWhiteSpace(updateFAQDto.Answer))
                throw new ValidationException("Answer is required");

            faq.Question = updateFAQDto.Question;
            faq.Answer = updateFAQDto.Answer;
            faq.IsActive = updateFAQDto.IsActive;
            faq.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            var updatedFaq = await _unitOfWork.FAQItems.GetFAQWithDetailsAsync(faq.Id);
            return _mapper.Map<FAQItemDto>(updatedFaq);
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogError(ex, "Error updating FAQ {FAQId}", id);
            throw;
        }
    }

    public async Task<bool> DeactivateFAQAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deactivating FAQ {FAQId}", id);

            var faq = await _unitOfWork.FAQItems.GetByIdAsync(id);
            if (faq == null)
                throw new NotFoundException("FAQ not found");

            faq.IsActive = false;
            faq.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();
            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error deactivating FAQ {FAQId}", id);
            throw;
        }
    }

    #endregion
}