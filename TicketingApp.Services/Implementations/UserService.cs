using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.Common.Security;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.GetUserWithRolesAsync(id);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found");

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> GetByEmailAsync(string email)
    {
        var user = await _unitOfWork.Users.GetUserByEmailAsync(email);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found");

        return _mapper.Map<UserDto>(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllActiveAsync()
    {
        var users = await _unitOfWork.Users.GetActiveUsersAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        if (!await _unitOfWork.Users.IsEmailUniqueAsync(createUserDto.Email))
            throw new ValidationException("Email already exists");

        var user = _mapper.Map<User>(createUserDto);
        user.PasswordHash = _passwordHasher.HashPassword(createUserDto.Password);
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        foreach (var roleDto in createUserDto.UserRoles)
        {
            user.UserRoles.Add(
                new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleDto.RoleId,
                    DepartmentId = roleDto.DepartmentId,
                    TeamId = roleDto.TeamId,
                    AssignedAt = DateTime.UtcNow,
                }
            );
        }

        await _unitOfWork.CompleteAsync();
        return _mapper.Map<UserDto>(await _unitOfWork.Users.GetUserWithRolesAsync(user.Id));
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto updateUserDto)
    {
        var user = await _unitOfWork.Users.GetUserWithRolesAsync(id);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found");

        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.IsActive = updateUserDto.IsActive;

        // Remove existing roles
        user.UserRoles.Clear();

        // Add new roles
        foreach (var roleDto in updateUserDto.UserRoles)
        {
            user.UserRoles.Add(
                new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleDto.RoleId,
                    DepartmentId = roleDto.DepartmentId,
                    TeamId = roleDto.TeamId,
                    AssignedAt = DateTime.UtcNow,
                }
            );
        }

        await _unitOfWork.CompleteAsync();
        return _mapper.Map<UserDto>(await _unitOfWork.Users.GetUserWithRolesAsync(user.Id));
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found");

        user.IsActive = false;
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<IEnumerable<UserDto>> GetUsersByDepartmentAsync(int departmentId)
    {
        var users = await _unitOfWork.Users.GetUsersByDepartmentAsync(departmentId);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<IEnumerable<UserDto>> GetUsersByTeamAsync(int teamId)
    {
        var users = await _unitOfWork.Users.GetUsersByTeamAsync(teamId);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }
}
