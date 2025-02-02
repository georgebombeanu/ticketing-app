using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketStatusRepository : Repository<TicketStatus>, ITicketStatusRepository
    {
        public TicketStatusRepository(TicketingContext context)
            : base(context) { }

        public async Task<TicketStatus> GetStatusWithTicketsAsync(int id)
        {
            return await _context
                .TicketStatuses.Include(ts => ts.Tickets)
                .FirstOrDefaultAsync(ts => ts.Id == id);
        }

        public async Task<bool> IsStatusNameUniqueAsync(string name, int? excludeStatusId = null)
        {
            return !await _context.TicketStatuses.AnyAsync(ts =>
                ts.Name.ToLower() == name.ToLower()
                && (!excludeStatusId.HasValue || ts.Id != excludeStatusId.Value)
            );
        }

        public async Task<IEnumerable<TicketStatus>> GetAllOrderedByNameAsync()
        {
            return await _context.TicketStatuses.OrderBy(ts => ts.Name).ToListAsync();
        }

        public async Task<int> GetTicketCountByStatusAsync(int statusId)
        {
            return await _context.Tickets.CountAsync(t => t.StatusId == statusId);
        }
    }
}
