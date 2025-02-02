using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto changePasswordDto);
}
