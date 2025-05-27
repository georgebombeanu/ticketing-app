using System.Net;
using System.Text.Json;
using TicketingApp.Services.Common.Exceptions;

namespace TicketingApp.API.Middleware;

public class SimpleGlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SimpleGlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public SimpleGlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<SimpleGlobalExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = Guid.NewGuid().ToString();

        // Log with correlation ID
        _logger.LogError(exception,
            "Unhandled exception occurred. CorrelationId: {CorrelationId}, Path: {Path}, Method: {Method}",
            correlationId, context.Request.Path, context.Request.Method);

        context.Response.ContentType = "application/json";

        var response = new SimpleErrorResponse
        {
            CorrelationId = correlationId,
            Timestamp = DateTime.UtcNow
        };

        switch (exception)
        {
            case NotFoundException ex:
                response.Message = ex.Message;
                response.StatusCode = (int)HttpStatusCode.NotFound;
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case ValidationException ex:
                response.Message = ex.Message;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case AuthenticationException ex:
                response.Message = ex.Message;
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            default:
                response.Message = "An internal server error occurred";
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                if (_environment.IsDevelopment())
                {
                    response.Details = exception.ToString();
                }
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

public class SimpleErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string CorrelationId { get; set; } = string.Empty;
}