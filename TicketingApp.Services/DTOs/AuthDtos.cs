namespace TicketingApp.Services.DTOs;

public record LoginRequestDto(string Email, string Password);

public record LoginResponseDto(string AccessToken, DateTime ExpiresAt, UserDto User);

public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);
