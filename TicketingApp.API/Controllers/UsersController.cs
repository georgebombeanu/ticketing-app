using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        try
        {
            _logger.LogInformation("API: Getting all active users");

            var users = await _userService.GetAllActiveAsync();

            _logger.LogInformation("API: Successfully retrieved {UserCount} active users", users.Count());
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving all users");
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting user {UserId}", id);

            var user = await _userService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved user {UserId} ({Email}) with {RoleCount} roles",
                user.Id, user.Email, user.UserRoles.Count);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: User not found {UserId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the user" });
        }
    }

    [HttpGet("email/{email}")]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
    {
        try
        {
            _logger.LogInformation("API: Getting user by email: {Email}", email);

            var user = await _userService.GetByEmailAsync(email);

            _logger.LogInformation("API: Successfully retrieved user {UserId} by email {Email} with {RoleCount} roles",
                user.Id, user.Email, user.UserRoles.Count);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: User not found by email {Email} - {Message}", email, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving user by email {Email}", email);
            return StatusCode(500, new { message = "An error occurred while retrieving the user" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new user with email: {Email}, roles: {RoleCount}",
                createUserDto.Email, createUserDto.UserRoles.Count);

            var user = await _userService.CreateAsync(createUserDto);

            _logger.LogInformation("API: Successfully created user {UserId} ({Email}) with {RoleCount} roles",
                user.Id, user.Email, user.UserRoles.Count);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: User creation validation error for email {Email} - {Message}",
                createUserDto.Email, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating user with email {Email}", createUserDto.Email);
            return StatusCode(500, new { message = "An error occurred while creating the user" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            _logger.LogInformation("API: Updating user {UserId} - Name: {FirstName} {LastName}, Active: {IsActive}, Roles: {RoleCount}",
                id, updateUserDto.FirstName, updateUserDto.LastName, updateUserDto.IsActive, updateUserDto.UserRoles.Count);

            var user = await _userService.UpdateAsync(id, updateUserDto);

            _logger.LogInformation("API: Successfully updated user {UserId} ({Email}) with {RoleCount} roles",
                user.Id, user.Email, user.UserRoles.Count);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: User not found for update {UserId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: User update validation error for {UserId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the user" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        try
        {
            _logger.LogInformation("API: Deactivating user {UserId}", id);

            await _userService.DeactivateAsync(id);

            _logger.LogInformation("API: Successfully deactivated user {UserId}", id);
            return Ok(new { message = "User deactivated successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: User not found for deactivation {UserId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deactivating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating the user" });
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByDepartment(int departmentId)
    {
        try
        {
            _logger.LogInformation("API: Getting users by department {DepartmentId}", departmentId);

            var users = await _userService.GetUsersByDepartmentAsync(departmentId);

            _logger.LogInformation("API: Successfully retrieved {UserCount} users for department {DepartmentId}",
                users.Count(), departmentId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving users for department {DepartmentId}", departmentId);
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByTeam(int teamId)
    {
        try
        {
            _logger.LogInformation("API: Getting users by team {TeamId}", teamId);

            var users = await _userService.GetUsersByTeamAsync(teamId);

            _logger.LogInformation("API: Successfully retrieved {UserCount} users for team {TeamId}",
                users.Count(), teamId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving users for team {TeamId}", teamId);
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }
}