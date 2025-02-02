// TicketingApp.DataAccess/Repositories/Interfaces/IUserRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetUserWithRolesAsync(int id);
        Task<User> GetUserWithRolesAndAuthDataAsync(string email);
        Task<IEnumerable<User>> GetUsersByDepartmentAsync(int departmentId);
        Task<IEnumerable<User>> GetUsersByTeamAsync(int teamId);
        Task<User> GetUserByEmailAsync(string email);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null);
        Task<IEnumerable<User>> GetActiveUsersAsync();
    }
}
