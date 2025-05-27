using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface IFAQCategoryRepository : IRepository<FAQCategory>
    {
        Task<FAQCategory> GetCategoryWithItemsAsync(int categoryId);
        Task<IEnumerable<FAQCategory>> GetActiveCategoriesAsync();
        Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null);
    }
}