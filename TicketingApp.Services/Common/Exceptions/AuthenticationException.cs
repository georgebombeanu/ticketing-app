namespace TicketingApp.Services.Common.Exceptions;

public class AuthenticationException : BaseException
{
    public AuthenticationException(string message)
        : base(message, "AUTHENTICATION_ERROR") { }
}
