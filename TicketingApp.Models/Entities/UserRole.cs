using System;

namespace TicketingApp.Models.Entities
{
    public class UserRole
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public int? TeamId { get; set; }
        public DateTime AssignedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Role Role { get; set; }
        public virtual Department Department { get; set; }
        public virtual Team Team { get; set; }
    }
}
