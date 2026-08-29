using System;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Domain.Enums;

namespace ManagedAgentBroker.Domain.Entities
{
    public class AgentProfile : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public string TitleTh { get; set; } = string.Empty;
        public string FirstNameTh { get; set; } = string.Empty;
        public string LastNameTh { get; set; } = string.Empty;
        public string FullNameTh => $"{TitleTh}{FirstNameTh} {LastNameTh}".Trim();
        public string NationalIdOrTaxId { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankAccountName { get; set; } = string.Empty;

        public AgentApplication? Application { get; set; }
    }

    public class Guarantor : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public string TitleTh { get; set; } = string.Empty;
        public string FirstNameTh { get; set; } = string.Empty;
        public string LastNameTh { get; set; } = string.Empty;
        public string FullNameTh => $"{TitleTh}{FirstNameTh} {LastNameTh}".Trim();
        public string NationalId { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string EmployerName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public decimal MonthlySalary { get; set; }
        public string ContactPhone { get; set; } = string.Empty;

        public AgentApplication? Application { get; set; }
    }

    public class Collateral : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public CollateralType Type { get; set; }
        public string? DocumentRefNumber { get; set; }
        public decimal AppraisedValue { get; set; }
        public string Description { get; set; } = string.Empty;

        public AgentApplication? Application { get; set; }
    }

    public class ComplianceRecord : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public AmloStatus AmloStatus { get; set; } = AmloStatus.Pending;
        public string? AmloReferenceId { get; set; }
        public DateTime? AmloCheckedAt { get; set; }

        public OicStatus OicStatus { get; set; } = OicStatus.Pending;
        public string? OicReferenceId { get; set; }
        public DateTime? OicCheckedAt { get; set; }

        public bool RequiresDirectorApproval => AmloStatus == AmloStatus.FlaggedPep || OicStatus == OicStatus.Orange;

        public AgentApplication? Application { get; set; }
    }

    public class PhysicalContractRecord : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public PhysicalContractStatus Status { get; set; } = PhysicalContractStatus.PendingBranchDispatch;
        public DateTime? DispatchedFromBranchAt { get; set; }
        public DateTime? ReceivedAtLegalAt { get; set; }
        public string? ArchiveBoxNumber { get; set; }
        public string? LegalAuditorNotes { get; set; }

        public AgentApplication? Application { get; set; }
    }

    public class CoreSyncTransaction : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public TargetSystem TargetSystem { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public SyncStatus Status { get; set; } = SyncStatus.Pending;
        public int RetryCount { get; set; } = 0;
        public string? RequestPayload { get; set; }
        public string? ResponsePayload { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime? CompletedAt { get; set; }

        public AgentApplication? Application { get; set; }
    }

    public class ApplicationAttachment : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public string DocumentType { get; set; } = string.Empty; // ID_CARD, BOOK_BANK, BROKER_LICENSE, GUARANTOR_ID, COLLATERAL_DOC
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string FileHashSha256 { get; set; } = string.Empty;

        public AgentApplication? Application { get; set; }
    }

    public class RejectChecklistItem : BaseEntity<Guid>
    {
        public Guid ApplicationId { get; set; }
        public string Category { get; set; } = string.Empty; // DocumentMissing, SalaryInsufficient, LicenseExpired, Other
        public string Description { get; set; } = string.Empty;
        public bool IsResolved { get; set; } = false;
        public DateTime? ResolvedAt { get; set; }

        public AgentApplication? Application { get; set; }
    }
}
