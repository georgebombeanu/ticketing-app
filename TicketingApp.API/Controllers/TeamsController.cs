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

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetAllTeams()
    {
        try
        {
            var teams = await _teamService.GetAllActiveAsync();
            return Ok(teams);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving teams" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamDto>> GetTeam(int id)
    {
        try
        {
            var team = await _teamService.GetByIdAsync(id);
            return Ok(team);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the team" });
        }
    }

    [HttpGet("{id}/details")]
    public async Task<ActionResult<TeamDetailsDto>> GetTeamDetails(int id)
    {
        try
        {
            var team = await _teamService.GetDetailsByIdAsync(id);
            return Ok(team);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving team details" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> CreateTeam([FromBody] CreateTeamDto createTeamDto)
    {
        try
        {
            var team = await _teamService.CreateAsync(createTeamDto);
            return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the team" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TeamDto>> UpdateTeam(int id, [FromBody] UpdateTeamDto updateTeamDto)
    {
        try
        {
            var team = await _teamService.UpdateAsync(id, updateTeamDto);
            return Ok(team);
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
            return StatusCode(500, new { message = "An error occurred while updating the team" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateTeam(int id)
    {
        try
        {
            await _teamService.DeactivateAsync(id);
            return Ok(new { message = "Team deactivated successfully" });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deactivating the team" });
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeamsByDepartment(int departmentId)
    {
        try
        {
            var teams = await _teamService.GetTeamsByDepartmentAsync(departmentId);
            return Ok(teams);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving department teams" });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeamsByUser(int userId)
    {
        try
        {
            var teams = await _teamService.GetTeamsByUserIdAsync(userId);
            return Ok(teams);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user teams" });
        }
    }
}