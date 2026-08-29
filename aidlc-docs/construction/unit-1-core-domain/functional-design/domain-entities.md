# Domain Entities Specification — Unit 1: Core Domain & DB Schema

This document defines the domain models, value objects, audit properties, and database schema mappings for Unit 1.

---

## 1. Base Entity & Audit Infrastructure

```csharp
namespace ManagedAgentBroker.Domain.Common
{
    public abstract class BaseEntity<TId>
    {
        public TId Id { get; protected set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }

        private readonly List<IDomainEvent> _domainEvents = new();
        public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        public void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
        public void ClearDomainEvents() => _domainEvents.Clear();
    }

    public abstract class AggregateRoot<TId> : BaseEntity<TId> { }
}
```

---

## 2. Core Domain Entities & Aggregates

### 2.1 `AgentApplication` (Aggregate Root)
```csharp
namespace ManagedAgentBroker.Domain.Entities
{
    public class AgentApplication : AggregateRoot<Guid>
    {
        public string ApplicationNumber { get; private set; } // APP-YYYYMMDD-XXXX
        public ApplicationStatus Status { get; private set; }
        public AgentType AgentType { get; private set; } // Individual, Corporate
        public string BranchCode { get; private set; }
        public string BranchName { get; private set; }
        public string? HandlerCode { get; private set; }
        public decimal RequestedCreditLimit { get; private set; }
        public decimal ApprovedCreditLimit { get; private set; }
        public int CreditTermMotorDays { get; private set; } // 15, 30, 31
        public int CreditTermNonMotorDays { get; private set; } // <= 45

        // Core System Linkages
        public string? AgentCode { get; private set; }
        public string? SourceCode { get; private set; }
        public string? UnitExecutiveCode { get; private set; }
        public decimal CommissionPercentage { get; private set; }

        // Provisional Selling & SLA Timers
        public DateTime? ProvisionalSellingActivatedAt { get; private set; }
        public DateTime? Sla30DayDeadline { get; private set; }
        public DateTime? Sla90DayDeadline { get; private set; }
        public DateTime? SuspendedAt { get; private set; }
        public string? SuspensionReason { get; private set; }

        // Navigation Properties
        public AgentProfile Profile { get; private set; }
        public Guarantor? Guarantor { get; private set; }
        public Collateral? Collateral { get; private set; }
        public ComplianceRecord ComplianceRecord { get; private set; }
        public PhysicalContractRecord PhysicalContractRecord { get; private set; }
        public ICollection<ApplicationAttachment> Attachments { get; private set; } = new List<ApplicationAttachment>();
        public ICollection<RejectChecklistItem> RejectChecklistItems { get; private set; } = new List<RejectChecklistItem>();
        public ICollection<CoreSyncTransaction> SyncTransactions { get; private set; } = new List<CoreSyncTransaction>();
    }
}
```

### 2.2 `AgentProfile`
```csharp
public class AgentProfile : BaseEntity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public string TitleTh { get; private set; }
    public string FirstNameTh { get; private set; }
    public string LastNameTh { get; private set; }
    public string FullNameTh => $"{TitleTh}{FirstNameTh} {LastNameTh}";
    public string NationalIdOrTaxId { get; private set; }
    public string? LicenseNumber { get; private set; }
    public DateTime? LicenseExpiryDate { get; private set; }
    public string PhoneNumber { get; private set; }
    public string Email { get; private set; }
    public string Address { get; private set; }
    public string BankName { get; private set; }
    public string BankAccountNumber { get; private set; }
    public string BankAccountName { get; private set; }
}
```

### 2.3 `Guarantor`
```csharp
public class Guarantor : BaseEntity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public string TitleTh { get; private set; }
    public string FirstNameTh { get; private set; }
    public string LastNameTh { get; private set; }
    public string NationalId { get; private set; }
    public string Relationship { get; private set; }
    public string EmployerName { get; private set; }
    public string Position { get; private set; }
    public decimal MonthlySalary { get; private set; }
    public string ContactPhone { get; private set; }
}
```

### 2.4 `Collateral`
```csharp
public class Collateral : BaseEntity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public CollateralType Type { get; private set; } // CashDeposit, BankGuarantee, LandTitleDeed, GuarantorOnly
    public string? DocumentRefNumber { get; private set; }
    public decimal AppraisedValue { get; private set; }
    public string Description { get; private set; }
}
```

### 2.5 `ComplianceRecord`
```csharp
public class ComplianceRecord : BaseEntity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public AmloStatus AmloStatus { get; private set; } // Passed, FlaggedPep, RejectedDesignated
    public string? AmloReferenceId { get; private set; }
    public DateTime? AmloCheckedAt { get; private set; }
    
    public OicStatus OicStatus { get; private set; } // Green, Yellow, Orange, Red
    public string? OicReferenceId { get; private set; }
    public DateTime? OicCheckedAt { get; private set; }
    
    public bool RequiresDirectorApproval => AmloStatus == AmloStatus.FlaggedPep || OicStatus == OicStatus.Orange;
}
```

### 2.6 `PhysicalContractRecord`
```csharp
public class PhysicalContractRecord : BaseEntity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public PhysicalContractStatus Status { get; private set; } // PendingBranchDispatch, InTransit, ReceivedLegal, DefectNotified, Archived
    public DateTime? DispatchedFromBranchAt { get; private set; }
    public DateTime? ReceivedAtLegalAt { get; private set; }
    public string? ArchiveBoxNumber { get; private set; }
    public string? LegalAuditorNotes { get; private set; }
}
```

### 2.7 `CoreSyncTransaction`
```csharp
public class CoreSyncTransaction : BaseEntity<Guid>
{
    public Guid ApplicationId { get; private set; }
    public TargetSystem TargetSystem { get; private set; } // AS400, APAR, SAP, PCSDIS
    public string IdempotencyKey { get; private set; }
    public SyncStatus Status { get; private set; } // Pending, Success, Failed, Retrying
    public int RetryCount { get; private set; }
    public string? RequestPayload { get; private set; }
    public string? ResponsePayload { get; private set; }
    public string? ErrorMessage { get; private set; }
    public DateTime? CompletedAt { get; private set; }
}
```

---

## 3. Enumerations & Value Types

```csharp
public enum ApplicationStatus
{
    Draft = 1,
    SubmittedBranch = 2,
    ReviewHeadOffice = 3,
    PendingEasApproval = 4,
    ReviewPremium = 5,
    CoreAutoProvisioning = 6,
    ActiveTemporary = 7,     // เปิดขายชั่วคราว (Provisional Selling Active)
    ReviewLegalOriginal = 8,
    ActivePermanent = 9,     // เปิดขายถาวร (Permanent Selling Rights)
    Suspended30D = 10,       // ระงับการส่งงาน Auto (30-day SLA breach)
    Terminated90D = 11,      // ปิดรหัสถาวร Auto (90-day SLA expiration)
    ReturnedForCorrection = 12,
    EasRejected = 13,
    ComplianceRejected = 14
}

public enum AgentType { Individual = 1, Corporate = 2 }
public enum CollateralType { CashDeposit = 1, BankGuarantee = 2, LandTitleDeed = 3, GuarantorOnly = 4 }
public enum AmloStatus { Pending = 0, Passed = 1, FlaggedPep = 2, RejectedDesignated = 3 }
public enum OicStatus { Pending = 0, Green = 1, Yellow = 2, Orange = 3, Red = 4 }
public enum TargetSystem { AS400 = 1, APAR = 2, SAP = 3, PCSDIS = 4 }
public enum SyncStatus { Pending = 1, Success = 2, Failed = 3, Retrying = 4 }
```
