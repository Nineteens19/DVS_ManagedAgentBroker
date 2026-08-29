# Code Generation Plan — Unit 4: Compliance Screening & Native Approval Engine

## Purpose
This plan specifies the implementation steps for Unit 4, covering compliance screening adapters (AMLO / OIC), email notification services (SMTP / InMemory), native internal executive approval workflows, and comprehensive test suites including property-based tests (`PBT-05`).

---

## Execution Checklist

- [x] **Step 1: Compliance Models & Approval DTOs**
  - [x] Implement `ComplianceCheckResultDto.cs` & `ApprovalWorkflowDtos.cs` in `ManagedAgentBroker.Domain`

- [x] **Step 2: Email Notification Engine**
  - [x] Implement `EmailSettings.cs` in `ManagedAgentBroker.Infrastructure/Configuration`
  - [x] Implement `IEmailNotificationService.cs`
  - [x] Implement `InMemoryEmailNotificationService.cs` (captures messages in memory for dev/testing)
  - [x] Implement `SmtpEmailNotificationService.cs` (SMTP client with HTML template formatting)

- [x] **Step 3: Compliance Screening Service**
  - [x] Implement `IComplianceScreeningService.cs` & `ComplianceScreeningService.cs` (deterministic sandbox heuristics for AMLO/OIC + database record persistence)

- [x] **Step 4: Native Executive Approval Workflow Service**
  - [x] Implement `IApprovalWorkflowService.cs` & `ApprovalWorkflowService.cs` (state transitions: `SubmittedBranch` $\rightarrow$ `PendingExecutiveApproval` $\rightarrow$ `ReviewPremium` / `ExecutiveRejected`, `RequiresDirectorApproval` escalation, email notifications)

- [x] **Step 5: Dependency Injection Registration**
  - [x] Register Unit 4 services and `EmailSettings` in `DependencyInjection.cs`

- [x] **Step 6: Unit & Property-Based Test Suites**
  - [x] Create `ComplianceScreeningPbtTests.cs` (`PBT-05` property-based tests for compliance status invariants)
  - [x] Create `ApprovalWorkflowServiceTests.cs` (approval/rejection state transitions, role authorization, and email notification verification)
  - [x] Create `EmailNotificationServiceTests.cs` (template rendering and delivery isolation)

- [x] **Step 7: Test Execution & Verification**
  - [x] Execute `dotnet test` to verify all test suites pass (Units 1, 2, 3, and 4: 52/52 tests passed).

---

## Proposed File Changes

### 1. `ManagedAgentBroker.Domain`
- [NEW] `DTOs/ComplianceAndApprovalDtos.cs`

### 2. `ManagedAgentBroker.Infrastructure`
- [NEW] `Configuration/EmailSettings.cs`
- [NEW] `Services/IEmailNotificationService.cs`
- [NEW] `Services/InMemoryEmailNotificationService.cs`
- [NEW] `Services/SmtpEmailNotificationService.cs`
- [NEW] `Services/IComplianceScreeningService.cs`
- [NEW] `Services/ComplianceScreeningService.cs`
- [NEW] `Services/IApprovalWorkflowService.cs`
- [NEW] `Services/ApprovalWorkflowService.cs`
- [MODIFY] `DependencyInjection.cs`

### 3. `ManagedAgentBroker.Infrastructure.Tests`
- [NEW] `ComplianceScreeningPbtTests.cs`
- [NEW] `ApprovalWorkflowServiceTests.cs`
- [NEW] `EmailNotificationServiceTests.cs`
