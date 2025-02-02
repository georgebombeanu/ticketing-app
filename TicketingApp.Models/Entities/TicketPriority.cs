using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class TicketPriority
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Navigation property
        public virtual ICollection<Ticket> Tickets { get; set; }

        public TicketPriority()
        {
            Tickets = new HashSet<Ticket>();
        }
    }
}
