using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class InMemoryEmailNotificationService : IEmailNotificationService
    {
        private readonly ConcurrentBag<EmailNotificationMessage> _sentMessages = new();
        private readonly ILogger<InMemoryEmailNotificationService> _logger;

        public InMemoryEmailNotificationService(ILogger<InMemoryEmailNotificationService> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(EmailNotificationMessage message, CancellationToken ct = default)
        {
            _sentMessages.Add(message);
            _logger.LogInformation(
                "[IN-MEMORY EMAIL] To: {To} | Subject: {Subject} | Body: {BodySummary}",
                message.RecipientEmail,
                message.Subject,
                message.PlainTextBody.Length > 100 ? message.PlainTextBody[..100] + "..." : message.PlainTextBody);

            return Task.CompletedTask;
        }

        public IReadOnlyList<EmailNotificationMessage> GetSentMessages()
        {
            return _sentMessages.ToList().AsReadOnly();
        }

        public void Clear()
        {
            _sentMessages.Clear();
        }
    }
}
