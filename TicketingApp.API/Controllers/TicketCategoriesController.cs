using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/ticket-categories")]
public class TicketCategoriesController : ControllerBase
{
    private readonly ITicketCategoryService _ticketCategoryService;

    public TicketCategoriesController(ITicketCategoryService ticketCategoryService)
    {
        _ticketCategoryService = ticketCategoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketCategoryDto>>> GetAllCategories()
    {
        try
        {
            var categories = await _ticketCategoryService.GetAllAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving ticket categories" });
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<TicketCategoryDto>>> GetActiveCategories()
    {
        try
        {
            var categories = await _ticketCategoryService.GetActiveAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving active ticket categories" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketCategoryDto>> GetCategory(int id)
    {
        try
        {
            var category = await _ticketCategoryService.GetByIdAsync(id);
            return Ok(category);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket category" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketCategoryDto>> CreateCategory([FromBody] CreateTicketCategoryDto createCategoryDto)
    {
        try
        {
            var category = await _ticketCategoryService.CreateAsync(createCategoryDto);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the ticket category" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketCategoryDto>> UpdateCategory(int id, [FromBody] UpdateTicketCategoryDto updateCategoryDto)
    {
        try
        {
            var category = await _ticketCategoryService.UpdateAsync(id, updateCategoryDto);
            return Ok(category);
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
            return StatusCode(500, new { message = "An error occurred while updating the ticket category" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        try
        {
            await _ticketCategoryService.DeactivateAsync(id);
            return Ok(new { message = "Ticket category deactivated successfully" });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deactivating the ticket category" });
        }
    }
}