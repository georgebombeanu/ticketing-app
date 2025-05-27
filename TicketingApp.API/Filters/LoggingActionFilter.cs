using Microsoft.AspNetCore.Mvc.Filters;
using System.Diagnostics;

namespace TicketingApp.API.Filters;

public class LoggingActionFilter : IActionFilter
{
    private readonly ILogger<LoggingActionFilter> _logger;
    private Stopwatch? _stopwatch;

    public LoggingActionFilter(ILogger<LoggingActionFilter> logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        _stopwatch = Stopwatch.StartNew();

        var controllerName = context.Controller.GetType().Name;
        var actionName = context.ActionDescriptor.DisplayName;
        var parameters = context.ActionArguments;

        // Don't log sensitive information like passwords
        var sanitizedParameters = SanitizeParameters(parameters);

        _logger.LogInformation("Action {ControllerName}.{ActionName} started with parameters: {@Parameters}",
            controllerName, actionName, sanitizedParameters);
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        _stopwatch?.Stop();
        var elapsedMilliseconds = _stopwatch?.ElapsedMilliseconds ?? 0;

        var controllerName = context.Controller.GetType().Name;
        var actionName = context.ActionDescriptor.DisplayName;

        if (context.Exception != null)
        {
            _logger.LogError(context.Exception,
                "Action {ControllerName}.{ActionName} failed after {ElapsedMilliseconds}ms",
                controllerName, actionName, elapsedMilliseconds);
        }
        else
        {
            var statusCode = context.HttpContext.Response.StatusCode;

            if (elapsedMilliseconds > 5000) // Log performance warnings for slow requests
            {
                _logger.LogWarning(
                    "Action {ControllerName}.{ActionName} completed with status {StatusCode} after {ElapsedMilliseconds}ms (SLOW)",
                    controllerName, actionName, statusCode, elapsedMilliseconds);
            }
            else
            {
                _logger.LogInformation(
                    "Action {ControllerName}.{ActionName} completed with status {StatusCode} after {ElapsedMilliseconds}ms",
                    controllerName, actionName, statusCode, elapsedMilliseconds);
            }
        }
    }

    private static Dictionary<string, object?> SanitizeParameters(IDictionary<string, object?> parameters)
    {
        var sanitized = new Dictionary<string, object?>();
        var sensitiveKeys = new[] { "password", "token", "secret", "key" };

        foreach (var param in parameters)
        {
            var key = param.Key.ToLower();
            if (sensitiveKeys.Any(sensitiveKey => key.Contains(sensitiveKey)))
            {
                sanitized[param.Key] = "***REDACTED***";
            }
            else
            {
                sanitized[param.Key] = param.Value;
            }
        }

        return sanitized;
    }
}