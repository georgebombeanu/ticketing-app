using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface IDepartmentService
{
    Task<DepartmentDto> GetByIdAsync(int id);
    Task<DepartmentDetailsDto> GetDetailsByIdAsync(int id);
    Task<IEnumerable<DepartmentDto>> GetAllActiveAsync();
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDepartmentDto);
    Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto updateDepartmentDto);
    Task<bool> DeactivateAsync(int id);
    Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentsByUserIdAsync(int userId);
    Task<bool> IsDepartmentNameUniqueAsync(string name, int? excludeDepartmentId = null);
}
