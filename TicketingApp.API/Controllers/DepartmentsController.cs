using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(IDepartmentService departmentService, ILogger<DepartmentsController> logger)
    {
        _departmentService = departmentService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAllDepartments()
    {
        try
        {
            _logger.LogInformation("API: Getting all active departments");

            var departments = await _departmentService.GetAllActiveAsync();

            _logger.LogInformation("API: Successfully retrieved {DepartmentCount} active departments",
                departments.Count());
            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving all departments");
            return StatusCode(500, new { message = "An error occurred while retrieving departments" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DepartmentDto>> GetDepartment(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting department {DepartmentId}", id);

            var department = await _departmentService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved department {DepartmentId} ('{Name}') with {TeamCount} teams",
                department.Id, department.Name, department.Teams?.Count ?? 0);
            return Ok(department);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Department not found {DepartmentId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving department {DepartmentId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the department" });
        }
    }

    [HttpGet("{id}/details")]
    public async Task<ActionResult<DepartmentDetailsDto>> GetDepartmentDetails(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting department details for {DepartmentId}", id);

            var department = await _departmentService.GetDetailsByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved department details {DepartmentId} ('{Name}') - Teams: {TeamCount}, Users: {UserCount}, Active Tickets: {ActiveTicketsCount}",
                department.Id, department.Name, department.Teams.Count, department.Users.Count, department.ActiveTicketsCount);
            return Ok(department);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Department not found for details {DepartmentId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving department details {DepartmentId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving department details" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment([FromBody] CreateDepartmentDto createDepartmentDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new department '{Name}'", createDepartmentDto.Name);

            var department = await _departmentService.CreateAsync(createDepartmentDto);

            _logger.LogInformation("API: Successfully created department {DepartmentId} ('{Name}')",
                department.Id, department.Name);
            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Department creation validation error for '{Name}' - {Message}",
                createDepartmentDto.Name, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating department '{Name}'", createDepartmentDto.Name);
            return StatusCode(500, new { message = "An error occurred while creating the department" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DepartmentDto>> UpdateDepartment(int id, [FromBody] UpdateDepartmentDto updateDepartmentDto)
    {
        try
        {
            _logger.LogInformation("API: Updating department {DepartmentId} - Name: '{Name}', Active: {IsActive}",
                id, updateDepartmentDto.Name, updateDepartmentDto.IsActive);

            var department = await _departmentService.UpdateAsync(id, updateDepartmentDto);

            _logger.LogInformation("API: Successfully updated department {DepartmentId} ('{Name}', Active: {IsActive})",
                department.Id, department.Name, department.IsActive);
            return Ok(department);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Department not found for update {DepartmentId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Department update validation error for {DepartmentId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating department {DepartmentId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the department" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateDepartment(int id)
    {
        try
        {
            _logger.LogInformation("API: Deactivating department {DepartmentId}", id);

            await _departmentService.DeactivateAsync(id);

            _logger.LogInformation("API: Successfully deactivated department {DepartmentId}", id);
            return Ok(new { message = "Department deactivated successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Department not found for deactivation {DepartmentId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Department deactivation validation error {DepartmentId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deactivating department {DepartmentId}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating the department" });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<DepartmentSummaryDto>>> GetDepartmentsByUser(int userId)
    {
        try
        {
            _logger.LogInformation("API: Getting departments for user {UserId}", userId);

            var departments = await _departmentService.GetDepartmentsByUserIdAsync(userId);

            _logger.LogInformation("API: Successfully retrieved {DepartmentCount} departments for user {UserId}",
                departments.Count(), userId);
            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving departments for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving user departments" });
        }
    }
}