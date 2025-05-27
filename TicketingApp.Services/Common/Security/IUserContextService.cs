using System.Security.Claims;

namespace TicketingApp.Services.Common.Security;

public interface IUserContextService
{
    int? GetCurrentUserId();
    string? GetCurrentUserEmail();
    bool IsAuthenticated { get; }
    IEnumerable<string> GetCurrentUserRoles();
    bool IsInRole(string role);
    int? GetCurrentUserDepartmentId();
    int? GetCurrentUserTeamId();
}
