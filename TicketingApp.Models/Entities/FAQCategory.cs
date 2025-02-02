using System;
using System.Collections.Generic;

namespace TicketingApp.Models.Entities
{
    public class FAQCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }

        // Navigation property
        public virtual ICollection<FAQItem> FAQItems { get; set; }

        public FAQCategory()
        {
            FAQItems = new HashSet<FAQItem>();
        }
    }
}
