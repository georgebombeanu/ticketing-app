using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketCategoryRepository : IRepository<TicketCategory>
    {
        Task<TicketCategory> GetCategoryWithTicketsAsync(int id);
        Task<IEnumerable<TicketCategory>> GetActiveCategories();
        Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null);
    }
}
