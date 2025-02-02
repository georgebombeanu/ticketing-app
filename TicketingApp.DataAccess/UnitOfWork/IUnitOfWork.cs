using System;
using System.Threading.Tasks;
using TicketingApp.DataAccess.Repositories.Interfaces;

namespace TicketingApp.DataAccess
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IRoleRepository Roles { get; }
        IDepartmentRepository Departments { get; }
        ITeamRepository Teams { get; }
        ITicketRepository Tickets { get; }
        ITicketCategoryRepository TicketCategories { get; }
        ITicketPriorityRepository TicketPriorities { get; }
        ITicketStatusRepository TicketStatuses { get; }
        ITicketCommentRepository TicketComments { get; }
        ITicketAttachmentRepository TicketAttachments { get; }
        ITicketFeedbackRepository TicketFeedback { get; }
        IFAQRepository FAQs { get; }

        Task<int> CompleteAsync();
    }
}
