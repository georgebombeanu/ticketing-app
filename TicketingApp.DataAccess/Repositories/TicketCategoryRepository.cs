using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketCategoryRepository : Repository<TicketCategory>, ITicketCategoryRepository
    {
        public TicketCategoryRepository(TicketingContext context)
            : base(context) { }

        public async Task<TicketCategory> GetCategoryWithTicketsAsync(int id)
        {
            return await _context
                .TicketCategories.Include(tc => tc.Tickets)
                .FirstOrDefaultAsync(tc => tc.Id == id);
        }

        public async Task<IEnumerable<TicketCategory>> GetActiveCategories()
        {
            return await _context.TicketCategories.Where(tc => tc.IsActive).ToListAsync();
        }

        public async Task<bool> IsCategoryNameUniqueAsync(
            string name,
            int? excludeCategoryId = null
        )
        {
            return !await _context.TicketCategories.AnyAsync(tc =>
                tc.Name.ToLower() == name.ToLower()
                && (!excludeCategoryId.HasValue || tc.Id != excludeCategoryId.Value)
            );
        }
    }
}
