using TicketingApp.API.Middleware;

namespace TicketingApp.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseEnhancedExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SimpleGlobalExceptionMiddleware>();
    }
}