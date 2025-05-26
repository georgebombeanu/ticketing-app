using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface ITicketCategoryService
{
    Task<TicketCategoryDto> GetByIdAsync(int id);
    Task<IEnumerable<TicketCategoryDto>> GetAllAsync();
    Task<IEnumerable<TicketCategoryDto>> GetActiveAsync();
    Task<TicketCategoryDto> CreateAsync(CreateTicketCategoryDto createCategoryDto);
    Task<TicketCategoryDto> UpdateAsync(int id, UpdateTicketCategoryDto updateCategoryDto);
    Task<bool> DeactivateAsync(int id);
    Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null);
}