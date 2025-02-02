using System;
using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public virtual ICollection<UserRole> UserRoles { get; set; }

        // These will be fully utilized when we create the Ticket entity
        public virtual ICollection<Ticket> CreatedTickets { get; set; }
        public virtual ICollection<Ticket> AssignedTickets { get; set; }

        public User()
        {
            UserRoles = new HashSet<UserRole>();
            CreatedTickets = new HashSet<Ticket>();
            AssignedTickets = new HashSet<Ticket>();
        }
    }
}
