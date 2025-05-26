using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess.Context;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Security;

namespace TicketingApp.API.Data;

public class DatabaseSeeder
{
    private readonly TicketingContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public DatabaseSeeder(TicketingContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync()
    {
        // Check if database is already seeded
        if (await _context.Users.AnyAsync())
        {
            return; // Database already seeded
        }

        await SeedRolesAsync();
        await SeedTicketCategoriesAsync();
        await SeedTicketPrioritiesAsync();
        await SeedTicketStatusesAsync();
        await SeedDepartmentsAndTeamsAsync();
        await SeedUsersAsync();
        await SeedFAQCategoriesAsync();

        await _context.SaveChangesAsync();
    }

    private async Task SeedRolesAsync()
    {
        var roles = new[]
        {
            new Role { Name = "Admin", Description = "System Administrator with full access" },
            new Role { Name = "Manager", Description = "Department/Team Manager" },
            new Role { Name = "Agent", Description = "Support Agent who handles tickets" },
            new Role { Name = "User", Description = "End user who can create tickets" }
        };

        await _context.Roles.AddRangeAsync(roles);
        await _context.SaveChangesAsync();
    }

    private async Task SeedTicketCategoriesAsync()
    {
        var categories = new[]
        {
            new TicketCategory { Name = "Bug Report", Description = "Software bugs and issues", IsActive = true },
            new TicketCategory { Name = "Feature Request", Description = "New feature requests", IsActive = true },
            new TicketCategory { Name = "Technical Support", Description = "Technical assistance and support", IsActive = true },
            new TicketCategory { Name = "Account Issue", Description = "User account related problems", IsActive = true },
            new TicketCategory { Name = "General Inquiry", Description = "General questions and inquiries", IsActive = true },
            new TicketCategory { Name = "Hardware Issue", Description = "Hardware related problems", IsActive = true }
        };

        await _context.TicketCategories.AddRangeAsync(categories);
        await _context.SaveChangesAsync();
    }

    private async Task SeedTicketPrioritiesAsync()
    {
        var priorities = new[]
        {
            new TicketPriority { Name = "Low", Description = "Low priority - can be addressed when time permits" },
            new TicketPriority { Name = "Medium", Description = "Medium priority - normal business priority" },
            new TicketPriority { Name = "High", Description = "High priority - should be addressed quickly" },
            new TicketPriority { Name = "Critical", Description = "Critical priority - requires immediate attention" },
            new TicketPriority { Name = "Urgent", Description = "Urgent priority - business critical issue" }
        };

        await _context.TicketPriorities.AddRangeAsync(priorities);
        await _context.SaveChangesAsync();
    }

    private async Task SeedTicketStatusesAsync()
    {
        var statuses = new[]
        {
            new TicketStatus { Name = "Open", Description = "Newly created ticket, not yet assigned" },
            new TicketStatus { Name = "In Progress", Description = "Ticket is being worked on" },
            new TicketStatus { Name = "Pending", Description = "Waiting for customer response or external dependency" },
            new TicketStatus { Name = "Resolved", Description = "Issue has been resolved, awaiting confirmation" },
            new TicketStatus { Name = "Closed", Description = "Ticket has been completed and closed" },
            new TicketStatus { Name = "Cancelled", Description = "Ticket has been cancelled" }
        };

        await _context.TicketStatuses.AddRangeAsync(statuses);
        await _context.SaveChangesAsync();
    }

    private async Task SeedDepartmentsAndTeamsAsync()
    {
        var departments = new[]
        {
            new Department 
            { 
                Name = "IT Support", 
                Description = "Information Technology Support Department",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Department 
            { 
                Name = "Customer Service", 
                Description = "Customer Service and Support Department",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Department 
            { 
                Name = "Development", 
                Description = "Software Development Department",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };

        await _context.Departments.AddRangeAsync(departments);
        await _context.SaveChangesAsync();

        // Add teams to departments
        var teams = new[]
        {
            new Team 
            { 
                Name = "Hardware Support", 
                Description = "Hardware support and maintenance team",
                DepartmentId = departments[0].Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Team 
            { 
                Name = "Software Support", 
                Description = "Software support and troubleshooting team",
                DepartmentId = departments[0].Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Team 
            { 
                Name = "Help Desk", 
                Description = "First level customer support",
                DepartmentId = departments[1].Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Team 
            { 
                Name = "Backend Team", 
                Description = "Backend development team",
                DepartmentId = departments[2].Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };

        await _context.Teams.AddRangeAsync(teams);
        await _context.SaveChangesAsync();
    }

    private async Task SeedUsersAsync()
    {
        var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");
        var agentRole = await _context.Roles.FirstAsync(r => r.Name == "Agent");
        var userRole = await _context.Roles.FirstAsync(r => r.Name == "User");
        var managerRole = await _context.Roles.FirstAsync(r => r.Name == "Manager");

        var itDepartment = await _context.Departments.FirstAsync(d => d.Name == "IT Support");
        var customerServiceDepartment = await _context.Departments.FirstAsync(d => d.Name == "Customer Service");
        var developmentDepartment = await _context.Departments.FirstAsync(d => d.Name == "Development");

        var softwareTeam = await _context.Teams.FirstAsync(t => t.Name == "Software Support");
        var helpDeskTeam = await _context.Teams.FirstAsync(t => t.Name == "Help Desk");
        var backendTeam = await _context.Teams.FirstAsync(t => t.Name == "Backend Team");

        var users = new[]
        {
            new User
            {
                Email = "admin@ticketingapp.com",
                PasswordHash = _passwordHasher.HashPassword("Admin123!"),
                FirstName = "System",
                LastName = "Administrator",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "john.doe@ticketingapp.com",
                PasswordHash = _passwordHasher.HashPassword("Password123!"),
                FirstName = "John",
                LastName = "Doe",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "jane.smith@ticketingapp.com",
                PasswordHash = _passwordHasher.HashPassword("Password123!"),
                FirstName = "Jane",
                LastName = "Smith",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "mike.wilson@ticketingapp.com",
                PasswordHash = _passwordHasher.HashPassword("Password123!"),
                FirstName = "Mike",
                LastName = "Wilson",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "sarah.johnson@ticketingapp.com",
                PasswordHash = _passwordHasher.HashPassword("Password123!"),
                FirstName = "Sarah",
                LastName = "Johnson",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        // Assign roles to users
        var userRoles = new[]
        {
            // Admin user - System admin
            new UserRole
            {
                UserId = users[0].Id,
                RoleId = adminRole.Id,
                AssignedAt = DateTime.UtcNow
            },
            // John Doe - IT Manager
            new UserRole
            {
                UserId = users[1].Id,
                RoleId = managerRole.Id,
                DepartmentId = itDepartment.Id,
                AssignedAt = DateTime.UtcNow
            },
            // Jane Smith - Support Agent in Software Team
            new UserRole
            {
                UserId = users[2].Id,
                RoleId = agentRole.Id,
                DepartmentId = itDepartment.Id,
                TeamId = softwareTeam.Id,
                AssignedAt = DateTime.UtcNow
            },
            // Mike Wilson - Help Desk Agent
            new UserRole
            {
                UserId = users[3].Id,
                RoleId = agentRole.Id,
                DepartmentId = customerServiceDepartment.Id,
                TeamId = helpDeskTeam.Id,
                AssignedAt = DateTime.UtcNow
            },
            // Sarah Johnson - Regular User
            new UserRole
            {
                UserId = users[4].Id,
                RoleId = userRole.Id,
                AssignedAt = DateTime.UtcNow
            }
        };

        await _context.UserRoles.AddRangeAsync(userRoles);
        await _context.SaveChangesAsync();
    }

    private async Task SeedFAQCategoriesAsync()
    {
        var faqCategories = new[]
        {
            new FAQCategory { Name = "Getting Started", Description = "Basic setup and getting started guides", IsActive = true },
            new FAQCategory { Name = "Account Management", Description = "Account related questions and guides", IsActive = true },
            new FAQCategory { Name = "Technical Issues", Description = "Common technical problems and solutions", IsActive = true },
            new FAQCategory { Name = "Billing", Description = "Billing and payment related questions", IsActive = true }
        };

        await _context.FAQCategories.AddRangeAsync(faqCategories);
        await _context.SaveChangesAsync();

        // Add some sample FAQ items
        var adminUser = await _context.Users.FirstAsync(u => u.Email == "admin@ticketingapp.com");
        var gettingStartedCategory = faqCategories[0];
        var technicalCategory = faqCategories[2];

        var faqItems = new[]
        {
            new FAQItem
            {
                CategoryId = gettingStartedCategory.Id,
                Question = "How do I create my first ticket?",
                Answer = "To create a ticket, log in to your account, click on 'New Ticket' button, fill in the required information including title, description, category, and priority, then submit.",
                CreatedById = adminUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new FAQItem
            {
                CategoryId = gettingStartedCategory.Id,
                Question = "How do I track my ticket status?",
                Answer = "You can track your ticket status by logging into your account and viewing the 'My Tickets' section. Each ticket shows its current status and any recent updates.",
                CreatedById = adminUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new FAQItem
            {
                CategoryId = technicalCategory.Id,
                Question = "I can't log into my account, what should I do?",
                Answer = "If you can't log in, first check that you're using the correct email and password. If you've forgotten your password, use the 'Forgot Password' link. If problems persist, contact support.",
                CreatedById = adminUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };

        await _context.FAQItems.AddRangeAsync(faqItems);
        await _context.SaveChangesAsync();
    }
}