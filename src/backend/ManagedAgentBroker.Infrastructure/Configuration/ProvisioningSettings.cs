namespace ManagedAgentBroker.Infrastructure.Configuration
{
    public class ProvisioningSettings
    {
        public const string SectionName = "ProvisioningSettings";

        public string DevesMasterEndpoint { get; set; } = "https://master.deves.co.th/api";
        public string As400Endpoint { get; set; } = "https://as400.internal.corp/api";
        public string AparEndpoint { get; set; } = "https://apar.internal.corp/api";
        public string SapEndpoint { get; set; } = "https://sap.internal.corp/api";
        public string PcsdisEndpoint { get; set; } = "https://pcsdis.internal.corp/api";
        public bool UseSandboxSimulators { get; set; } = true;
        public int SlaDaemonIntervalMinutes { get; set; } = 60;
    }
}
