using System;
using TicketingApp.Models.Entities;

namespace TicketingApp.Services.Common.Security;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int AccessTokenExpirationMinutes { get; }
}
