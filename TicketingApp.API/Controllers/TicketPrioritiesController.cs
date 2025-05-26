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

    public TicketPrioritiesController(ITicketPriorityService ticketPriorityService)
    {
        _ticketPriorityService = ticketPriorityService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketPriorityDto>>> GetAllPriorities()
    {
        try
        {
            var priorities = await _ticketPriorityService.GetAllOrderedByNameAsync();
            return Ok(priorities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving ticket priorities" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketPriorityDto>> GetPriority(int id)
    {
        try
        {
            var priority = await _ticketPriorityService.GetByIdAsync(id);
            return Ok(priority);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket priority" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketPriorityDto>> CreatePriority([FromBody] CreateTicketPriorityDto createPriorityDto)
    {
        try
        {
            var priority = await _ticketPriorityService.CreateAsync(createPriorityDto);
            return CreatedAtAction(nameof(GetPriority), new { id = priority.Id }, priority);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the ticket priority" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketPriorityDto>> UpdatePriority(int id, [FromBody] UpdateTicketPriorityDto updatePriorityDto)
    {
        try
        {
            var priority = await _ticketPriorityService.UpdateAsync(id, updatePriorityDto);
            return Ok(priority);
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
            return StatusCode(500, new { message = "An error occurred while updating the ticket priority" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePriority(int id)
    {
        try
        {
            await _ticketPriorityService.DeleteAsync(id);
            return Ok(new { message = "Ticket priority deleted successfully" });
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
            return StatusCode(500, new { message = "An error occurred while deleting the ticket priority" });
        }
    }
}