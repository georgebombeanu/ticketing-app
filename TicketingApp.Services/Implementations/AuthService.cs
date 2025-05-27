using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TicketingApp.DataAccess;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.Common.Logging;
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
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(LoginAsync), new { email = loginDto.Email });
            _logger.LogInformation("Login attempt for user: {Email}", loginDto.Email);

            // Validate input
            if (string.IsNullOrWhiteSpace(loginDto.Email))
            {
                _logger.LogSecurityEvent("LoginAttemptWithEmptyEmail");
                throw new ValidationException("Email is required");
            }

            if (string.IsNullOrWhiteSpace(loginDto.Password))
            {
                _logger.LogSecurityEvent("LoginAttemptWithEmptyPassword", loginDto.Email);
                throw new ValidationException("Password is required");
            }

            using (new PerformanceLogger(_logger, "UserAuthentication", new { email = loginDto.Email }))
            {
                // Get user with roles and auth data
                var user = await _unitOfWork.Users.GetUserWithRolesAndAuthDataAsync(loginDto.Email);

                if (user == null)
                {
                    _logger.LogSecurityEvent("LoginAttemptUserNotFound", loginDto.Email, new
                    {
                        timestamp = DateTime.UtcNow,
                        ipAddress = "Unknown" // This would come from HttpContext in a real scenario
                    });

                    // Use a generic message to prevent user enumeration
                    throw new AuthenticationException("Invalid credentials");
                }

                if (!user.IsActive)
                {
                    _logger.LogSecurityEvent("LoginAttemptInactiveUser", loginDto.Email, new
                    {
                        userId = user.Id,
                        timestamp = DateTime.UtcNow
                    });

                    throw new AuthenticationException("Account is disabled");
                }

                // Verify password
                if (!_passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogSecurityEvent("LoginAttemptInvalidPassword", loginDto.Email, new
                    {
                        userId = user.Id,
                        timestamp = DateTime.UtcNow,
                        lastLogin = user.LastLogin
                    });

                    throw new AuthenticationException("Invalid credentials");
                }

                // Successful authentication - update last login
                var previousLastLogin = user.LastLogin;
                user.LastLogin = DateTime.UtcNow;
                await _unitOfWork.CompleteAsync();

                // Generate JWT token
                var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
                var expiresAt = DateTime.UtcNow.AddMinutes(_jwtTokenGenerator.AccessTokenExpirationMinutes);

                var response = new LoginResponseDto
                {
                    AccessToken = accessToken,
                    ExpiresAt = expiresAt,
                    User = _mapper.Map<UserDto>(user)
                };

                // Log successful login
                _logger.LogSecurityEvent("LoginSuccessful", loginDto.Email, new
                {
                    userId = user.Id,
                    roles = user.UserRoles.Select(ur => ur.Role.Name).ToArray(),
                    departments = user.UserRoles.Where(ur => ur.Department != null)
                                               .Select(ur => ur.Department!.Name).Distinct().ToArray(),
                    teams = user.UserRoles.Where(ur => ur.Team != null)
                                         .Select(ur => ur.Team!.Name).Distinct().ToArray(),
                    previousLastLogin = previousLastLogin,
                    currentLogin = user.LastLogin,
                    tokenExpiresAt = expiresAt
                });

                _logger.LogBusinessEvent("UserLoggedIn", new
                {
                    userId = user.Id,
                    email = user.Email,
                    roleCount = user.UserRoles.Count,
                    tokenExpirationMinutes = _jwtTokenGenerator.AccessTokenExpirationMinutes
                });

                _logger.LogServiceMethodSuccess(nameof(LoginAsync), new
                {
                    userId = user.Id,
                    email = loginDto.Email,
                    roleCount = user.UserRoles.Count
                });

                return response;
            }
        }
        catch (Exception ex) when (!(ex is ValidationException or AuthenticationException))
        {
            _logger.LogServiceMethodError(ex, nameof(LoginAsync), new { email = loginDto.Email });
            _logger.LogSecurityEvent("LoginAttemptSystemError", loginDto.Email, new
            {
                error = ex.Message,
                errorType = ex.GetType().Name
            });
            throw;
        }
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto changePasswordDto)
    {
        try
        {
            _logger.LogServiceMethodEntry(nameof(ChangePasswordAsync), new { userId });
            _logger.LogInformation("Password change attempt for user: {UserId}", userId);

            // Validate input
            if (string.IsNullOrWhiteSpace(changePasswordDto.CurrentPassword))
            {
                _logger.LogValidationError("PasswordChange", userId, "Current password is required");
                throw new ValidationException("Current password is required");
            }

            if (string.IsNullOrWhiteSpace(changePasswordDto.NewPassword))
            {
                _logger.LogValidationError("PasswordChange", userId, "New password is required");
                throw new ValidationException("New password is required");
            }

            if (changePasswordDto.CurrentPassword == changePasswordDto.NewPassword)
            {
                _logger.LogValidationError("PasswordChange", userId, "New password must be different from current password");
                throw new ValidationException("New password must be different from current password");
            }

            using (new PerformanceLogger(_logger, "PasswordChange", new { userId }))
            {
                // Get user
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null || !user.IsActive)
                {
                    _logger.LogSecurityEvent("PasswordChangeAttemptUserNotFound", userId.ToString(), new
                    {
                        userId,
                        timestamp = DateTime.UtcNow
                    });
                    throw new NotFoundException("User not found");
                }

                // Verify current password
                if (!_passwordHasher.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    _logger.LogSecurityEvent("PasswordChangeAttemptInvalidCurrentPassword", userId.ToString(), new
                    {
                        userId,
                        email = user.Email,
                        timestamp = DateTime.UtcNow
                    });
                    throw new ValidationException("Current password is incorrect");
                }

                // Hash new password
                var newPasswordHash = _passwordHasher.HashPassword(changePasswordDto.NewPassword);

                // Update password
                user.PasswordHash = newPasswordHash;
                await _unitOfWork.CompleteAsync();

                // Log successful password change
                _logger.LogSecurityEvent("PasswordChangeSuccessful", userId.ToString(), new
                {
                    userId,
                    email = user.Email,
                    timestamp = DateTime.UtcNow
                });

                _logger.LogBusinessEvent("UserPasswordChanged", new
                {
                    userId,
                    email = user.Email
                });

                _logger.LogServiceMethodSuccess(nameof(ChangePasswordAsync), new { userId });

                return true;
            }
        }
        catch (Exception ex) when (!(ex is NotFoundException or ValidationException))
        {
            _logger.LogServiceMethodError(ex, nameof(ChangePasswordAsync), new { userId });
            _logger.LogSecurityEvent("PasswordChangeAttemptSystemError", userId.ToString(), new
            {
                userId,
                error = ex.Message,
                errorType = ex.GetType().Name
            });
            throw;
        }
    }
}