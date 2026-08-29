using System;
using System.Threading.Tasks;
using FluentAssertions;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Infrastructure.Configuration;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class EmailNotificationServiceTests
    {
        [Fact]
        public async Task InMemoryEmailService_ShouldRecordMessages_AndAllowClearing()
        {
            var service = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var msg = new EmailNotificationMessage
            {
                RecipientEmail = "tester@domain.com",
                RecipientName = "Tester",
                Subject = "Test Subject",
                HtmlBody = "<h1>Hello</h1>",
                PlainTextBody = "Hello"
            };

            await service.SendAsync(msg);

            var sent = service.GetSentMessages();
            sent.Should().HaveCount(1);
            sent[0].RecipientEmail.Should().Be("tester@domain.com");

            service.Clear();
            service.GetSentMessages().Should().BeEmpty();
        }

        [Fact]
        public async Task SmtpEmailService_WithUnreachableHost_ShouldNotThrowException_FaultIsolation()
        {
            var settings = Options.Create(new EmailSettings
            {
                SmtpHost = "unreachable.invalid.domain",
                SmtpPort = 25,
                UseInMemoryFallback = false
            });

            var service = new SmtpEmailNotificationService(
                settings,
                NullLogger<SmtpEmailNotificationService>.Instance);

            var msg = new EmailNotificationMessage
            {
                RecipientEmail = "test@domain.com",
                RecipientName = "Test User",
                Subject = "Fault Isolation Test",
                HtmlBody = "<p>Test</p>",
                PlainTextBody = "Test"
            };

            // Act & Assert — should gracefully log error and NOT throw exception
            var act = async () => await service.SendAsync(msg);
            await act.Should().NotThrowAsync();
        }
    }
}
