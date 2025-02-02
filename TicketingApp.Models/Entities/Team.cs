using System;
using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class Team
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual Department Department { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; }
        public virtual ICollection<Ticket> Tickets { get; set; }

        public Team()
        {
            UserRoles = new HashSet<UserRole>();
            Tickets = new HashSet<Ticket>();
        }
    }
}
