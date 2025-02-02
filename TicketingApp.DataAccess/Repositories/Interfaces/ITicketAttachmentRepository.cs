using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketAttachmentRepository : IRepository<TicketAttachment>
    {
        Task<IEnumerable<TicketAttachment>> GetAttachmentsByTicketAsync(int ticketId);
        Task<IEnumerable<TicketAttachment>> GetAttachmentsByUserAsync(int userId);
        Task<TicketAttachment> GetAttachmentWithDetailsAsync(int attachmentId);
    }
}
