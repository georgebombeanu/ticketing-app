using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketFeedbackRepository : IRepository<TicketFeedback>
    {
        Task<IEnumerable<TicketFeedback>> GetFeedbackByTicketAsync(int ticketId);
        Task<IEnumerable<TicketFeedback>> GetFeedbackByUserAsync(int userId);
        Task<bool> HasUserProvidedFeedbackAsync(int ticketId, int userId);
        Task<double> GetAveragePositiveFeedbackRateAsync();
    }
}
