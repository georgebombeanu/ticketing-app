using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface IFAQItemRepository : IRepository<FAQItem>
    {
        Task<IEnumerable<FAQItem>> GetFAQsByCategoryAsync(int categoryId);
        Task<IEnumerable<FAQItem>> GetActiveFAQsAsync();
        Task<IEnumerable<FAQItem>> SearchFAQsAsync(string searchTerm);
        Task<FAQItem> GetFAQWithDetailsAsync(int id);
    }
}