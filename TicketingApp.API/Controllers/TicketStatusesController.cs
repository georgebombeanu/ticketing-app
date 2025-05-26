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

    public TicketStatusesController(ITicketStatusService ticketStatusService)
    {
        _ticketStatusService = ticketStatusService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketStatusDto>>> GetAllStatuses()
    {
        try
        {
            var statuses = await _ticketStatusService.GetAllOrderedByNameAsync();
            return Ok(statuses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving ticket statuses" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketStatusDto>> GetStatus(int id)
    {
        try
        {
            var status = await _ticketStatusService.GetByIdAsync(id);
            return Ok(status);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket status" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketStatusDto>> CreateStatus([FromBody] CreateTicketStatusDto createStatusDto)
    {
        try
        {
            var status = await _ticketStatusService.CreateAsync(createStatusDto);
            return CreatedAtAction(nameof(GetStatus), new { id = status.Id }, status);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the ticket status" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketStatusDto>> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto updateStatusDto)
    {
        try
        {
            var status = await _ticketStatusService.UpdateAsync(id, updateStatusDto);
            return Ok(status);
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
            return StatusCode(500, new { message = "An error occurred while updating the ticket status" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStatus(int id)
    {
        try
        {
            await _ticketStatusService.DeleteAsync(id);
            return Ok(new { message = "Ticket status deleted successfully" });
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
            return StatusCode(500, new { message = "An error occurred while deleting the ticket status" });
        }
    }

    [HttpGet("{id}/tickets-count")]
    public async Task<ActionResult<int>> GetTicketCountByStatus(int id)
    {
        try
        {
            var count = await _ticketStatusService.GetTicketCountByStatusAsync(id);
            return Ok(new { statusId = id, ticketCount = count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving ticket count" });
        }
    }
}