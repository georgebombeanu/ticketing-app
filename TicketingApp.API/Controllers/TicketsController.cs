using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    #region Basic CRUD Operations

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetAllTickets()
    {
        try
        {
            var tickets = await _ticketService.GetAllAsync();
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving tickets" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetTicket(int id)
    {
        try
        {
            var ticket = await _ticketService.GetByIdAsync(id);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto createTicketDto)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var ticket = await _ticketService.CreateAsync(createTicketDto, userId);
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the ticket" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketDto>> UpdateTicket(int id, [FromBody] UpdateTicketDto updateTicketDto)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var ticket = await _ticketService.UpdateAsync(id, updateTicketDto, userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the ticket" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        try
        {
            await _ticketService.DeleteAsync(id);
            return Ok(new { message = "Ticket deleted successfully" });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the ticket" });
        }
    }

    #endregion

    #region Assignment Operations

    [HttpPost("{id}/assign")]
    public async Task<ActionResult<TicketDto>> AssignTicket(int id, [FromBody] AssignTicketRequest request)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder for assigned by user
            
            var ticket = await _ticketService.AssignTicketAsync(id, request.AssignedToUserId, userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while assigning the ticket" });
        }
    }

    [HttpPost("{id}/unassign")]
    public async Task<ActionResult<TicketDto>> UnassignTicket(int id)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var ticket = await _ticketService.UnassignTicketAsync(id, userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while unassigning the ticket" });
        }
    }

    #endregion

    #region Status Operations

    [HttpPost("{id}/status")]
    public async Task<ActionResult<TicketDto>> UpdateTicketStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var ticket = await _ticketService.UpdateStatusAsync(id, request.StatusId, userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating ticket status" });
        }
    }

    [HttpPost("{id}/close")]
    public async Task<ActionResult<TicketDto>> CloseTicket(int id)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var ticket = await _ticketService.CloseTicketAsync(id, userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while closing the ticket" });
        }
    }

    [HttpPost("{id}/reopen")]
    public async Task<ActionResult<TicketDto>> ReopenTicket(int id)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var ticket = await _ticketService.ReopenTicketAsync(id, userId);
            return Ok(ticket);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while reopening the ticket" });
        }
    }

    #endregion

    #region Filtering

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetActiveTickets()
    {
        try
        {
            var tickets = await _ticketService.GetActiveTicketsAsync();
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving active tickets" });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByUser(int userId)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsByUserAsync(userId);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user tickets" });
        }
    }

    [HttpGet("assigned/{userId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsAssignedToUser(int userId)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsAssignedToUserAsync(userId);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving assigned tickets" });
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByDepartment(int departmentId)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsByDepartmentAsync(departmentId);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving department tickets" });
        }
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByTeam(int teamId)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsByTeamAsync(teamId);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving team tickets" });
        }
    }

    #endregion

    #region Comments

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<TicketCommentDto>> AddComment(int id, [FromBody] CreateTicketCommentDto commentDto)
    {
        try
        {
            // TODO: Get user ID from JWT claims when authentication is implemented
            var userId = 1; // Placeholder
            
            var comment = await _ticketService.AddCommentAsync(id, commentDto, userId);
            return CreatedAtAction(nameof(GetTicket), new { id }, comment);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while adding the comment" });
        }
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<IEnumerable<TicketCommentDto>>> GetTicketComments(int id, [FromQuery] bool includeInternal = false)
    {
        try
        {
            var comments = await _ticketService.GetTicketCommentsAsync(id, includeInternal);
            return Ok(comments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving comments" });
        }
    }

    #endregion

    #region Analytics

    [HttpGet("analytics/active-count")]
    public async Task<ActionResult<int>> GetActiveTicketsCount()
    {
        try
        {
            var count = await _ticketService.GetActiveTicketsCountAsync();
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving ticket count" });
        }
    }

    #endregion
}

// Request DTOs for specific endpoints
public record AssignTicketRequest(int AssignedToUserId);
public record UpdateStatusRequest(int StatusId);