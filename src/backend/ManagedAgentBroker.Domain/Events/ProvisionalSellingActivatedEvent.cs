using System;
using ManagedAgentBroker.Domain.Common;

namespace ManagedAgentBroker.Domain.Events
{
    public record ProvisionalSellingActivatedEvent(
        Guid ApplicationId,
        string ApplicationNumber,
        string AgentCode,
        string SourceCode,
        DateTime ActivatedAt,
        DateTime Sla30DayDeadline,
        DateTime Sla90DayDeadline,
        DateTime OccurredOn) : IDomainEvent
    {
        public ProvisionalSellingActivatedEvent(
            Guid applicationId,
            string applicationNumber,
            string agentCode,
            string sourceCode,
            DateTime activatedAt,
            DateTime sla30DayDeadline,
            DateTime sla90DayDeadline)
            : this(applicationId, applicationNumber, agentCode, sourceCode, activatedAt, sla30DayDeadline, sla90DayDeadline, DateTime.UtcNow) { }
    }
}
