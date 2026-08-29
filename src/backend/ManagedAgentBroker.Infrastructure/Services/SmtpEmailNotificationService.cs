using System;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class SmtpEmailNotificationService : IEmailNotificationService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailNotificationService> _logger;

        public SmtpEmailNotificationService(
            IOptions<EmailSettings> settings,
            ILogger<SmtpEmailNotificationService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendAsync(EmailNotificationMessage message, CancellationToken ct = default)
        {
            try
            {
                using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
                {
                    EnableSsl = _settings.EnableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = string.IsNullOrEmpty(_settings.Username)
                };

                if (!string.IsNullOrEmpty(_settings.Username) && !string.IsNullOrEmpty(_settings.Password))
                {
                    client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
                }

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                    Subject = message.Subject,
                    IsBodyHtml = true,
                    Body = message.HtmlBody
                };

                mailMessage.To.Add(new MailAddress(message.RecipientEmail, message.RecipientName));

                if (!string.IsNullOrEmpty(message.PlainTextBody))
                {
                    var plainView = AlternateView.CreateAlternateViewFromString(message.PlainTextBody, null, "text/plain");
                    mailMessage.AlternateViews.Add(plainView);
                }

                await client.SendMailAsync(mailMessage, ct);

                _logger.LogInformation(
                    "Email successfully dispatched to {Recipient} with subject '{Subject}' via SMTP {Host}:{Port}",
                    message.RecipientEmail, message.Subject, _settings.SmtpHost, _settings.SmtpPort);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient} with subject '{Subject}' via SMTP",
                    message.RecipientEmail, message.Subject);
                // Fault isolation: do not rethrow to protect core transaction
            }
        }
    }
}
