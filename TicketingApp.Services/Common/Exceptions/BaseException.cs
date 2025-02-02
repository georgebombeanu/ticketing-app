using System;

namespace TicketingApp.Services.Common.Exceptions;

public abstract class BaseException : Exception
{
    public string Code { get; }

    protected BaseException(string message, string code)
        : base(message)
    {
        Code = code;
    }
}
