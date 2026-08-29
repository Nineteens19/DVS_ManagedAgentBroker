using System;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Domain.Enums;

namespace ManagedAgentBroker.Domain.Events
{
    public record ApplicationStatusChangedEvent(
        Guid ApplicationId, 
        string ApplicationNumber, 
        ApplicationStatus PreviousStatus, 
        ApplicationStatus NewStatus, 
        string ChangedBy,
        DateTime OccurredOn) : IDomainEvent
    {
        public ApplicationStatusChangedEvent(
            Guid applicationId, 
            string applicationNumber, 
            ApplicationStatus previousStatus, 
            ApplicationStatus newStatus, 
            string changedBy) 
            : this(applicationId, applicationNumber, previousStatus, newStatus, changedBy, DateTime.UtcNow) { }
    }
}
