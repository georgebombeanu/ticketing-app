using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class DepartmentRepository : Repository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(TicketingContext context)
            : base(context) { }

        public async Task<Department> GetDepartmentWithTeamsAsync(int id)
        {
            return await _context
                .Departments.Include(d => d.Teams)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Department> GetDepartmentWithUsersAsync(int id)
        {
            return await _context
                .Departments.Include(d => d.UserRoles)
                .ThenInclude(ur => ur.User)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<bool> IsDepartmentNameUniqueAsync(
            string name,
            int? excludeDepartmentId = null
        )
        {
            return !await _context.Departments.AnyAsync(d =>
                d.Name.ToLower() == name.ToLower()
                && (!excludeDepartmentId.HasValue || d.Id != excludeDepartmentId.Value)
            );
        }

        public async Task<IEnumerable<Department>> GetActiveDepartmentsAsync()
        {
            return await _context.Departments
                .Include(d => d.Teams.Where(t => t.IsActive))
                .Where(d => d.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Department>> GetDepartmentsByUserIdAsync(int userId)
        {
            return await _context
                .Departments.Include(d => d.UserRoles)
                .Where(d => d.UserRoles.Any(ur => ur.UserId == userId))
                .ToListAsync();
        }
    }
}
