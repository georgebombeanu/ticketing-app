using System;
using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class Department
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual ICollection<Team> Teams { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; }
        public virtual ICollection<Ticket> Tickets { get; set; }

        public Department()
        {
            Teams = new HashSet<Team>();
            UserRoles = new HashSet<UserRole>();
            Tickets = new HashSet<Ticket>();
        }
    }
}
