using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketCommentRepository : Repository<TicketComment>, ITicketCommentRepository
    {
        public TicketCommentRepository(TicketingContext context)
            : base(context) { }

        public async Task<IEnumerable<TicketComment>> GetCommentsByTicketAsync(int ticketId)
        {
            return await _context
                .TicketComments.Include(tc => tc.User)
                .Where(tc => tc.TicketId == ticketId)
                .OrderByDescending(tc => tc.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<TicketComment>> GetCommentsByUserAsync(int userId)
        {
            return await _context
                .TicketComments.Include(tc => tc.Ticket)
                .Where(tc => tc.UserId == userId)
                .OrderByDescending(tc => tc.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<TicketComment>> GetInternalCommentsByTicketAsync(int ticketId)
        {
            return await _context
                .TicketComments.Include(tc => tc.User)
                .Where(tc => tc.TicketId == ticketId && tc.IsInternal)
                .OrderByDescending(tc => tc.CreatedAt)
                .ToListAsync();
        }

        public async Task<TicketComment> GetCommentWithUserAsync(int commentId)
        {
            return await _context
                .TicketComments.Include(tc => tc.User)
                .Include(tc => tc.Ticket)
                .FirstOrDefaultAsync(tc => tc.Id == commentId);
        }
    }
}
