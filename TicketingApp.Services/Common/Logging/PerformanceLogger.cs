using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace TicketingApp.Services.Common.Logging;

public class PerformanceLogger : IDisposable
{
    private readonly ILogger _logger;
    private readonly string _operationName;
    private readonly object? _context;
    private readonly Stopwatch _stopwatch;
    private readonly long _warningThresholdMs;

    public PerformanceLogger(ILogger logger, string operationName, object? context = null, long warningThresholdMs = 1000)
    {
        _logger = logger;
        _operationName = operationName;
        _context = context;
        _warningThresholdMs = warningThresholdMs;
        _stopwatch = Stopwatch.StartNew();
    }

    public void Dispose()
    {
        _stopwatch.Stop();
        var elapsedMs = _stopwatch.ElapsedMilliseconds;

        if (elapsedMs > _warningThresholdMs)
        {
            if (_context != null)
            {
                _logger.LogWarning("Performance warning: {OperationName} took {ElapsedMilliseconds}ms with context: {@Context}",
                    _operationName, elapsedMs, _context);
            }
            else
            {
                _logger.LogWarning("Performance warning: {OperationName} took {ElapsedMilliseconds}ms",
                    _operationName, elapsedMs);
            }
        }
        else
        {
            if (_context != null)
            {
                _logger.LogDebug("Performance: {OperationName} took {ElapsedMilliseconds}ms with context: {@Context}",
                    _operationName, elapsedMs, _context);
            }
            else
            {
                _logger.LogDebug("Performance: {OperationName} took {ElapsedMilliseconds}ms",
                    _operationName, elapsedMs);
            }
        }
    }
}