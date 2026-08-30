using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface ISlaMonitoringService
    {
        Task<SlaDaemonExecutionReport> ExecuteSlaSweepAsync(
            CancellationToken ct = default);
    }
}
