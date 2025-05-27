using Microsoft.Extensions.DependencyInjection;

namespace TicketingApp.Services.Common.Logging;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationLogging(this IServiceCollection services)
    {
        // Configure structured logging
        services.AddLogging();

        return services;
    }
}