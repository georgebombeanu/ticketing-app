using System;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.Common.Security;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator
    )
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto)
    {
        var user = await _unitOfWork.Users.GetUserWithRolesAndAuthDataAsync(loginDto.Email);
        if (user == null)
            throw new AuthenticationException("Invalid credentials");

        if (!_passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
            throw new AuthenticationException("Invalid credentials");

        user.LastLogin = DateTime.UtcNow;
        await _unitOfWork.CompleteAsync();

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtTokenGenerator.AccessTokenExpirationMinutes);

        return new LoginResponseDto(accessToken, expiresAt, _mapper.Map<UserDto>(user));
    }

    public async Task<bool> ChangePasswordAsync(
        int userId,
        ChangePasswordRequestDto changePasswordDto
    )
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found");

        if (!_passwordHasher.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            throw new ValidationException("Current password is incorrect");

        user.PasswordHash = _passwordHasher.HashPassword(changePasswordDto.NewPassword);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}
