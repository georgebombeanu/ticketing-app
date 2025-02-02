using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketFeedbackRepository : Repository<TicketFeedback>, ITicketFeedbackRepository
    {
        public TicketFeedbackRepository(TicketingContext context)
            : base(context) { }

        public async Task<IEnumerable<TicketFeedback>> GetFeedbackByTicketAsync(int ticketId)
        {
            return await _context
                .TicketFeedback.Include(tf => tf.User)
                .Where(tf => tf.TicketId == ticketId)
                .OrderByDescending(tf => tf.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<TicketFeedback>> GetFeedbackByUserAsync(int userId)
        {
            return await _context
                .TicketFeedback.Include(tf => tf.Ticket)
                .Where(tf => tf.UserId == userId)
                .OrderByDescending(tf => tf.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> HasUserProvidedFeedbackAsync(int ticketId, int userId)
        {
            return await _context.TicketFeedback.AnyAsync(tf =>
                tf.TicketId == ticketId && tf.UserId == userId
            );
        }

        public async Task<double> GetAveragePositiveFeedbackRateAsync()
        {
            var totalFeedback = await _context.TicketFeedback.CountAsync();
            if (totalFeedback == 0)
                return 0;

            var positiveFeedback = await _context.TicketFeedback.CountAsync(tf => tf.IsLiked);

            return (double)positiveFeedback / totalFeedback * 100;
        }
    }
}
