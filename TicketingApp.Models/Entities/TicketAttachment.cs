using System;

namespace TicketingApp.Models.Entities
{
    public class TicketAttachment
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }

        // Navigation properties
        public virtual Ticket Ticket { get; set; }
        public virtual User User { get; set; }
    }
}
