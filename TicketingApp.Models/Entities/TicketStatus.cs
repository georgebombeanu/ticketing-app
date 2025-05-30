using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class TicketStatus
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        
        public string Color { get; set; } = "#4caf50"; // Default green
        public string Icon { get; set; } = "Schedule"; // Default schedule icon

        // Navigation property
        public virtual ICollection<Ticket> Tickets { get; set; }

        public TicketStatus()
        {
            Tickets = new HashSet<Ticket>();
        }
    }
}