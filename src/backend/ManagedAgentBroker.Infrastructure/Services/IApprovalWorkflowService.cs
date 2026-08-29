using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IApprovalWorkflowService
    {
        Task<AgentApplicationDto> ForwardToExecutiveAsync(
            Guid applicationId,
            ForwardToExecutiveCommand cmd,
            string forwardedByUserId,
            CancellationToken ct = default);

        Task<AgentApplicationDto> ProcessDecisionAsync(
            Guid applicationId,
            ProcessApprovalDecisionCommand cmd,
            string approverUserId,
            CancellationToken ct = default);
    }
}
