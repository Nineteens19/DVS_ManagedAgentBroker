using System;
using ManagedAgentBroker.Domain.Common;

namespace ManagedAgentBroker.Domain.Events
{
    public record AgentAutoSuspendedEvent(
        Guid ApplicationId,
        string ApplicationNumber,
        string AgentCode,
        string Reason,
        DateTime SuspendedAt,
        DateTime OccurredOn) : IDomainEvent
    {
        public AgentAutoSuspendedEvent(
            Guid applicationId,
            string applicationNumber,
            string agentCode,
            string reason,
            DateTime suspendedAt)
            : this(applicationId, applicationNumber, agentCode, reason, suspendedAt, DateTime.UtcNow) { }
    }
}
