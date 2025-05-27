using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class FAQItemRepository : Repository<FAQItem>, IFAQItemRepository
    {
        public FAQItemRepository(TicketingContext context) : base(context) { }

        public async Task<IEnumerable<FAQItem>> GetFAQsByCategoryAsync(int categoryId)
        {
            return await _context.FAQItems
                .Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .Where(f => f.CategoryId == categoryId && f.IsActive && f.Category.IsActive)
                .OrderBy(f => f.Question)
                .ToListAsync();
        }

        public async Task<IEnumerable<FAQItem>> GetActiveFAQsAsync()
        {
            return await _context.FAQItems
                .Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .Where(f => f.IsActive && f.Category.IsActive)
                .OrderBy(f => f.Category.Name)
                .ThenBy(f => f.Question)
                .ToListAsync();
        }

        public async Task<IEnumerable<FAQItem>> SearchFAQsAsync(string searchTerm)
        {
            return await _context.FAQItems
                .Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .Where(f => f.IsActive && f.Category.IsActive &&
                           (f.Question.Contains(searchTerm) || f.Answer.Contains(searchTerm)))
                .OrderBy(f => f.Category.Name)
                .ThenBy(f => f.Question)
                .ToListAsync();
        }

        public async Task<FAQItem> GetFAQWithDetailsAsync(int id)
        {
            return await _context.FAQItems
                .Include(f => f.Category)
                .Include(f => f.CreatedBy)
                .FirstOrDefaultAsync(f => f.Id == id);
        }
    }
}