using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketAttachmentRepository : Repository<TicketAttachment>, ITicketAttachmentRepository
    {
        public TicketAttachmentRepository(TicketingContext context) : base(context) { }

        public async Task<IEnumerable<TicketAttachment>> GetAttachmentsByTicketAsync(int ticketId)
        {
            return await _context
                .TicketAttachments.Include(ta => ta.User)
                .Where(ta => ta.TicketId == ticketId)
                .OrderByDescending(ta => ta.UploadedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<TicketAttachment>> GetAttachmentsByUserAsync(int userId)
        {
            return await _context
                .TicketAttachments.Include(ta => ta.Ticket)
                .Where(ta => ta.UserId == userId)
                .OrderByDescending(ta => ta.UploadedAt)
                .ToListAsync();
        }

        public async Task<TicketAttachment> GetAttachmentWithDetailsAsync(int attachmentId)
        {
            return await _context
                .TicketAttachments
                .Include(ta => ta.User)
                .Include(ta => ta.Ticket)
                .FirstOrDefaultAsync(ta => ta.Id == attachmentId);
        }
    }
}
