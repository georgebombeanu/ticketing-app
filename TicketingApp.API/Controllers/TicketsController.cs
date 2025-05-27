using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(ITicketService ticketService, ILogger<TicketsController> logger)
    {
        _ticketService = ticketService;
        _logger = logger;
    }

    #region Basic CRUD Operations

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetAllTickets()
    {
        try
        {
            _logger.LogInformation("API: Getting all tickets with full details");

            var tickets = await _ticketService.GetAllAsync();

            var statusBreakdown = tickets.GroupBy(t => t.StatusName)
                                        .ToDictionary(g => g.Key, g => g.Count());

            _logger.LogInformation("API: Successfully retrieved {TicketCount} tickets - Status breakdown: {@StatusBreakdown}",
                tickets.Count(), statusBreakdown);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving all tickets");
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving tickets",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetTicket(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting ticket {TicketId} with full details", id);

            var ticket = await _ticketService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved ticket {TicketId} ('{Title}') - Status: {Status}, Priority: {Priority}, Assigned to: {AssignedTo}, Comments: {CommentCount}, Attachments: {AttachmentCount}",
                ticket.Id, ticket.Title, ticket.StatusName, ticket.PriorityName,
                ticket.AssignedToName ?? "Unassigned", ticket.Comments.Count, ticket.Attachments.Count);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket not found {TicketId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket {TicketId}", id);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving the ticket",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto createTicketDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new ticket '{Title}' - Category: {CategoryId}, Priority: {PriorityId}, Department: {DepartmentId}, Team: {TeamId}, Assigned to: {AssignedToId}",
                createTicketDto.Title, createTicketDto.CategoryId, createTicketDto.PriorityId,
                createTicketDto.DepartmentId, createTicketDto.TeamId, createTicketDto.AssignedToId);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            var ticket = await _ticketService.CreateAsync(createTicketDto, userId);

            _logger.LogInformation("API: Successfully created ticket {TicketId} ('{Title}') - Status: {Status}, Priority: {Priority}, Department: {Department}, Team: {Team}, Created by user: {UserId}",
                ticket.Id, ticket.Title, ticket.StatusName, ticket.PriorityName,
                ticket.DepartmentName, ticket.TeamName ?? "None", userId);
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket creation validation error for '{Title}' - {Message}",
                createTicketDto.Title, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket creation reference error for '{Title}' - {Message}",
                createTicketDto.Title, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating ticket '{Title}' for user {UserId}",
                createTicketDto.Title, 1); // TODO: Get actual user ID
            return StatusCode(500, new
            {
                message = "An error occurred while creating the ticket",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketDto>> UpdateTicket(int id, [FromBody] UpdateTicketDto updateTicketDto)
    {
        try
        {
            _logger.LogInformation("API: Updating ticket {TicketId} - Title: '{Title}', Category: {CategoryId}, Priority: {PriorityId}, Status: {StatusId}, Assigned to: {AssignedToId}, Team: {TeamId}",
                id, updateTicketDto.Title, updateTicketDto.CategoryId, updateTicketDto.PriorityId,
                updateTicketDto.StatusId, updateTicketDto.AssignedToId, updateTicketDto.TeamId);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            var ticket = await _ticketService.UpdateAsync(id, updateTicketDto, userId);

            _logger.LogInformation("API: Successfully updated ticket {TicketId} ('{Title}') - Status: {Status}, Priority: {Priority}, Assigned to: {AssignedTo}, Updated by user: {UserId}",
                ticket.Id, ticket.Title, ticket.StatusName, ticket.PriorityName,
                ticket.AssignedToName ?? "Unassigned", userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket not found for update {TicketId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket update validation error for {TicketId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating ticket {TicketId}", id);
            return StatusCode(500, new
            {
                message = "An error occurred while updating the ticket",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        try
        {
            _logger.LogInformation("API: Deleting ticket {TicketId}", id);

            await _ticketService.DeleteAsync(id);

            _logger.LogInformation("API: Successfully deleted ticket {TicketId}", id);
            return Ok(new { message = "Ticket deleted successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket not found for deletion {TicketId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deleting ticket {TicketId}", id);
            return StatusCode(500, new
            {
                message = "An error occurred while deleting the ticket",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    #endregion

    #region Analytics and Reporting

    [HttpGet("analytics/active-count")]
    public async Task<ActionResult<int>> GetActiveTicketsCount()
    {
        try
        {
            _logger.LogInformation("API: Getting active tickets count");

            var count = await _ticketService.GetActiveTicketsCountAsync();

            _logger.LogInformation("API: Successfully retrieved active tickets count: {ActiveTicketCount}", count);
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving active tickets count");
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving ticket count",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("analytics/status/{statusId}/count")]
    public async Task<ActionResult<int>> GetTicketsCountByStatus(int statusId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets count for status {StatusId}", statusId);

            var count = await _ticketService.GetTicketsCountByStatusAsync(statusId);

            _logger.LogInformation("API: Successfully retrieved tickets count for status {StatusId}: {TicketCount} tickets",
                statusId, count);
            return Ok(new { statusId, count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets count for status {StatusId}", statusId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving tickets count by status",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("analytics/user/{userId}/count")]
    public async Task<ActionResult<int>> GetTicketsCountByUser(int userId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets count for user {UserId}", userId);

            var count = await _ticketService.GetTicketsCountByUserAsync(userId);

            _logger.LogInformation("API: Successfully retrieved tickets count for user {UserId}: {TicketCount} tickets created",
                userId, count);
            return Ok(new { userId, count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets count for user {UserId}", userId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving tickets count by user",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("analytics/department/{departmentId}/count")]
    public async Task<ActionResult<int>> GetTicketsCountByDepartment(int departmentId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets count for department {DepartmentId}", departmentId);

            var count = await _ticketService.GetTicketsCountByDepartmentAsync(departmentId);

            _logger.LogInformation("API: Successfully retrieved tickets count for department {DepartmentId}: {TicketCount} tickets",
                departmentId, count);
            return Ok(new { departmentId, count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets count for department {DepartmentId}", departmentId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving tickets count by department",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("analytics/date-range")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets created between {StartDate:yyyy-MM-dd} and {EndDate:yyyy-MM-dd}",
                startDate, endDate);

            var tickets = await _ticketService.GetTicketsCreatedBetweenDatesAsync(startDate, endDate);

            var statusBreakdown = tickets.GroupBy(t => t.StatusName)
                                        .ToDictionary(g => g.Key, g => g.Count());
            var priorityBreakdown = tickets.GroupBy(t => t.PriorityName)
                                          .ToDictionary(g => g.Key, g => g.Count());

            _logger.LogInformation("API: Successfully retrieved {TicketCount} tickets between {StartDate:yyyy-MM-dd} and {EndDate:yyyy-MM-dd} - Status breakdown: {@StatusBreakdown}, Priority breakdown: {@PriorityBreakdown}",
                tickets.Count(), startDate, endDate, statusBreakdown, priorityBreakdown);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets between {StartDate:yyyy-MM-dd} and {EndDate:yyyy-MM-dd}",
                startDate, endDate);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving tickets by date range",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByUser(int userId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets created by user {UserId}", userId);

            var tickets = await _ticketService.GetTicketsByUserAsync(userId);

            var statusBreakdown = tickets.GroupBy(t => t.StatusName)
                                        .ToDictionary(g => g.Key, g => g.Count());

            _logger.LogInformation("API: Successfully retrieved {TicketCount} tickets created by user {UserId} - Status breakdown: {@StatusBreakdown}",
                tickets.Count(), userId, statusBreakdown);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets for user {UserId}", userId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving user tickets",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("assigned/{userId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsAssignedToUser(int userId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets assigned to user {UserId}", userId);

            var tickets = await _ticketService.GetTicketsAssignedToUserAsync(userId);

            var statusBreakdown = tickets.GroupBy(t => t.StatusName)
                                        .ToDictionary(g => g.Key, g => g.Count());
            var priorityBreakdown = tickets.GroupBy(t => t.PriorityName)
                                          .ToDictionary(g => g.Key, g => g.Count());

            _logger.LogInformation("API: Successfully retrieved {TicketCount} tickets assigned to user {UserId} - Status breakdown: {@StatusBreakdown}, Priority breakdown: {@PriorityBreakdown}",
                tickets.Count(), userId, statusBreakdown, priorityBreakdown);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets assigned to user {UserId}", userId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving assigned tickets",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByDepartment(int departmentId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets for department {DepartmentId}", departmentId);

            var tickets = await _ticketService.GetTicketsByDepartmentAsync(departmentId);

            var statusBreakdown = tickets.GroupBy(t => t.StatusName)
                                        .ToDictionary(g => g.Key, g => g.Count());
            var teamBreakdown = tickets.GroupBy(t => t.TeamName ?? "No Team")
                                      .ToDictionary(g => g.Key, g => g.Count());

            _logger.LogInformation("API: Successfully retrieved {TicketCount} tickets for department {DepartmentId} - Status breakdown: {@StatusBreakdown}, Team breakdown: {@TeamBreakdown}",
                tickets.Count(), departmentId, statusBreakdown, teamBreakdown);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets for department {DepartmentId}", departmentId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving department tickets",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByTeam(int teamId)
    {
        try
        {
            _logger.LogInformation("API: Getting tickets for team {TeamId}", teamId);

            var tickets = await _ticketService.GetTicketsByTeamAsync(teamId);

            var statusBreakdown = tickets.GroupBy(t => t.StatusName)
                                        .ToDictionary(g => g.Key, g => g.Count());
            var assignmentBreakdown = tickets.GroupBy(t => t.AssignedToName ?? "Unassigned")
                                            .ToDictionary(g => g.Key, g => g.Count());

            _logger.LogInformation("API: Successfully retrieved {TicketCount} tickets for team {TeamId} - Status breakdown: {@StatusBreakdown}, Assignment breakdown: {@AssignmentBreakdown}",
                tickets.Count(), teamId, statusBreakdown, assignmentBreakdown);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving tickets for team {TeamId}", teamId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving team tickets",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    #endregion

    #region Attachments

    [HttpPost("{id}/attachments")]
    public async Task<ActionResult<TicketAttachmentDto>> AddAttachment(int id, [FromBody] CreateTicketAttachmentDto attachmentDto)
    {
        try
        {
            _logger.LogInformation("API: Adding attachment '{FileName}' to ticket {TicketId}",
                attachmentDto.FileName, id);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            var attachment = await _ticketService.AddAttachmentAsync(attachmentDto, userId);

            _logger.LogInformation("API: Successfully added attachment {AttachmentId} ('{FileName}') to ticket {TicketId} by user {UserId}",
                attachment.Id, attachment.FileName, id, userId);
            return CreatedAtAction(nameof(GetTicket), new { id }, attachment);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Failed to add attachment to ticket {TicketId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Attachment validation error for ticket {TicketId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error adding attachment '{FileName}' to ticket {TicketId}",
                attachmentDto.FileName, id);
            return StatusCode(500, new
            {
                message = "An error occurred while adding the attachment",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpGet("{id}/attachments")]
    public async Task<ActionResult<IEnumerable<TicketAttachmentDto>>> GetTicketAttachments(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting attachments for ticket {TicketId}", id);

            var attachments = await _ticketService.GetTicketAttachmentsAsync(id);

            var fileSizeInfo = attachments.Any() ?
                $"Files: {string.Join(", ", attachments.Select(a => $"'{a.FileName}'"))}" :
                "No files";

            _logger.LogInformation("API: Successfully retrieved {AttachmentCount} attachments for ticket {TicketId} - {FileSizeInfo}",
                attachments.Count(), id, fileSizeInfo);
            return Ok(attachments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving attachments for ticket {TicketId}", id);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving attachments",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    [HttpDelete("attachments/{attachmentId}")]
    public async Task<IActionResult> RemoveAttachment(int attachmentId)
    {
        try
        {
            _logger.LogInformation("API: Removing attachment {AttachmentId}", attachmentId);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            await _ticketService.RemoveAttachmentAsync(attachmentId, userId);

            _logger.LogInformation("API: Successfully removed attachment {AttachmentId} by user {UserId}",
                attachmentId, userId);
            return Ok(new { message = "Attachment removed successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Attachment not found for removal {AttachmentId} - {Message}",
                attachmentId, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Attachment removal validation error {AttachmentId} - {Message}",
                attachmentId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error removing attachment {AttachmentId}", attachmentId);
            return StatusCode(500, new
            {
                message = "An error occurred while removing the attachment",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    #endregion
}

// Request DTOs for specific endpoints
public record AssignTicketRequest(int AssignedToUserId);
public record UpdateStatusRequest(int StatusId);