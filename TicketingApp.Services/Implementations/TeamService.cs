using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class TeamService : ITeamService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TeamService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TeamDto> GetByIdAsync(int id)
    {
        var team = await _unitOfWork.Teams.GetByIdAsync(id);
        if (team == null || !team.IsActive)
            throw new NotFoundException("Team not found");

        return _mapper.Map<TeamDto>(team);
    }

    public async Task<TeamDetailsDto> GetDetailsByIdAsync(int id)
    {
        var teamWithUsers = await _unitOfWork.Teams.GetTeamWithUsersAsync(id);
        if (teamWithUsers == null || !teamWithUsers.IsActive)
            throw new NotFoundException("Team not found");

        var teamWithTickets = await _unitOfWork.Teams.GetTeamWithTicketsAsync(id);

        // Combine the data
        teamWithUsers.Tickets = teamWithTickets.Tickets;

        return _mapper.Map<TeamDetailsDto>(teamWithUsers);
    }

    public async Task<IEnumerable<TeamDto>> GetAllActiveAsync()
    {
        var teams = await _unitOfWork.Teams.GetActiveTeamsAsync();
        return _mapper.Map<IEnumerable<TeamDto>>(teams);
    }

    public async Task<TeamDto> CreateAsync(CreateTeamDto createTeamDto)
    {
        // Validate department exists and is active
        var department = await _unitOfWork.Departments.GetByIdAsync(createTeamDto.DepartmentId);
        if (department == null || !department.IsActive)
            throw new ValidationException("Invalid department");

        if (
            !await IsTeamNameUniqueInDepartmentAsync(createTeamDto.Name, createTeamDto.DepartmentId)
        )
            throw new ValidationException("Team name already exists in this department");

        var team = _mapper.Map<Team>(createTeamDto);

        await _unitOfWork.Teams.AddAsync(team);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TeamDto>(team);
    }

    public async Task<TeamDto> UpdateAsync(int id, UpdateTeamDto updateTeamDto)
    {
        var team = await _unitOfWork.Teams.GetByIdAsync(id);
        if (team == null || !team.IsActive)
            throw new NotFoundException("Team not found");

        if (!await IsTeamNameUniqueInDepartmentAsync(updateTeamDto.Name, team.DepartmentId, id))
            throw new ValidationException("Team name already exists in this department");

        _mapper.Map(updateTeamDto, team);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TeamDto>(team);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var team = await _unitOfWork.Teams.GetByIdAsync(id);
        if (team == null)
            throw new NotFoundException("Team not found");

        team.IsActive = false;
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<IEnumerable<TeamDto>> GetTeamsByDepartmentAsync(int departmentId)
    {
        var teams = await _unitOfWork.Teams.GetTeamsByDepartmentAsync(departmentId);
        return _mapper.Map<IEnumerable<TeamDto>>(teams);
    }

    public async Task<IEnumerable<TeamDto>> GetTeamsByUserIdAsync(int userId)
    {
        var teams = await _unitOfWork.Teams.GetTeamsByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<TeamDto>>(teams);
    }

    public async Task<bool> IsTeamNameUniqueInDepartmentAsync(
        string name,
        int departmentId,
        int? excludeTeamId = null
    )
    {
        return await _unitOfWork.Teams.IsTeamNameUniqueInDepartmentAsync(
            name,
            departmentId,
            excludeTeamId
        );
    }
}
