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
    private readonly ILogger<TicketCategoriesController> _logger;

    public TicketCategoriesController(ITicketCategoryService ticketCategoryService, ILogger<TicketCategoriesController> logger)
    {
        _ticketCategoryService = ticketCategoryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketCategoryDto>>> GetAllCategories()
    {
        try
        {
            _logger.LogInformation("API: Getting all ticket categories");

            var categories = await _ticketCategoryService.GetAllAsync();

            var activeCount = categories.Count(c => c.IsActive);
            _logger.LogInformation("API: Successfully retrieved {CategoryCount} ticket categories ({ActiveCount} active, {InactiveCount} inactive)",
                categories.Count(), activeCount, categories.Count() - activeCount);
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving all ticket categories");
            return StatusCode(500, new { message = "An error occurred while retrieving ticket categories" });
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<TicketCategoryDto>>> GetActiveCategories()
    {
        try
        {
            _logger.LogInformation("API: Getting active ticket categories");

            var categories = await _ticketCategoryService.GetActiveAsync();

            _logger.LogInformation("API: Successfully retrieved {ActiveCategoryCount} active ticket categories",
                categories.Count());
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving active ticket categories");
            return StatusCode(500, new { message = "An error occurred while retrieving active ticket categories" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketCategoryDto>> GetCategory(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting ticket category {CategoryId}", id);

            var category = await _ticketCategoryService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved ticket category {CategoryId} ('{Name}', Active: {IsActive})",
                category.Id, category.Name, category.IsActive);
            return Ok(category);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket category not found {CategoryId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving ticket category {CategoryId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the ticket category" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketCategoryDto>> CreateCategory([FromBody] CreateTicketCategoryDto createCategoryDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new ticket category '{Name}'", createCategoryDto.Name);

            var category = await _ticketCategoryService.CreateAsync(createCategoryDto);

            _logger.LogInformation("API: Successfully created ticket category {CategoryId} ('{Name}')",
                category.Id, category.Name);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket category creation validation error for '{Name}' - {Message}",
                createCategoryDto.Name, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating ticket category '{Name}'", createCategoryDto.Name);
            return StatusCode(500, new { message = "An error occurred while creating the ticket category" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketCategoryDto>> UpdateCategory(int id, [FromBody] UpdateTicketCategoryDto updateCategoryDto)
    {
        try
        {
            _logger.LogInformation("API: Updating ticket category {CategoryId} - Name: '{Name}', Active: {IsActive}",
                id, updateCategoryDto.Name, updateCategoryDto.IsActive);

            var category = await _ticketCategoryService.UpdateAsync(id, updateCategoryDto);

            _logger.LogInformation("API: Successfully updated ticket category {CategoryId} ('{Name}', Active: {IsActive})",
                category.Id, category.Name, category.IsActive);
            return Ok(category);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket category not found for update {CategoryId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket category update validation error for {CategoryId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating ticket category {CategoryId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the ticket category" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        try
        {
            _logger.LogInformation("API: Deactivating ticket category {CategoryId}", id);

            await _ticketCategoryService.DeactivateAsync(id);

            _logger.LogInformation("API: Successfully deactivated ticket category {CategoryId}", id);
            return Ok(new { message = "Ticket category deactivated successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Ticket category not found for deactivation {CategoryId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Ticket category deactivation validation error {CategoryId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deactivating ticket category {CategoryId}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating the ticket category" });
        }
    }
}