# Domain Entities & DTOs — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document defines the domain models, command payloads, and DTOs for multi-system automated provisioning, Deves Master code generation, background SLA monitoring daemon, and physical contract archiving.

---

## 1. Deves Master & Provisioning Contracts

```csharp
namespace ManagedAgentBroker.Domain.DTOs
{
    public class GenerateAgentCodesCommand
    {
        public Guid ApplicationId { get; set; }
        public AgentType AgentType { get; set; }
        public string BranchCode { get; set; } = string.Empty;
        public string NationalIdOrTaxId { get; set; } = string.Empty;
        public string FullNameTh { get; set; } = string.Empty;
    }

    public class GeneratedAgentCodesDto
    {
        public string AgentCode { get; set; } = string.Empty;
        public string SourceCode { get; set; } = string.Empty;
        public string? UnitExecutiveCode { get; set; }
        public string MasterReferenceTransactionId { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
    }

    public class TriggerProvisioningCommand
    {
        public decimal ApprovedCreditLimit { get; set; }
        public decimal CommissionPercentage { get; set; }
    }

    public class CoreProvisioningResultDto
    {
        public Guid ApplicationId { get; set; }
        public string AgentCode { get; set; } = string.Empty;
        public string SourceCode { get; set; } = string.Empty;
        public string? UnitExecutiveCode { get; set; }
        public bool IsFullyProvisioned { get; set; }
        public List<CoreSyncTransactionDto> Transactions { get; set; } = new();
        public DateTime? ProvisionalSellingActivatedAt { get; set; }
        public DateTime? Sla30DayDeadline { get; set; }
        public DateTime? Sla90DayDeadline { get; set; }
    }

    public class CoreSyncTransactionDto
    {
        public Guid Id { get; set; }
        public Guid ApplicationId { get; set; }
        public TargetSystem TargetSystem { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public SyncStatus Status { get; set; }
        public int RetryCount { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
```

---

## 2. SLA Daemon Execution Models

```csharp
namespace ManagedAgentBroker.Domain.DTOs
{
    public class SlaDaemonExecutionReport
    {
        public DateTime ExecutionStartedAt { get; set; }
        public DateTime ExecutionCompletedAt { get; set; }
        public int ApplicationsScanned { get; set; }
        public int WarningsDispatched { get; set; }
        public int AutoSuspensionsTriggered { get; set; }
        public int AutoTerminationsTriggered { get; set; }
        public List<string> AffectedApplicationNumbers { get; set; } = new();
    }
}
```

---

## 3. Legal Hard-Copy Archive Contracts

```csharp
namespace ManagedAgentBroker.Domain.DTOs
{
    public class ArchivePhysicalContractCommand
    {
        public string ArchiveBoxNumber { get; set; } = string.Empty;
        public string? LegalAuditorNotes { get; set; }
    }

    public class PhysicalContractRecordDto
    {
        public Guid Id { get; set; }
        public Guid ApplicationId { get; set; }
        public PhysicalContractStatus Status { get; set; }
        public DateTime? DispatchedFromBranchAt { get; set; }
        public DateTime? ReceivedAtLegalAt { get; set; }
        public string? ArchiveBoxNumber { get; set; }
        public string? LegalAuditorNotes { get; set; }
    }
}
```
