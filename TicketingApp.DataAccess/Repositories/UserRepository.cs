using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(TicketingContext context)
            : base(context) { }

        public async Task<User> GetUserWithRolesAsync(int id)
        {
            return await _context
                .Users.Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Department)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Team)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<User>> GetUsersByDepartmentAsync(int departmentId)
        {
            return await _context
                .Users.Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.DepartmentId == departmentId))
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersByTeamAsync(int teamId)
        {
            return await _context
                .Users.Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.TeamId == teamId))
                .ToListAsync();
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u =>
                u.Email.ToLower() == email.ToLower()
            );
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null)
        {
            return !await _context.Users.AnyAsync(u =>
                u.Email.ToLower() == email.ToLower()
                && (!excludeUserId.HasValue || u.Id != excludeUserId.Value)
            );
        }

        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Department)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Team)
                .Where(u => u.IsActive)
                .ToListAsync();
        }

        public async Task<User> GetUserWithRolesAndAuthDataAsync(string email)
        {
            return await _context
                .Users.Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Department)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Team)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower() && u.IsActive);
        }
    }
}
