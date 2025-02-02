using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<Role> GetRoleWithUsersAsync(int id);
        Task<bool> IsRoleNameUniqueAsync(string name, int? excludeRoleId = null);
        Task<IEnumerable<Role>> GetRolesByUserIdAsync(int userId);
    }
}
