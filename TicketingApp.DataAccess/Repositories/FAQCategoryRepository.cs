using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class FAQCategoryRepository : Repository<FAQCategory>, IFAQCategoryRepository
    {
        public FAQCategoryRepository(TicketingContext context) : base(context) { }

        public async Task<FAQCategory> GetCategoryWithItemsAsync(int categoryId)
        {
            return await _context.FAQCategories
                .Include(c => c.FAQItems.Where(i => i.IsActive))
                .ThenInclude(i => i.CreatedBy)
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.IsActive);
        }

        public async Task<IEnumerable<FAQCategory>> GetActiveCategoriesAsync()
        {
            return await _context.FAQCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null)
        {
            return !await _context.FAQCategories.AnyAsync(c =>
                c.Name.ToLower() == name.ToLower() &&
                (!excludeCategoryId.HasValue || c.Id != excludeCategoryId.Value));
        }
    }
}