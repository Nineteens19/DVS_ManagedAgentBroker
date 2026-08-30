# Logical Components — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document defines the service contracts, interfaces, and DI registrations for Unit 5.

---

## 1. Service Interfaces & Contracts

### `IDevesMasterApiClient.cs`
```csharp
namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IDevesMasterApiClient
    {
        Task<GeneratedAgentCodesDto> GenerateCodesAsync(
            GenerateAgentCodesCommand cmd,
            CancellationToken ct = default);
    }
}
```

### `ICoreProvisioningService.cs`
```csharp
namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface ICoreProvisioningService
    {
        Task<CoreProvisioningResultDto> TriggerProvisioningAsync(
            Guid applicationId,
            TriggerProvisioningCommand cmd,
            string requestedByUserId,
            CancellationToken ct = default);
    }
}
```

### `ISlaMonitoringService.cs`
```csharp
namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface ISlaMonitoringService
    {
        Task<SlaDaemonExecutionReport> ExecuteSlaSweepAsync(
            CancellationToken ct = default);
    }
}
```

### `IHardCopyArchiveService.cs`
```csharp
namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IHardCopyArchiveService
    {
        Task<PhysicalContractRecordDto> ArchivePhysicalContractAsync(
            Guid applicationId,
            ArchivePhysicalContractCommand cmd,
            string auditorUserId,
            CancellationToken ct = default);
    }
}
```

---

## 2. Configuration Settings Model

```csharp
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
```

---

## 3. Dependency Injection Registration Blueprint

```csharp
// Unit 5 Automated Provisioning & Background SLA Daemon
services.Configure<Configuration.ProvisioningSettings>(options =>
    configuration.GetSection(Configuration.ProvisioningSettings.SectionName).Bind(options));

services.AddScoped<IDevesMasterApiClient, DevesMasterApiClient>();
services.AddScoped<ICoreProvisioningService, CoreProvisioningService>();
services.AddScoped<ISlaMonitoringService, SlaMonitoringService>();
services.AddScoped<IHardCopyArchiveService, HardCopyArchiveService>();
services.AddHostedService<SlaMonitoringBackgroundService>();
```
