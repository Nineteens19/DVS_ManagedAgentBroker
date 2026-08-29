# Code Generation Plan — Unit 4: Compliance Screening & Native Approval Engine

## Purpose
This plan specifies the implementation steps for Unit 4, covering compliance screening adapters (AMLO / OIC), email notification services (SMTP / InMemory), native internal executive approval workflows, and comprehensive test suites including property-based tests (`PBT-05`).

---

## Execution Checklist

- [ ] **Step 1: Compliance Models & Approval DTOs**
  - [ ] Implement `ComplianceCheckResultDto.cs` & `ApprovalWorkflowDtos.cs` in `ManagedAgentBroker.Domain`

- [ ] **Step 2: Email Notification Engine**
  - [ ] Implement `EmailSettings.cs` in `ManagedAgentBroker.Infrastructure/Configuration`
  - [ ] Implement `IEmailNotificationService.cs`
  - [ ] Implement `InMemoryEmailNotificationService.cs` (captures messages in memory for dev/testing)
  - [ ] Implement `SmtpEmailNotificationService.cs` (SMTP client with HTML template formatting)

- [ ] **Step 3: Compliance Screening Service**
  - [ ] Implement `IComplianceScreeningService.cs` & `ComplianceScreeningService.cs` (deterministic sandbox heuristics for AMLO/OIC + database record persistence)

- [ ] **Step 4: Native Executive Approval Workflow Service**
  - [ ] Implement `IApprovalWorkflowService.cs` & `ApprovalWorkflowService.cs` (state transitions: `SubmittedBranch` $\rightarrow$ `PendingExecutiveApproval` $\rightarrow$ `ReviewPremium` / `ExecutiveRejected`, `RequiresDirectorApproval` escalation, email notifications)

- [ ] **Step 5: Dependency Injection Registration**
  - [ ] Register Unit 4 services and `EmailSettings` in `DependencyInjection.cs`

- [ ] **Step 6: Unit & Property-Based Test Suites**
  - [ ] Create `ComplianceScreeningPbtTests.cs` (`PBT-05` property-based tests for compliance status invariants)
  - [ ] Create `ApprovalWorkflowServiceTests.cs` (approval/rejection state transitions, role authorization, and email notification verification)
  - [ ] Create `EmailNotificationServiceTests.cs` (template rendering and delivery isolation)

- [ ] **Step 7: Test Execution & Verification**
  - [ ] Execute `dotnet test` to verify all test suites pass (Units 1, 2, 3, and 4).

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
