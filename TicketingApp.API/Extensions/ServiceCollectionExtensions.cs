using TicketingApp.API.Filters;

namespace TicketingApp.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiLogging(this IServiceCollection services)
    {
        // Register API-specific logging services  
        services.AddScoped<LoggingActionFilter>();

        return services;
    }

    public static IServiceCollection AddGlobalFilters(this IServiceCollection services)
    {
        services.AddControllers(options =>
        {
            // Add the logging filter globally to all controllers
            options.Filters.Add<LoggingActionFilter>();
        });

        return services;
    }
}