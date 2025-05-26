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
            _logger.LogInformation("API request: Getting all tickets");
            var tickets = await _ticketService.GetAllAsync();
            _logger.LogInformation("API response: Successfully retrieved {Count} tickets", tickets.Count());
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve tickets");
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
            _logger.LogInformation("API request: Getting ticket {TicketId}", id);
            var ticket = await _ticketService.GetByIdAsync(id);
            _logger.LogInformation("API response: Successfully retrieved ticket {TicketId}", id);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API warning: Ticket not found {TicketId}: {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve ticket {TicketId}", id);
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
            _logger.LogInformation("API request: Creating ticket {@CreateTicketDto}", createTicketDto);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            var ticket = await _ticketService.CreateAsync(createTicketDto, userId);

            _logger.LogInformation("API response: Successfully created ticket {TicketId}", ticket.Id);
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API validation error: Failed to create ticket - {Message}. Data: {@CreateTicketDto}",
                ex.Message, createTicketDto);
            return BadRequest(new { message = ex.Message });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API not found error: Failed to create ticket - {Message}. Data: {@CreateTicketDto}",
                ex.Message, createTicketDto);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to create ticket. Data: {@CreateTicketDto}", createTicketDto);
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
            _logger.LogInformation("API request: Updating ticket {TicketId} with {@UpdateTicketDto}", id, updateTicketDto);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            var ticket = await _ticketService.UpdateAsync(id, updateTicketDto, userId);

            _logger.LogInformation("API response: Successfully updated ticket {TicketId}", id);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API not found error: Failed to update ticket {TicketId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API validation error: Failed to update ticket {TicketId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to update ticket {TicketId}", id);
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
            _logger.LogInformation("API request: Deleting ticket {TicketId}", id);
            await _ticketService.DeleteAsync(id);
            _logger.LogInformation("API response: Successfully deleted ticket {TicketId}", id);
            return Ok(new { message = "Ticket deleted successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API not found error: Failed to delete ticket {TicketId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to delete ticket {TicketId}", id);
            return StatusCode(500, new
            {
                message = "An error occurred while deleting the ticket",
                error = ex.Message,
                type = ex.GetType().Name
            });
        }
    }

    #endregion

    #region Analytics

    [HttpGet("analytics/active-count")]
    public async Task<ActionResult<int>> GetActiveTicketsCount()
    {
        try
        {
            _logger.LogInformation("API request: Getting active tickets count");
            var count = await _ticketService.GetActiveTicketsCountAsync();
            _logger.LogInformation("API response: Active tickets count is {Count}", count);
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve active tickets count");
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
            _logger.LogInformation("API request: Getting tickets count for status {StatusId}", statusId);
            var count = await _ticketService.GetTicketsCountByStatusAsync(statusId);
            _logger.LogInformation("API response: Tickets count for status {StatusId} is {Count}", statusId, count);
            return Ok(new { statusId, count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve tickets count for status {StatusId}", statusId);
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
            _logger.LogInformation("API request: Getting tickets count for user {UserId}", userId);
            var count = await _ticketService.GetTicketsCountByUserAsync(userId);
            _logger.LogInformation("API response: Tickets count for user {UserId} is {Count}", userId, count);
            return Ok(new { userId, count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve tickets count for user {UserId}", userId);
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
            _logger.LogInformation("API request: Getting tickets count for department {DepartmentId}", departmentId);
            var count = await _ticketService.GetTicketsCountByDepartmentAsync(departmentId);
            _logger.LogInformation("API response: Tickets count for department {DepartmentId} is {Count}",
                departmentId, count);
            return Ok(new { departmentId, count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve tickets count for department {DepartmentId}", departmentId);
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
            _logger.LogInformation("API request: Getting tickets created between {StartDate} and {EndDate}",
                startDate, endDate);

            var tickets = await _ticketService.GetTicketsCreatedBetweenDatesAsync(startDate, endDate);

            _logger.LogInformation("API response: Successfully retrieved {Count} tickets between {StartDate} and {EndDate}",
                tickets.Count(), startDate, endDate);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve tickets between {StartDate} and {EndDate}",
                startDate, endDate);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving tickets by date range",
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
            _logger.LogInformation("API request: Adding attachment to ticket {TicketId}", id);
            _logger.LogDebug("Attachment data: {@AttachmentDto}", attachmentDto);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            var attachment = await _ticketService.AddAttachmentAsync(attachmentDto, userId);

            _logger.LogInformation("API response: Successfully added attachment {AttachmentId} to ticket {TicketId}",
                attachment.Id, id);
            return CreatedAtAction(nameof(GetTicket), new { id }, attachment);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API not found error: Failed to add attachment to ticket {TicketId} - {Message}",
                id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to add attachment to ticket {TicketId}", id);
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
            _logger.LogInformation("API request: Getting attachments for ticket {TicketId}", id);

            var attachments = await _ticketService.GetTicketAttachmentsAsync(id);

            _logger.LogInformation("API response: Successfully retrieved {Count} attachments for ticket {TicketId}",
                attachments.Count(), id);
            return Ok(attachments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to retrieve attachments for ticket {TicketId}", id);
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
            _logger.LogInformation("API request: Removing attachment {AttachmentId}", attachmentId);

            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder

            await _ticketService.RemoveAttachmentAsync(attachmentId, userId);

            _logger.LogInformation("API response: Successfully removed attachment {AttachmentId}", attachmentId);
            return Ok(new { message = "Attachment removed successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API not found error: Failed to remove attachment {AttachmentId} - {Message}",
                attachmentId, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API error: Failed to remove attachment {AttachmentId}", attachmentId);
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