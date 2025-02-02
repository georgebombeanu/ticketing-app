using System;

namespace TicketingApp.Models.Entities
{
    public class TicketFeedback
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public bool IsLiked { get; set; }
        public string FeedbackText { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Ticket Ticket { get; set; }
        public virtual User User { get; set; }
    }
}
