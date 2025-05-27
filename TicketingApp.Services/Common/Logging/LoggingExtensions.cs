using Microsoft.Extensions.Logging;

namespace TicketingApp.Services.Common.Logging;

public static class LoggingExtensions
{
    // Service layer logging patterns
    public static void LogServiceMethodEntry<T>(this ILogger<T> logger, string methodName, object? parameters = null)
    {
        if (parameters != null)
        {
            logger.LogInformation("Service method {MethodName} started with parameters: {@Parameters}",
                methodName, parameters);
        }
        else
        {
            logger.LogInformation("Service method {MethodName} started", methodName);
        }
    }

    public static void LogServiceMethodSuccess<T>(this ILogger<T> logger, string methodName, object? result = null)
    {
        if (result != null)
        {
            logger.LogInformation("Service method {MethodName} completed successfully with result: {@Result}",
                methodName, result);
        }
        else
        {
            logger.LogInformation("Service method {MethodName} completed successfully", methodName);
        }
    }

    public static void LogServiceMethodError<T>(this ILogger<T> logger, Exception ex, string methodName, object? parameters = null)
    {
        if (parameters != null)
        {
            logger.LogError(ex, "Service method {MethodName} failed with parameters: {@Parameters}",
                methodName, parameters);
        }
        else
        {
            logger.LogError(ex, "Service method {MethodName} failed", methodName);
        }
    }

    // Repository layer logging patterns
    public static void LogRepositoryMethodEntry<T>(this ILogger<T> logger, string methodName, object? parameters = null)
    {
        if (parameters != null)
        {
            logger.LogDebug("Repository method {MethodName} started with parameters: {@Parameters}",
                methodName, parameters);
        }
        else
        {
            logger.LogDebug("Repository method {MethodName} started", methodName);
        }
    }

    public static void LogRepositoryMethodSuccess<T>(this ILogger<T> logger, string methodName, int? recordCount = null)
    {
        if (recordCount.HasValue)
        {
            logger.LogDebug("Repository method {MethodName} completed successfully, returned {RecordCount} records",
                methodName, recordCount.Value);
        }
        else
        {
            logger.LogDebug("Repository method {MethodName} completed successfully", methodName);
        }
    }

    public static void LogRepositoryMethodError<T>(this ILogger<T> logger, Exception ex, string methodName, object? parameters = null)
    {
        if (parameters != null)
        {
            logger.LogError(ex, "Repository method {MethodName} failed with parameters: {@Parameters}",
                methodName, parameters);
        }
        else
        {
            logger.LogError(ex, "Repository method {MethodName} failed", methodName);
        }
    }

    // Controller layer logging patterns
    public static void LogControllerMethodEntry<T>(this ILogger<T> logger, string methodName, object? parameters = null)
    {
        if (parameters != null)
        {
            logger.LogInformation("Controller method {MethodName} called with parameters: {@Parameters}",
                methodName, parameters);
        }
        else
        {
            logger.LogInformation("Controller method {MethodName} called", methodName);
        }
    }

    public static void LogControllerMethodSuccess<T>(this ILogger<T> logger, string methodName, object? result = null)
    {
        if (result != null)
        {
            logger.LogInformation("Controller method {MethodName} completed successfully with result type: {ResultType}",
                methodName, result.GetType().Name);
        }
        else
        {
            logger.LogInformation("Controller method {MethodName} completed successfully", methodName);
        }
    }

    public static void LogControllerMethodError<T>(this ILogger<T> logger, Exception ex, string methodName, object? parameters = null)
    {
        if (parameters != null)
        {
            logger.LogError(ex, "Controller method {MethodName} failed with parameters: {@Parameters}",
                methodName, parameters);
        }
        else
        {
            logger.LogError(ex, "Controller method {MethodName} failed", methodName);
        }
    }

    // Validation logging
    public static void LogValidationError<T>(this ILogger<T> logger, string entityType, object entityId, string validationMessage)
    {
        logger.LogWarning("Validation failed for {EntityType} with ID {EntityId}: {ValidationMessage}",
            entityType, entityId, validationMessage);
    }

    public static void LogValidationError<T>(this ILogger<T> logger, string entityType, string validationMessage)
    {
        logger.LogWarning("Validation failed for {EntityType}: {ValidationMessage}",
            entityType, validationMessage);
    }

    // Business logic logging
    public static void LogBusinessEvent<T>(this ILogger<T> logger, string eventName, object? eventData = null)
    {
        if (eventData != null)
        {
            logger.LogInformation("Business event {EventName} occurred with data: {@EventData}",
                eventName, eventData);
        }
        else
        {
            logger.LogInformation("Business event {EventName} occurred", eventName);
        }
    }

    // Performance logging
    public static void LogPerformanceWarning<T>(this ILogger<T> logger, string operationName, long elapsedMilliseconds, object? context = null)
    {
        if (context != null)
        {
            logger.LogWarning("Performance warning: {OperationName} took {ElapsedMilliseconds}ms with context: {@Context}",
                operationName, elapsedMilliseconds, context);
        }
        else
        {
            logger.LogWarning("Performance warning: {OperationName} took {ElapsedMilliseconds}ms",
                operationName, elapsedMilliseconds);
        }
    }

    // Database operation logging
    public static void LogDatabaseOperation<T>(this ILogger<T> logger, string operation, string entityType, object? entityId = null)
    {
        if (entityId != null)
        {
            logger.LogDebug("Database operation {Operation} on {EntityType} with ID {EntityId}",
                operation, entityType, entityId);
        }
        else
        {
            logger.LogDebug("Database operation {Operation} on {EntityType}", operation, entityType);
        }
    }

    // Security logging
    public static void LogSecurityEvent<T>(this ILogger<T> logger, string eventType, string? userId = null, object? additionalData = null)
    {
        if (additionalData != null)
        {
            logger.LogWarning("Security event {EventType} for user {UserId} with data: {@AdditionalData}",
                eventType, userId ?? "Unknown", additionalData);
        }
        else
        {
            logger.LogWarning("Security event {EventType} for user {UserId}",
                eventType, userId ?? "Unknown");
        }
    }
}