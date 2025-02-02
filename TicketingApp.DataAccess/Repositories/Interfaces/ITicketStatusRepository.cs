using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketStatusRepository : IRepository<TicketStatus>
    {
        Task<TicketStatus> GetStatusWithTicketsAsync(int id);
        Task<bool> IsStatusNameUniqueAsync(string name, int? excludeStatusId = null);
        Task<IEnumerable<TicketStatus>> GetAllOrderedByNameAsync();
        Task<int> GetTicketCountByStatusAsync(int statusId);
    }
}
