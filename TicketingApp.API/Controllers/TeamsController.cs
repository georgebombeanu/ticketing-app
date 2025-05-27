using Microsoft.AspNetCore.Mvc;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;
    private readonly ILogger<TeamsController> _logger;

    public TeamsController(ITeamService teamService, ILogger<TeamsController> logger)
    {
        _teamService = teamService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetAllTeams()
    {
        try
        {
            _logger.LogInformation("API: Getting all active teams");

            var teams = await _teamService.GetAllActiveAsync();

            _logger.LogInformation("API: Successfully retrieved {TeamCount} active teams", teams.Count());
            return Ok(teams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving all teams");
            return StatusCode(500, new { message = "An error occurred while retrieving teams" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamDto>> GetTeam(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting team {TeamId}", id);

            var team = await _teamService.GetByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved team {TeamId} ('{Name}') in department '{DepartmentName}' (ID: {DepartmentId})",
                team.Id, team.Name, team.DepartmentName, team.DepartmentId);
            return Ok(team);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Team not found {TeamId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving team {TeamId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the team" });
        }
    }

    [HttpGet("{id}/details")]
    public async Task<ActionResult<TeamDetailsDto>> GetTeamDetails(int id)
    {
        try
        {
            _logger.LogInformation("API: Getting team details for {TeamId}", id);

            var team = await _teamService.GetDetailsByIdAsync(id);

            _logger.LogInformation("API: Successfully retrieved team details {TeamId} ('{Name}') in department '{DepartmentName}' - Users: {UserCount}, Active Tickets: {ActiveTicketsCount}",
                team.Id, team.Name, team.DepartmentName, team.Users.Count, team.ActiveTicketsCount);
            return Ok(team);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Team not found for details {TeamId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving team details {TeamId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving team details" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> CreateTeam([FromBody] CreateTeamDto createTeamDto)
    {
        try
        {
            _logger.LogInformation("API: Creating new team '{Name}' in department {DepartmentId}",
                createTeamDto.Name, createTeamDto.DepartmentId);

            var team = await _teamService.CreateAsync(createTeamDto);

            _logger.LogInformation("API: Successfully created team {TeamId} ('{Name}') in department '{DepartmentName}' (ID: {DepartmentId})",
                team.Id, team.Name, team.DepartmentName, team.DepartmentId);
            return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Team creation validation error for '{Name}' in department {DepartmentId} - {Message}",
                createTeamDto.Name, createTeamDto.DepartmentId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error creating team '{Name}' in department {DepartmentId}",
                createTeamDto.Name, createTeamDto.DepartmentId);
            return StatusCode(500, new { message = "An error occurred while creating the team" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TeamDto>> UpdateTeam(int id, [FromBody] UpdateTeamDto updateTeamDto)
    {
        try
        {
            _logger.LogInformation("API: Updating team {TeamId} - Name: '{Name}', Active: {IsActive}",
                id, updateTeamDto.Name, updateTeamDto.IsActive);

            var team = await _teamService.UpdateAsync(id, updateTeamDto);

            _logger.LogInformation("API: Successfully updated team {TeamId} ('{Name}') in department '{DepartmentName}' - Active: {IsActive}",
                team.Id, team.Name, team.DepartmentName, team.IsActive);
            return Ok(team);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Team not found for update {TeamId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Team update validation error for {TeamId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error updating team {TeamId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the team" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateTeam(int id)
    {
        try
        {
            _logger.LogInformation("API: Deactivating team {TeamId}", id);

            await _teamService.DeactivateAsync(id);

            _logger.LogInformation("API: Successfully deactivated team {TeamId}", id);
            return Ok(new { message = "Team deactivated successfully" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("API: Team not found for deactivation {TeamId} - {Message}", id, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("API: Team deactivation validation error {TeamId} - {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error deactivating team {TeamId}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating the team" });
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeamsByDepartment(int departmentId)
    {
        try
        {
            _logger.LogInformation("API: Getting teams for department {DepartmentId}", departmentId);

            var teams = await _teamService.GetTeamsByDepartmentAsync(departmentId);

            _logger.LogInformation("API: Successfully retrieved {TeamCount} teams for department {DepartmentId}",
                teams.Count(), departmentId);
            return Ok(teams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving teams for department {DepartmentId}", departmentId);
            return StatusCode(500, new { message = "An error occurred while retrieving department teams" });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeamsByUser(int userId)
    {
        try
        {
            _logger.LogInformation("API: Getting teams for user {UserId}", userId);

            var teams = await _teamService.GetTeamsByUserIdAsync(userId);

            _logger.LogInformation("API: Successfully retrieved {TeamCount} teams for user {UserId}",
                teams.Count(), userId);
            return Ok(teams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API: Error retrieving teams for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving user teams" });
        }
    }
}