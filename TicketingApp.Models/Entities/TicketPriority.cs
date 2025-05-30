using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class TicketPriority
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        
        public string Color { get; set; } = "#ff9800"; // Default orange
        public string Icon { get; set; } = "PriorityHigh"; // Default priority icon

        // Navigation property
        public virtual ICollection<Ticket> Tickets { get; set; }

        public TicketPriority()
        {
            Tickets = new HashSet<Ticket>();
        }
    }
}