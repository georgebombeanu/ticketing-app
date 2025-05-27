using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;
using TicketingApp.Services.Common.Security;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IUserContextService _userContext;

    public AuthController(IAuthService authService, IUserContextService userContext, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
        _userContext = userContext;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto loginRequest)
    {
        try
        {
            _logger.LogInformation("API: Login attempt for email: {Email}", loginRequest.Email);

            var response = await _authService.LoginAsync(loginRequest);

            _logger.LogInformation("API: Login successful for user {UserId} ({Email}) with {RoleCount} roles",
                response.User.Id, response.User.Email, response.User.UserRoles.Count);

            // Don't log the actual token for security
            return Ok(response);
        }
        catch (AuthenticationException ex)
        {
            _logger.LogWarning("API: Login failed for email {Email} - {Message}",
                loginRequest.Email, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Login validation error for email {Email} - {Message}",
                loginRequest.Email, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Unexpected error during login for email: {Email}",
                loginRequest.Email);
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto changePasswordRequest)
    {
        try
        {
            var userId = _userContext.GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized("User not authenticated");

            _logger.LogInformation("API: Password change attempt for user {UserId}", userId);

            var result = await _authService.ChangePasswordAsync(userId.Value, changePasswordRequest);

            _logger.LogInformation("API: Password change successful for user {UserId}", userId);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Password change failed - user not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Password change validation error: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Unexpected error during password change");
            return StatusCode(500, new { message = "An error occurred while changing password" });
        }
    }
}