using System;
using ManagedAgentBroker.Domain.Common;

namespace ManagedAgentBroker.Domain.Events
{
    public record AgentAutoTerminatedEvent(
        Guid ApplicationId,
        string ApplicationNumber,
        string AgentCode,
        string Reason,
        DateTime TerminatedAt,
        DateTime OccurredOn) : IDomainEvent
    {
        public AgentAutoTerminatedEvent(
            Guid applicationId,
            string applicationNumber,
            string agentCode,
            string reason,
            DateTime terminatedAt)
            : this(applicationId, applicationNumber, agentCode, reason, terminatedAt, DateTime.UtcNow) { }
    }
}
