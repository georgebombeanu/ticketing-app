using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITeamRepository : IRepository<Team>
    {
        Task<Team> GetTeamWithUsersAsync(int id);
        Task<Team> GetTeamWithTicketsAsync(int id);
        Task<IEnumerable<Team>> GetTeamsByDepartmentAsync(int departmentId);
        Task<bool> IsTeamNameUniqueInDepartmentAsync(
            string name,
            int departmentId,
            int? excludeTeamId = null
        );
        Task<IEnumerable<Team>> GetActiveTeamsAsync();
        Task<IEnumerable<Team>> GetTeamsByUserIdAsync(int userId);
    }
}
