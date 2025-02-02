using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketCommentRepository : IRepository<TicketComment>
    {
        Task<IEnumerable<TicketComment>> GetCommentsByTicketAsync(int ticketId);
        Task<IEnumerable<TicketComment>> GetCommentsByUserAsync(int userId);
        Task<IEnumerable<TicketComment>> GetInternalCommentsByTicketAsync(int ticketId);
        Task<TicketComment> GetCommentWithUserAsync(int commentId);
    }
}
