namespace ManagedAgentBroker.Infrastructure.Configuration
{
    public class EmailSettings
    {
        public const string SectionName = "EmailSettings";

        public string SmtpHost { get; set; } = "localhost";
        public int SmtpPort { get; set; } = 25;
        public string SenderEmail { get; set; } = "noreply@insurance-broker.com";
        public string SenderName { get; set; } = "Agent & Broker Management System";
        public string? Username { get; set; }
        public string? Password { get; set; }
        public bool EnableSsl { get; set; } = false;
        public bool UseInMemoryFallback { get; set; } = true;
    }
}
