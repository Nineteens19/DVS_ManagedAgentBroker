using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IHardCopyArchiveService
    {
        Task<PhysicalContractRecordDto> ArchivePhysicalContractAsync(
            Guid applicationId,
            ArchivePhysicalContractCommand cmd,
            string auditorUserId,
            CancellationToken ct = default);
    }
}
