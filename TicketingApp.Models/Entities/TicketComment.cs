using System;

namespace TicketingApp.Models.Entities
{
    public class TicketComment
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsInternal { get; set; }

        // Navigation properties
        public virtual Ticket Ticket { get; set; }
        public virtual User User { get; set; }
    }
}
