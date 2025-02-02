using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface ITeamService
{
    Task<TeamDto> GetByIdAsync(int id);
    Task<TeamDetailsDto> GetDetailsByIdAsync(int id);
    Task<IEnumerable<TeamDto>> GetAllActiveAsync();
    Task<TeamDto> CreateAsync(CreateTeamDto createTeamDto);
    Task<TeamDto> UpdateAsync(int id, UpdateTeamDto updateTeamDto);
    Task<bool> DeactivateAsync(int id);
    Task<IEnumerable<TeamDto>> GetTeamsByDepartmentAsync(int departmentId);
    Task<IEnumerable<TeamDto>> GetTeamsByUserIdAsync(int userId);
    Task<bool> IsTeamNameUniqueInDepartmentAsync(
        string name,
        int departmentId,
        int? excludeTeamId = null
    );
}
