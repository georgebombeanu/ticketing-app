using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketPriorityRepository : Repository<TicketPriority>, ITicketPriorityRepository
    {
        public TicketPriorityRepository(TicketingContext context)
            : base(context) { }

        public async Task<TicketPriority> GetPriorityWithTicketsAsync(int id)
        {
            return await _context
                .TicketPriorities.Include(tp => tp.Tickets)
                .FirstOrDefaultAsync(tp => tp.Id == id);
        }

        public async Task<bool> IsPriorityNameUniqueAsync(
            string name,
            int? excludePriorityId = null
        )
        {
            return !await _context.TicketPriorities.AnyAsync(tp =>
                tp.Name.ToLower() == name.ToLower()
                && (!excludePriorityId.HasValue || tp.Id != excludePriorityId.Value)
            );
        }

        public async Task<IEnumerable<TicketPriority>> GetAllOrderedByNameAsync()
        {
            return await _context.TicketPriorities.OrderBy(tp => tp.Name).ToListAsync();
        }
    }
}
