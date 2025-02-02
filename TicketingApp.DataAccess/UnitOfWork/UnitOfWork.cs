using System;
using System.Threading.Tasks;
using TicketingApp.DataAccess.Context;
using TicketingApp.DataAccess.Repositories;
using TicketingApp.DataAccess.Repositories.Interfaces;

namespace TicketingApp.DataAccess
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly TicketingContext _context;
        
        private IUserRepository? _users;
        private IRoleRepository? _roles;
        private IDepartmentRepository? _departments;
        private ITeamRepository? _teams;
        private ITicketRepository? _tickets;
        private ITicketCategoryRepository? _ticketCategories;
        private ITicketPriorityRepository? _ticketPriorities;
        private ITicketStatusRepository? _ticketStatuses;
        private ITicketCommentRepository? _ticketComments;
        private ITicketAttachmentRepository? _ticketAttachments;
        private ITicketFeedbackRepository? _ticketFeedback;
        private IFAQRepository? _faqs;

        public UnitOfWork(TicketingContext context)
        {
            _context = context;
        }

        public IUserRepository Users => _users ??= new UserRepository(_context);
        public IRoleRepository Roles => _roles ??= new RoleRepository(_context);
        public IDepartmentRepository Departments => _departments ??= new DepartmentRepository(_context);
        public ITeamRepository Teams => _teams ??= new TeamRepository(_context);
        public ITicketRepository Tickets => _tickets ??= new TicketRepository(_context);
        public ITicketCategoryRepository TicketCategories => _ticketCategories ??= new TicketCategoryRepository(_context);
        public ITicketPriorityRepository TicketPriorities => _ticketPriorities ??= new TicketPriorityRepository(_context);
        public ITicketStatusRepository TicketStatuses => _ticketStatuses ??= new TicketStatusRepository(_context);
        public ITicketCommentRepository TicketComments => _ticketComments ??= new TicketCommentRepository(_context);
        public ITicketAttachmentRepository TicketAttachments => _ticketAttachments ??= new TicketAttachmentRepository(_context);
        public ITicketFeedbackRepository TicketFeedback => _ticketFeedback ??= new TicketFeedbackRepository(_context);
        public IFAQRepository FAQs => _faqs ??= new FAQRepository(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
