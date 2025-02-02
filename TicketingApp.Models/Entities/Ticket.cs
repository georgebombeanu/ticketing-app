using System;
using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public int PriorityId { get; set; }
        public int StatusId { get; set; }
        public int CreatedById { get; set; }
        public int? AssignedToId { get; set; }
        public int DepartmentId { get; set; }
        public int? TeamId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        // Navigation properties
        public virtual TicketCategory Category { get; set; }
        public virtual TicketPriority Priority { get; set; }
        public virtual TicketStatus Status { get; set; }
        public virtual User CreatedBy { get; set; }
        public virtual User AssignedTo { get; set; }
        public virtual Department Department { get; set; }
        public virtual Team Team { get; set; }
        public virtual ICollection<TicketComment> Comments { get; set; }
        public virtual ICollection<TicketAttachment> Attachments { get; set; }
        public virtual ICollection<TicketFeedback> Feedback { get; set; }

        public Ticket()
        {
            Comments = new HashSet<TicketComment>();
            Attachments = new HashSet<TicketAttachment>();
            Feedback = new HashSet<TicketFeedback>();
        }
    }
}
