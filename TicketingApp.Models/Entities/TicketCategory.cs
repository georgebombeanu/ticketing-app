using System;
using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class TicketCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }

        // Navigation property
        public virtual ICollection<Ticket> Tickets { get; set; }

        public TicketCategory()
        {
            Tickets = new HashSet<Ticket>();
        }
    }
}
