using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ManagedAgentBroker.Infrastructure.Configuration;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class SlaMonitoringBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ProvisioningSettings _settings;
        private readonly ILogger<SlaMonitoringBackgroundService> _logger;
        private readonly SemaphoreSlim _executionLock = new(1, 1);

        public SlaMonitoringBackgroundService(
            IServiceScopeFactory scopeFactory,
            IOptions<ProvisioningSettings> settings,
            ILogger<SlaMonitoringBackgroundService> logger)
        {
            _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
            _settings = settings?.Value ?? new ProvisioningSettings();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var intervalMinutes = Math.Max(1, _settings.SlaDaemonIntervalMinutes);
            _logger.LogInformation(
                "SLA Monitoring Background Daemon initialized. Polling interval: {Interval} minutes",
                intervalMinutes);

            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(intervalMinutes));

            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                if (!await _executionLock.WaitAsync(0, stoppingToken))
                {
                    _logger.LogWarning("Previous SLA monitoring sweep is still executing. Skipping this tick.");
                    continue;
                }

                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var slaService = scope.ServiceProvider.GetRequiredService<ISlaMonitoringService>();

                    await slaService.ExecuteSlaSweepAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("SLA Monitoring Background Daemon is stopping due to cancellation.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error occurred during background SLA monitoring sweep.");
                }
                finally
                {
                    _executionLock.Release();
                }
            }

            _logger.LogInformation("SLA Monitoring Background Daemon stopped.");
        }
    }
}
