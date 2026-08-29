using MediatR;

namespace ManagedAgentBroker.Domain.Common
{
    public interface IDomainEvent : INotification
    {
        DateTime OccurredOn { get; }
    }
}
