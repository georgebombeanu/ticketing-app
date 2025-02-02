using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketPriorityRepository : IRepository<TicketPriority>
    {
        Task<TicketPriority> GetPriorityWithTicketsAsync(int id);
        Task<bool> IsPriorityNameUniqueAsync(string name, int? excludePriorityId = null);
        Task<IEnumerable<TicketPriority>> GetAllOrderedByNameAsync();
    }
}
