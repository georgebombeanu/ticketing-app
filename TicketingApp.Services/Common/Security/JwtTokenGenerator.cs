using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TicketingApp.Models.Entities;

namespace TicketingApp.Services.Common.Security;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;
    private readonly byte[] _key;

    public int AccessTokenExpirationMinutes => 30;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
        _key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
    }

    public string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
    {
        // Use ClaimTypes.NameIdentifier instead of JwtRegisteredClaimNames.Sub
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
    };

        // Add role claims with department and team context
        foreach (var userRole in user.UserRoles)
        {
            var roleClaim = new Claim(ClaimTypes.Role, userRole.Role.Name);
            claims.Add(roleClaim);

            if (userRole.DepartmentId.HasValue)
            {
                claims.Add(new Claim("department", userRole.DepartmentId.Value.ToString()));
                claims.Add(
                    new Claim(
                        $"role_dept_{userRole.Role.Name}",
                        userRole.DepartmentId.Value.ToString()
                    )
                );
            }

            if (userRole.TeamId.HasValue)
            {
                claims.Add(new Claim("team", userRole.TeamId.Value.ToString()));
                claims.Add(
                    new Claim($"role_team_{userRole.Role.Name}", userRole.TeamId.Value.ToString())
                );
            }
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(AccessTokenExpirationMinutes),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(_key),
                SecurityAlgorithms.HmacSha256Signature
            ),
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
