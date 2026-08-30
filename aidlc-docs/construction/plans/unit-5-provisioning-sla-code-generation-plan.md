# Code Generation Plan — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

## Purpose
This plan details the step-by-step implementation tasks for **Unit 5: Automated Provisioning & Background SLA Suspension Daemon**, including Deves Master integration, 100% automated multi-system core provisioning, SLA background monitoring daemon (30-day auto-suspension & 90-day auto-termination), legal contract archiving, and test suites with Property-Based Testing (**PBT-06**).

---

## Proposed Changes & Generation Steps

### Step 1: Domain DTOs
- Create `src/backend/ManagedAgentBroker.Domain/DTOs/ProvisioningDtos.cs`
  - `GenerateAgentCodesCommand`, `GeneratedAgentCodesDto`
  - `TriggerProvisioningCommand`, `CoreProvisioningResultDto`, `CoreSyncTransactionDto`
  - `SlaDaemonExecutionReport`
  - `ArchivePhysicalContractCommand`, `PhysicalContractRecordDto`

### Step 2: Configuration Model
- Create `src/backend/ManagedAgentBroker.Infrastructure/Configuration/ProvisioningSettings.cs`
  - Endpoints for Deves Master, AS400, APAR, SAP, PCSDIS
  - `UseSandboxSimulators` boolean
  - `SlaDaemonIntervalMinutes` integer

### Step 3: Deves Master API Client
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/IDevesMasterApiClient.cs`
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/DevesMasterApiClient.cs`
  - Sandbox mode returning standard formatted codes (`AG202600001` / `BR202600001`, `SRC-B{BranchCode}-0001`)
  - Integration with Polly resilience for transient failures

### Step 4: Core Provisioning Orchestration Engine
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/ICoreProvisioningService.cs`
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/CoreProvisioningService.cs`
  - Gating: Status must be `ReviewPremium`
  - Calls `IDevesMasterApiClient` to obtain `AgentCode` and `SourceCode`
  - Dispatches parallel sync to AS400, APAR, SAP, PCSDIS
  - Saves 4 `CoreSyncTransaction` records with unique `IdempotencyKey`
  - Transitions application to `ActiveTemporary` (Sets `Sla30DayDeadline = UtcNow + 30d`, `Sla90DayDeadline = UtcNow + 90d`)
  - Sends provisional activation email via `IEmailNotificationService`

### Step 5: SLA Monitoring Sweep Engine
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/ISlaMonitoringService.cs`
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/SlaMonitoringService.cs`
  - Scans `ActiveTemporary` applications:
    - Dispatches D-7 and D-3 warning alerts
    - Transitions to `Suspended30D` on day 30+ if physical contract is not archived + sends suspension email
  - Scans `Suspended30D` applications:
    - Transitions to `Terminated90D` on day 90+ if physical contract is not archived + sends termination email
  - Returns `SlaDaemonExecutionReport`

### Step 6: SLA Monitoring Hosted Service
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/SlaMonitoringBackgroundService.cs`
  - Implements `BackgroundService`
  - Uses `PeriodicTimer` with configurable interval
  - `SemaphoreSlim(1, 1)` execution lock
  - Resolves `ISlaMonitoringService` inside `IServiceScope`

### Step 7: Legal Hard-Copy Archive Service
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/IHardCopyArchiveService.cs`
- Create `src/backend/ManagedAgentBroker.Infrastructure/Services/HardCopyArchiveService.cs`
  - Validates `ArchiveBoxNumber`
  - Calls `application.VerifyAndArchiveHardCopy(boxNumber, auditorUserId)`
  - Transitions status to `ActivePermanent` (clearing suspension if any)
  - Sends permanent activation confirmation email

### Step 8: Dependency Injection Blueprints
- Update `src/backend/ManagedAgentBroker.Infrastructure/DependencyInjection.cs`
  - Register `ProvisioningSettings`
  - Register `IDevesMasterApiClient`, `ICoreProvisioningService`, `ISlaMonitoringService`, `IHardCopyArchiveService`, and `SlaMonitoringBackgroundService`

### Step 9: Test Suites & Verification
- Create `tests/backend/ManagedAgentBroker.Infrastructure.Tests/DevesMasterAndProvisioningPbtTests.cs` (**PBT-06**)
  - Property-based tests verifying Deves Master code generation invariant formats, 100% IT automation multi-system sync idempotency, and SLA timer invariants
- Create `tests/backend/ManagedAgentBroker.Infrastructure.Tests/CoreProvisioningServiceTests.cs`
  - Unit tests for provisioning prerequisites, multi-system sync success, and provisional selling activation
- Create `tests/backend/ManagedAgentBroker.Infrastructure.Tests/SlaMonitoringServiceTests.cs`
  - Unit tests for 30-day auto-suspension, 90-day auto-termination, early warning emails, and hard-copy exemption
- Create `tests/backend/ManagedAgentBroker.Infrastructure.Tests/HardCopyArchiveServiceTests.cs`
  - Unit tests for legal physical contract archiving and permanent status upgrade
- Run `dotnet test` to verify 100% pass rate across the whole solution

---

## Execution Checklist

- [x] Step 1: Implement `ProvisioningDtos.cs`
- [x] Step 2: Implement `ProvisioningSettings.cs`
- [x] Step 3: Implement `IDevesMasterApiClient.cs` & `DevesMasterApiClient.cs`
- [x] Step 4: Implement `ICoreProvisioningService.cs` & `CoreProvisioningService.cs`
- [x] Step 5: Implement `ISlaMonitoringService.cs` & `SlaMonitoringService.cs`
- [x] Step 6: Implement `SlaMonitoringBackgroundService.cs`
- [x] Step 7: Implement `IHardCopyArchiveService.cs` & `HardCopyArchiveService.cs`
- [x] Step 8: Update `DependencyInjection.cs`
- [x] Step 9: Implement and execute test suites (PBT-06 + Unit Tests)
