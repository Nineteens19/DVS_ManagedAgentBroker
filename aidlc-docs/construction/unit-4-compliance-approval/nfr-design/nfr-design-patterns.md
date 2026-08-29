# NFR Design Patterns — Unit 4: Compliance Screening & Native Approval Engine

This document details the architectural design patterns, resilience configurations, non-blocking notification dispatchers, and state machine transaction boundaries.

---

## 1. Compliance Screening Sandbox Pattern (`Polly` + Sandbox Heuristics)

```csharp
public interface IComplianceScreeningService
{
    Task<ComplianceCheckResultDto> CheckComplianceAsync(
        Guid applicationId,
        string nationalIdOrTaxId,
        CancellationToken ct = default);
}
```

### Deterministic Screening Test Heuristics:
- **Designated Match**: If `nationalIdOrTaxId.StartsWith("999")` $\rightarrow$ `AmloStatus.RejectedDesignated`, `OicStatus.Red` (Blocked from forwarding).
- **PEP Match**: If `nationalIdOrTaxId.StartsWith("888")` $\rightarrow$ `AmloStatus.FlaggedPep`, `OicStatus.Green` (`RequiresDirectorApproval = true`).
- **OIC Orange Match**: If `nationalIdOrTaxId.StartsWith("777")` $\rightarrow$ `AmloStatus.Clear`, `OicStatus.Orange` (`RequiresDirectorApproval = true`).
- **Standard Clear Match**: All other valid IDs $\rightarrow$ `AmloStatus.Clear`, `OicStatus.Green`.

---

## 2. Asynchronous Email Dispatcher Pattern

```csharp
public interface IEmailNotificationService
{
    Task SendAsync(EmailNotificationMessage message, CancellationToken ct = default);
}
```

### Fault Isolation Design:
- `ApprovalWorkflowService` invokes `_emailService.SendAsync(...)` within a `try-catch` block.
- Any SMTP exception is caught, logged with full correlation details, and suppressed from failing the approval transaction.
- In test environments, `InMemoryEmailNotificationService` captures messages into a concurrent list for assertion.

---

## 3. Executive Approval State Transition Pattern

```csharp
public interface IApprovalWorkflowService
{
    Task<AgentApplicationDto> ProcessDecisionAsync(
        Guid applicationId,
        ProcessApprovalDecisionCommand cmd,
        string approverUserId,
        CancellationToken ct = default);

    Task<AgentApplicationDto> ForwardToExecutiveAsync(
        Guid applicationId,
        string forwardedByUserId,
        CancellationToken ct = default);
}
```
