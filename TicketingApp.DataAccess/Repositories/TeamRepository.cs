using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TeamRepository : Repository<Team>, ITeamRepository
    {
        public TeamRepository(TicketingContext context)
            : base(context) { }

        public async Task<Team> GetTeamWithUsersAsync(int id)
        {
            return await _context
                .Teams.Include(t => t.UserRoles)
                .ThenInclude(ur => ur.User)
                .Include(t => t.Department)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Team> GetTeamWithTicketsAsync(int id)
        {
            return await _context
                .Teams.Include(t => t.Tickets)
                .ThenInclude(ticket => ticket.Status)
                .Include(t => t.Department)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Team>> GetTeamsByDepartmentAsync(int departmentId)
        {
            return await _context
                .Teams.Include(t => t.Department)
                .Where(t => t.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<bool> IsTeamNameUniqueInDepartmentAsync(
            string name,
            int departmentId,
            int? excludeTeamId = null
        )
        {
            return !await _context.Teams.AnyAsync(t =>
                t.Name.ToLower() == name.ToLower()
                && t.DepartmentId == departmentId
                && (!excludeTeamId.HasValue || t.Id != excludeTeamId.Value)
            );
        }

        public async Task<IEnumerable<Team>> GetActiveTeamsAsync()
        {
            return await _context
                .Teams.Include(t => t.Department)
                .Where(t => t.IsActive && t.Department.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Team>> GetTeamsByUserIdAsync(int userId)
        {
            return await _context
                .Teams.Include(t => t.Department)
                .Include(t => t.UserRoles)
                .Where(t => t.UserRoles.Any(ur => ur.UserId == userId))
                .ToListAsync();
        }
    }
}
