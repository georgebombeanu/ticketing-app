using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/ticket-statuses")]
public class TicketStatusesController : ControllerBase
{
    private readonly ITicketStatusService _ticketStatusService;
    private readonly ILogger<TicketStatusesController> _logger;

    public TicketStatusesController(ITicketStatusService ticketStatusService, ILogger<TicketStatusesController> logger)
    {
        _ticketStatusService = ticketStatusService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketStatusDto>>> GetAllStatuses()
    {
        try
        {
            _logger.LogInformation("API: Getting all ticket statuses (ordered by name)");

            var statuses = await _ticketStatusService.GetAllOrderedByNameAsync();

            _logger.LogInformation("API: Successfully retrieved {StatusCount} ticket statuses",
                statuses.Count());
            return Ok(statuses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket statuses");
            return StatusCode(500, new { message = "An error occurred while retrieving ticket statuses" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketStatusDto>> GetStatus(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting ticket status {StatusId}", id);

            var status = await _ticketStatusService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved ticket status {StatusId} ('{Name}')",
                status.Id, status.Name);
            return Ok(status);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket status not found {StatusId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket status {StatusId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket status" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketStatusDto>> CreateStatus([FromBody] CreateTicketStatusDto createStatusDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new ticket status '{Name}'", createStatusDto.Name);

            var status = await _ticketStatusService.CreateAsync(createStatusDto);

            _logger.LogInformation("API: Successfully created ticket status {StatusId} ('{Name}')",
                status.Id, status.Name);
            return CreatedAtAction(nameof(GetStatus), new { id = status.Id }, status);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket status creation validation error for '{Name}' - {Message}",
                createStatusDto.Name, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating ticket status '{Name}'", createStatusDto.Name);
            return StatusCode(500, new { message = "An error occurred while creating the ticket status" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketStatusDto>> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto updateStatusDto)
    {
        try
        {
            _logger.LogInformation("API: Updating ticket status {StatusId} - Name: '{Name}'",
                id, updateStatusDto.Name);

            var status = await _ticketStatusService.UpdateAsync(id, updateStatusDto);

            _logger.LogInformation("API: Successfully updated ticket status {StatusId} ('{Name}')",
                status.Id, status.Name);
            return Ok(status);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket status not found for update {StatusId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket status update validation error for {StatusId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating ticket status {StatusId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the ticket status" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStatus(int id)
    {
        try
        {
            _logger.LogInformation("API: Deleting ticket status {StatusId}", id);

            await _ticketStatusService.DeleteAsync(id);

            _logger.LogInformation("API: Successfully deleted ticket status {StatusId}", id);
            return Ok(new { message = "Ticket status deleted successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket status not found for deletion {StatusId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket status deletion validation error {StatusId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deleting ticket status {StatusId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the ticket status" });
        }
    }

    [HttpGet("{id}/tickets-count")]
    public async Task<ActionResult<int>> GetTicketCountByStatus(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting ticket count for status {StatusId}", id);

            var count = await _ticketStatusService.GetTicketCountByStatusAsync(id);

            _logger.LogInformation("API: Successfully retrieved ticket count for status {StatusId}: {TicketCount} tickets",
                id, count);
            return Ok(new { statusId = id, ticketCount = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket count for status {StatusId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving ticket count" });
        }
    }
}