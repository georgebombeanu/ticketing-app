using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface IDepartmentRepository : IRepository<Department>
    {
        Task<Department> GetDepartmentWithTeamsAsync(int id);
        Task<Department> GetDepartmentWithUsersAsync(int id);
        Task<bool> IsDepartmentNameUniqueAsync(string name, int? excludeDepartmentId = null);
        Task<IEnumerable<Department>> GetActiveDepartmentsAsync();
        Task<IEnumerable<Department>> GetDepartmentsByUserIdAsync(int userId);
    }
}
