using System;
using System.Collections.Generic;
using ManagedAgentBroker.Domain.Enums;

namespace ManagedAgentBroker.Domain.DTOs
{
    public class CreateDraftApplicationCommand
    {
        public AgentType AgentType { get; set; } = AgentType.Individual;
        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public decimal RequestedCreditLimit { get; set; } = 50000;
        public AgentProfileDto Profile { get; set; } = new();
        public GuarantorDto? Guarantor { get; set; }
        public CollateralDto? Collateral { get; set; }
        public int CreditTermMotorDays { get; set; } = 30;
        public int CreditTermNonMotorDays { get; set; } = 45;
    }

    public class UpdateDraftApplicationCommand
    {
        public AgentType AgentType { get; set; } = AgentType.Individual;
        public decimal RequestedCreditLimit { get; set; }
        public AgentProfileDto Profile { get; set; } = new();
        public GuarantorDto? Guarantor { get; set; }
        public CollateralDto? Collateral { get; set; }
        public int CreditTermMotorDays { get; set; } = 30;
        public int CreditTermNonMotorDays { get; set; } = 45;
    }

    public class AgentProfileDto
    {
        public string TitleTh { get; set; } = string.Empty;
        public string FirstNameTh { get; set; } = string.Empty;
        public string LastNameTh { get; set; } = string.Empty;
        public string NationalIdOrTaxId { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankAccountName { get; set; } = string.Empty;
    }

    public class GuarantorDto
    {
        public string TitleTh { get; set; } = string.Empty;
        public string FirstNameTh { get; set; } = string.Empty;
        public string LastNameTh { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string EmployerName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public decimal MonthlySalary { get; set; }
        public string ContactPhone { get; set; } = string.Empty;
    }

    public class CollateralDto
    {
        public CollateralType Type { get; set; }
        public string? DocumentRefNumber { get; set; }
        public decimal AppraisedValue { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class UploadAttachmentCommand
    {
        public string DocumentType { get; set; } = string.Empty; // ID_CARD, BOOK_BANK, BROKER_LICENSE, etc.
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public Stream ContentStream { get; set; } = Stream.Null;
    }

    public class AttachmentDto
    {
        public Guid Id { get; set; }
        public Guid ApplicationId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string FileHashSha256 { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }

    public class RejectChecklistItemDto
    {
        public Guid Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsResolved { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    public class ReturnForCorrectionCommand
    {
        public List<RejectChecklistItemDto> Items { get; set; } = new();
    }

    public class ResubmitApplicationCommand
    {
        public List<Guid> ResolvedItemIds { get; set; } = new();
        public string ResubmissionNotes { get; set; } = string.Empty;
    }

    public class AgentApplicationDto
    {
        public Guid Id { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public ApplicationStatus Status { get; set; }
        public AgentType AgentType { get; set; }
        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string? HandlerCode { get; set; }
        public decimal RequestedCreditLimit { get; set; }
        public decimal ApprovedCreditLimit { get; set; }
        public int CreditTermMotorDays { get; set; }
        public int CreditTermNonMotorDays { get; set; }
        public string? AgentCode { get; set; }
        public string? SourceCode { get; set; }
        public string? UnitExecutiveCode { get; set; }
        public decimal CommissionPercentage { get; set; }
        public DateTime? ProvisionalSellingActivatedAt { get; set; }
        public DateTime? Sla30DayDeadline { get; set; }
        public DateTime? Sla90DayDeadline { get; set; }
        public DateTime? SuspendedAt { get; set; }
        public string? SuspensionReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }

        public AgentProfileDto Profile { get; set; } = new();
        public GuarantorDto? Guarantor { get; set; }
        public CollateralDto? Collateral { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new();
        public List<RejectChecklistItemDto> RejectChecklistItems { get; set; } = new();
    }
}
