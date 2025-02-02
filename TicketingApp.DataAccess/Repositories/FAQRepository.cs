using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class FAQRepository : Repository<FAQItem>, IFAQRepository
    {
        public FAQRepository(TicketingContext context)
            : base(context) { }

        public async Task<IEnumerable<FAQCategory>> GetAllCategoriesAsync()
        {
            return await _context
                .FAQCategories.Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<FAQCategory> GetCategoryWithItemsAsync(int categoryId)
        {
            return await _context
                .FAQCategories.Include(c => c.FAQItems.Where(i => i.IsActive))
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.IsActive);
        }

        public async Task<IEnumerable<FAQItem>> GetFAQsByCategory(int categoryId)
        {
            return await _context
                .FAQItems.Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .Where(f => f.CategoryId == categoryId && f.IsActive && f.Category.IsActive)
                .OrderBy(f => f.Question)
                .ToListAsync();
        }

        public async Task<IEnumerable<FAQItem>> GetActiveFAQsAsync()
        {
            return await _context
                .FAQItems.Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .Where(f => f.IsActive && f.Category.IsActive)
                .OrderBy(f => f.Category.Name)
                .ThenBy(f => f.Question)
                .ToListAsync();
        }

        public async Task<IEnumerable<FAQItem>> SearchFAQsAsync(string searchTerm)
        {
            return await _context
                .FAQItems.Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .Where(f =>
                    f.IsActive
                    && f.Category.IsActive
                    && (f.Question.Contains(searchTerm) || f.Answer.Contains(searchTerm))
                )
                .OrderBy(f => f.Category.Name)
                .ThenBy(f => f.Question)
                .ToListAsync();
        }

        public async Task<bool> IsCategoryNameUniqueAsync(
            string name,
            int? excludeCategoryId = null
        )
        {
            return !await _context.FAQCategories.AnyAsync(c =>
                c.Name.ToLower() == name.ToLower()
                && (!excludeCategoryId.HasValue || c.Id != excludeCategoryId.Value)
            );
        }
    }
}
