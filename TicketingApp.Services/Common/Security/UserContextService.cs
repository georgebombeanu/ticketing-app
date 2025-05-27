using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace TicketingApp.Services.Common.Security;

public class UserContextService : IUserContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim?.Value, out var userId) ? userId : null;
    }

    public string? GetCurrentUserEmail()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public IEnumerable<string> GetCurrentUserRoles()
    {
        return _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role)
            ?.Select(c => c.Value) ?? Enumerable.Empty<string>();
    }

    public bool IsInRole(string role)
    {
        return _httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;
    }

    public int? GetCurrentUserDepartmentId()
    {
        var departmentClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("department");
        return int.TryParse(departmentClaim?.Value, out var deptId) ? deptId : null;
    }

    public int? GetCurrentUserTeamId()
    {
        var teamClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("team");
        return int.TryParse(teamClaim?.Value, out var teamId) ? teamId : null;
    }
}