using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface ITicketPriorityService
{
    Task<TicketPriorityDto> GetByIdAsync(int id);
    Task<IEnumerable<TicketPriorityDto>> GetAllAsync();
    Task<IEnumerable<TicketPriorityDto>> GetAllOrderedByNameAsync();
    Task<TicketPriorityDto> CreateAsync(CreateTicketPriorityDto createPriorityDto);
    Task<TicketPriorityDto> UpdateAsync(int id, UpdateTicketPriorityDto updatePriorityDto);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsPriorityNameUniqueAsync(string name, int? excludePriorityId = null);
}