using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IComplianceScreeningService
    {
        Task<ComplianceCheckResultDto> CheckComplianceAsync(
            Guid applicationId,
            string nationalIdOrTaxId,
            CancellationToken ct = default);
    }
}
