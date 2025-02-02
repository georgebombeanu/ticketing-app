using Microsoft.EntityFrameworkCore;
using TicketingApp.Models.Entities;

namespace TicketingApp.DataAccess.Context
{
    public class TicketingContext : DbContext
    {
        public TicketingContext(DbContextOptions<TicketingContext> options)
            : base(options) { }

        // Core entities
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Team> Teams { get; set; } = null!;
        public DbSet<UserRole> UserRoles { get; set; } = null!;

        // Ticket related entities
        public DbSet<Ticket> Tickets { get; set; } = null!;
        public DbSet<TicketCategory> TicketCategories { get; set; } = null!;
        public DbSet<TicketPriority> TicketPriorities { get; set; } = null!;
        public DbSet<TicketStatus> TicketStatuses { get; set; } = null!;
        public DbSet<TicketComment> TicketComments { get; set; } = null!;
        public DbSet<TicketAttachment> TicketAttachments { get; set; } = null!;
        public DbSet<TicketFeedback> TicketFeedback { get; set; } = null!;

        // FAQ entities
        public DbSet<FAQCategory> FAQCategories { get; set; } = null!;
        public DbSet<FAQItem> FAQItems { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Existing configurations...

            modelBuilder.Entity<TicketCategory>(entity =>
            {
                entity.ToTable("TicketCategories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<TicketPriority>(entity =>
            {
                entity.ToTable("TicketPriorities");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<TicketStatus>(entity =>
            {
                entity.ToTable("TicketStatus");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.ToTable("Tickets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Configure relationships
                entity
                    .HasOne(e => e.Category)
                    .WithMany(c => c.Tickets)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.Priority)
                    .WithMany(p => p.Tickets)
                    .HasForeignKey(e => e.PriorityId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.Status)
                    .WithMany(s => s.Tickets)
                    .HasForeignKey(e => e.StatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.CreatedBy)
                    .WithMany(u => u.CreatedTickets)
                    .HasForeignKey(e => e.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.AssignedTo)
                    .WithMany(u => u.AssignedTickets)
                    .HasForeignKey(e => e.AssignedToId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.Department)
                    .WithMany(d => d.Tickets)
                    .HasForeignKey(e => e.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.Team)
                    .WithMany(t => t.Tickets)
                    .HasForeignKey(e => e.TeamId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketComment>(entity =>
            {
                entity.ToTable("TicketComments");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Comment).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsInternal).HasDefaultValue(false);

                // Configure relationships
                entity
                    .HasOne(e => e.Ticket)
                    .WithMany(t => t.Comments)
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketAttachment>(entity =>
            {
                entity.ToTable("TicketAttachments");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FilePath).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.UploadedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Configure relationships
                entity
                    .HasOne(e => e.Ticket)
                    .WithMany(t => t.Attachments)
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketFeedback>(entity =>
            {
                entity.ToTable("TicketFeedback");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FeedbackText).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Configure relationships
                entity
                    .HasOne(e => e.Ticket)
                    .WithMany(t => t.Feedback)
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Ensure one feedback per user per ticket
                entity.HasIndex(e => new { e.TicketId, e.UserId }).IsUnique();
            });

            modelBuilder.Entity<FAQCategory>(entity =>
            {
                entity.ToTable("FAQCategories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // Add unique index on category name
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<FAQItem>(entity =>
            {
                entity.ToTable("FAQItems");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Answer).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // Configure relationships
                entity
                    .HasOne(e => e.Category)
                    .WithMany(c => c.FAQItems)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.CreatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
