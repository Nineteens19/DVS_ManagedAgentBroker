using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IEmailNotificationService
    {
        Task SendAsync(EmailNotificationMessage message, CancellationToken ct = default);
    }
}
