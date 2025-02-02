using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface IUserService
{
    Task<UserDto> GetByIdAsync(int id);
    Task<UserDto> GetByEmailAsync(string email);
    Task<IEnumerable<UserDto>> GetAllActiveAsync();
    Task<UserDto> CreateAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateAsync(int id, UpdateUserDto updateUserDto);
    Task<bool> DeactivateAsync(int id);
    Task<IEnumerable<UserDto>> GetUsersByDepartmentAsync(int departmentId);
    Task<IEnumerable<UserDto>> GetUsersByTeamAsync(int teamId);
}
