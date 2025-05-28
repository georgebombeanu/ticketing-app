using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.Common.Security;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FAQController : ControllerBase
{
    private readonly IFAQService _faqService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<FAQController> _logger;

    public FAQController(IFAQService faqService, IUserContextService userContext, ILogger<FAQController> logger)
    {
        _faqService = faqService;
        _userContext = userContext;
        _logger = logger;
    }

    #region Categories

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<FAQCategoryDto>>> GetAllCategories()
    {
        try
        {
            _logger.LogInformation("API: Getting all FAQ categories");
            var categories = await _faqService.GetAllCategoriesAsync();
            _logger.LogInformation("API: Successfully retrieved {CategoryCount} FAQ categories", categories.Count());
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving FAQ categories");
            return StatusCode(500, new { message = "An error occurred while retrieving FAQ categories" });
        }
    }

    [HttpGet("categories/{categoryId}")]
    public async Task<ActionResult<FAQCategoryDto>> GetCategoryWithItems(int categoryId)
    {
        try
        {
            _logger.LogInformation("API: Getting FAQ category {CategoryId} with items", categoryId);
            var category = await _faqService.GetCategoryWithItemsAsync(categoryId);
            _logger.LogInformation("API: Successfully retrieved FAQ category {CategoryId} with {ItemCount} items",
                categoryId, category.FAQItems.Count);
            return Ok(category);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: FAQ category not found {CategoryId} - {Message}", categoryId, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving FAQ category {CategoryId}", categoryId);
            return StatusCode(500, new { message = "An error occurred while retrieving the FAQ category" });
        }
    }

    [HttpPost("categories")]
    public async Task<ActionResult<FAQCategoryDto>> CreateCategory([FromBody] CreateFAQCategoryDto createCategoryDto)
    {
        try
        {
            _logger.LogInformation("API: Creating FAQ category '{Name}'", createCategoryDto.Name);
            var category = await _faqService.CreateCategoryAsync(createCategoryDto);
            _logger.LogInformation("API: Successfully created FAQ category {CategoryId} ('{Name}')",
                category.Id, category.Name);
            return CreatedAtAction(nameof(GetCategoryWithItems), new { categoryId = category.Id }, category);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: FAQ category creation validation error for '{Name}' - {Message}",
                createCategoryDto.Name, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating FAQ category '{Name}'", createCategoryDto.Name);
            return StatusCode(500, new { message = "An error occurred while creating the FAQ category" });
        }
    }

    #endregion

    #region FAQ Items

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FAQItemDto>>> GetActiveFAQs()
    {
        try
        {
            _logger.LogInformation("API: Getting all active FAQs");
            var faqs = await _faqService.GetActiveFAQsAsync();
            _logger.LogInformation("API: Successfully retrieved {FAQCount} active FAQs", faqs.Count());
            return Ok(faqs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving active FAQs");
            return StatusCode(500, new { message = "An error occurred while retrieving FAQs" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FAQItemDto>> GetFAQ(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting FAQ {FAQId}", id);
            var faq = await _faqService.GetFAQByIdAsync(id);
            _logger.LogInformation("API: Successfully retrieved FAQ {FAQId}", id);
            return Ok(faq);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: FAQ not found {FAQId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving FAQ {FAQId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the FAQ" });
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<FAQItemDto>>> SearchFAQs([FromQuery] string searchTerm)
    {
        try
        {
            _logger.LogInformation("API: Searching FAQs with term: '{SearchTerm}'", searchTerm);
            var faqs = await _faqService.SearchFAQsAsync(searchTerm);
            _logger.LogInformation("API: Successfully found {FAQCount} FAQs for search term: '{SearchTerm}'",
                faqs.Count(), searchTerm);
            return Ok(faqs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error searching FAQs with term: '{SearchTerm}'", searchTerm);
            return StatusCode(500, new { message = "An error occurred while searching FAQs" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<FAQItemDto>> CreateFAQ([FromBody] CreateFAQItemDto createFAQDto)
    {
        try
        {
            var userId = _userContext.GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized("User not authenticated");

            _logger.LogInformation("API: Creating FAQ in category {CategoryId} by user {UserId}",
                createFAQDto.CategoryId, userId);

            var faq = await _faqService.CreateFAQAsync(createFAQDto, userId.Value);

            _logger.LogInformation("API: Successfully created FAQ {FAQId} by user {UserId}",
                faq.Id, userId);
            return CreatedAtAction(nameof(GetFAQ), new { id = faq.Id }, faq);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: FAQ creation validation error - {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating FAQ");
            return StatusCode(500, new { message = "An error occurred while creating the FAQ" });
        }
    }

    #endregion
}