using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/ticket-priorities")]
public class TicketPrioritiesController : ControllerBase
{
    private readonly ITicketPriorityService _ticketPriorityService;
    private readonly ILogger<TicketPrioritiesController> _logger;

    public TicketPrioritiesController(ITicketPriorityService ticketPriorityService, ILogger<TicketPrioritiesController> logger)
    {
        _ticketPriorityService = ticketPriorityService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketPriorityDto>>> GetAllPriorities()
    {
        try
        {
            _logger.LogInformation("API: Getting all ticket priorities (ordered by name)");

            var priorities = await _ticketPriorityService.GetAllOrderedByNameAsync();

            _logger.LogInformation("API: Successfully retrieved {PriorityCount} ticket priorities",
                priorities.Count());
            return Ok(priorities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket priorities");
            return StatusCode(500, new { message = "An error occurred while retrieving ticket priorities" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketPriorityDto>> GetPriority(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting ticket priority {PriorityId}", id);

            var priority = await _ticketPriorityService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved ticket priority {PriorityId} ('{Name}')",
                priority.Id, priority.Name);
            return Ok(priority);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket priority not found {PriorityId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket priority {PriorityId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket priority" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketPriorityDto>> CreatePriority([FromBody] CreateTicketPriorityDto createPriorityDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new ticket priority '{Name}'", createPriorityDto.Name);

            var priority = await _ticketPriorityService.CreateAsync(createPriorityDto);

            _logger.LogInformation("API: Successfully created ticket priority {PriorityId} ('{Name}')",
                priority.Id, priority.Name);
            return CreatedAtAction(nameof(GetPriority), new { id = priority.Id }, priority);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket priority creation validation error for '{Name}' - {Message}",
                createPriorityDto.Name, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating ticket priority '{Name}'", createPriorityDto.Name);
            return StatusCode(500, new { message = "An error occurred while creating the ticket priority" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketPriorityDto>> UpdatePriority(int id, [FromBody] UpdateTicketPriorityDto updatePriorityDto)
    {
        try
        {
            _logger.LogInformation("API: Updating ticket priority {PriorityId} - Name: '{Name}'",
                id, updatePriorityDto.Name);

            var priority = await _ticketPriorityService.UpdateAsync(id, updatePriorityDto);

            _logger.LogInformation("API: Successfully updated ticket priority {PriorityId} ('{Name}')",
                priority.Id, priority.Name);
            return Ok(priority);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket priority not found for update {PriorityId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket priority update validation error for {PriorityId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating ticket priority {PriorityId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the ticket priority" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePriority(int id)
    {
        try
        {
            _logger.LogInformation("API: Deleting ticket priority {PriorityId}", id);

            await _ticketPriorityService.DeleteAsync(id);

            _logger.LogInformation("API: Successfully deleted ticket priority {PriorityId}", id);
            return Ok(new { message = "Ticket priority deleted successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket priority not found for deletion {PriorityId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket priority deletion validation error {PriorityId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deleting ticket priority {PriorityId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the ticket priority" });
        }
    }
}