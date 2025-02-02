using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories.Interfaces
{
    public interface ITicketRepository : IRepository<Ticket>
    {
        Task<Ticket> GetTicketWithDetailsAsync(int id);
        Task<IEnumerable<Ticket>> GetTicketsByUserAsync(int userId);
        Task<IEnumerable<Ticket>> GetTicketsAssignedToUserAsync(int userId);
        Task<IEnumerable<Ticket>> GetTicketsByDepartmentAsync(int departmentId);
        Task<IEnumerable<Ticket>> GetTicketsByTeamAsync(int teamId);
        Task<IEnumerable<Ticket>> GetTicketsByStatusAsync(int statusId);
        Task<IEnumerable<Ticket>> GetTicketsByPriorityAsync(int priorityId);
        Task<IEnumerable<Ticket>> GetTicketsByCategoryAsync(int categoryId);
        Task<IEnumerable<Ticket>> GetActiveTicketsAsync();
        Task<IEnumerable<Ticket>> GetTicketsCreatedBetweenDatesAsync(
            DateTime startDate,
            DateTime endDate
        );
    }
}
