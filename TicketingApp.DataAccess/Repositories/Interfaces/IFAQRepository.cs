using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface IFAQRepository : IRepository<FAQItem>
    {
        Task<IEnumerable<FAQCategory>> GetAllCategoriesAsync();
        Task<FAQCategory> GetCategoryWithItemsAsync(int categoryId);
        Task<IEnumerable<FAQItem>> GetFAQsByCategory(int categoryId);
        Task<IEnumerable<FAQItem>> GetActiveFAQsAsync();
        Task<IEnumerable<FAQItem>> SearchFAQsAsync(string searchTerm);
        Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null);
    }
}
