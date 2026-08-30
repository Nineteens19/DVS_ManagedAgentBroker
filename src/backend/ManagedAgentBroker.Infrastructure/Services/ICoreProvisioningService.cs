using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface ICoreProvisioningService
    {
        Task<CoreProvisioningResultDto> TriggerProvisioningAsync(
            Guid applicationId,
            TriggerProvisioningCommand cmd,
            string requestedByUserId,
            CancellationToken ct = default);
    }
}
