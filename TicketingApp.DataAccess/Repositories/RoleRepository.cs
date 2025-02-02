using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class RoleRepository : Repository<Role>, IRoleRepository
    {
        public RoleRepository(TicketingContext context)
            : base(context) { }

        public async Task<Role> GetRoleWithUsersAsync(int id)
        {
            return await _context
                .Roles.Include(r => r.UserRoles)
                .ThenInclude(ur => ur.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<bool> IsRoleNameUniqueAsync(string name, int? excludeRoleId = null)
        {
            return !await _context.Roles.AnyAsync(r =>
                r.Name.ToLower() == name.ToLower()
                && (!excludeRoleId.HasValue || r.Id != excludeRoleId.Value)
            );
        }

        public async Task<IEnumerable<Role>> GetRolesByUserIdAsync(int userId)
        {
            return await _context
                .Roles.Include(r => r.UserRoles)
                .Where(r => r.UserRoles.Any(ur => ur.UserId == userId))
                .ToListAsync();
        }
    }
}
