using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface IFAQService
{
    // Category operations
    Task<IEnumerable<FAQCategoryDto>> GetAllCategoriesAsync();
    Task<FAQCategoryDto> GetCategoryWithItemsAsync(int categoryId);
    Task<FAQCategoryDto> CreateCategoryAsync(CreateFAQCategoryDto createCategoryDto);
    Task<FAQCategoryDto> UpdateCategoryAsync(int id, UpdateFAQCategoryDto updateCategoryDto);
    Task<bool> DeactivateCategoryAsync(int id);

    // FAQ item operations
    Task<FAQItemDto> GetFAQByIdAsync(int id);
    Task<IEnumerable<FAQItemDto>> GetFAQsByCategoryAsync(int categoryId);
    Task<IEnumerable<FAQItemDto>> GetActiveFAQsAsync();
    Task<IEnumerable<FAQItemDto>> SearchFAQsAsync(string searchTerm);
    Task<FAQItemDto> CreateFAQAsync(CreateFAQItemDto createFAQDto, int createdByUserId);
    Task<FAQItemDto> UpdateFAQAsync(int id, UpdateFAQItemDto updateFAQDto);
    Task<bool> DeactivateFAQAsync(int id);
}