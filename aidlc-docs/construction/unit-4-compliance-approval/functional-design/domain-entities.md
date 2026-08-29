# Domain Entities & Models — Unit 4: Compliance Screening & Native Approval Engine

This document defines the domain models, command payloads, screening results, and email message schemas for Unit 4.

---

## 1. Compliance Screening Models

### 1.1 `ComplianceCheckResultDto`
```csharp
public class ComplianceCheckResultDto
{
    public Guid ApplicationId { get; set; }
    public AmloStatus AmloStatus { get; set; }
    public string? AmloReferenceId { get; set; }
    public string? AmloRemarks { get; set; }
    public DateTime AmloCheckedAt { get; set; }

    public OicStatus OicStatus { get; set; }
    public string? OicReferenceId { get; set; }
    public string? OicRemarks { get; set; }
    public DateTime OicCheckedAt { get; set; }

    public bool IsEligibleForApproval => 
        AmloStatus != AmloStatus.RejectedDesignated && 
        OicStatus != OicStatus.Red;

    public bool RequiresDirectorApproval => 
        AmloStatus == AmloStatus.FlaggedPep || 
        OicStatus == OicStatus.Orange;
}
```

---

## 2. Approval Workflow Models

### 2.1 `ProcessApprovalDecisionCommand`
```csharp
public class ProcessApprovalDecisionCommand
{
    public bool IsApproved { get; set; }
    public string? DecisionNotes { get; set; }
}
```

### 2.2 `ApprovalAuditDto`
```csharp
public class ApprovalAuditDto
{
    public Guid ApplicationId { get; set; }
    public string ApplicationNumber { get; set; } = string.Empty;
    public ApplicationStatus PreviousStatus { get; set; }
    public ApplicationStatus NewStatus { get; set; }
    public string DecidedBy { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime DecidedAt { get; set; }
}
```

---

## 3. Email Notification Message Schema

### 3.1 `EmailNotificationMessage`
```csharp
public class EmailNotificationMessage
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string PlainTextBody { get; set; } = string.Empty;
}
```
