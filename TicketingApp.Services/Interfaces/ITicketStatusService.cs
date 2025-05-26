using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface ITicketStatusService
{
    Task<TicketStatusDto> GetByIdAsync(int id);
    Task<IEnumerable<TicketStatusDto>> GetAllAsync();
    Task<IEnumerable<TicketStatusDto>> GetAllOrderedByNameAsync();
    Task<TicketStatusDto> CreateAsync(CreateTicketStatusDto createStatusDto);
    Task<TicketStatusDto> UpdateAsync(int id, UpdateTicketStatusDto updateStatusDto);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsStatusNameUniqueAsync(string name, int? excludeStatusId = null);
    Task<int> GetTicketCountByStatusAsync(int statusId);
}