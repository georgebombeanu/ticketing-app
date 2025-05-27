using System;

namespace TicketingApp.Models.Entities
{
    public class FAQItem
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
        public int CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual FAQCategory Category { get; set; }
        public virtual User CreatedBy { get; set; }
    }
}
