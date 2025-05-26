using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories.Interfaces;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Repositories
{
    public class TicketRepository : Repository<Ticket>, ITicketRepository
    {
        public TicketRepository(TicketingContext context)
            : base(context) { }

        public async Task<Ticket> GetTicketWithDetailsAsync(int id)
        {
            return await _context
                .Tickets.Include(t => t.Category)
                .Include(t => t.Priority)
                .Include(t => t.Status)
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedTo)
                .Include(t => t.Department)
                .Include(t => t.Team)
                .Include(t => t.Comments)
                .ThenInclude(c => c.User)
                .Include(t => t.Attachments)
                .Include(t => t.Feedback)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByUserAsync(int userId)
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.CreatedById == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsAssignedToUserAsync(int userId)
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.AssignedToId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByDepartmentAsync(int departmentId)
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.DepartmentId == departmentId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByTeamAsync(int teamId)
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.TeamId == teamId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByStatusAsync(int statusId)
        {
            return await _context
                .Tickets.Include(t => t.Priority)
                .Include(t => t.Department)
                .Where(t => t.StatusId == statusId)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByPriorityAsync(int priorityId)
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Department)
                .Where(t => t.PriorityId == priorityId)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByCategoryAsync(int categoryId)
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.CategoryId == categoryId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetActiveTicketsAsync()
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.ClosedAt == null)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsCreatedBetweenDatesAsync(
            DateTime startDate,
            DateTime endDate
        )
        {
            return await _context
                .Tickets.Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetAllTicketsWithDetailsAsync()
        {
            return await _context
                .Tickets.Include(t => t.Category)
                .Include(t => t.Priority)
                .Include(t => t.Status)
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedTo)
                .Include(t => t.Department)
                .Include(t => t.Team)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
    }
}
