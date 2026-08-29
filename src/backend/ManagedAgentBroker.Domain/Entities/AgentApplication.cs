using System;
using System.Collections.Generic;
using System.Linq;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Events;
using ManagedAgentBroker.Domain.Exceptions;

namespace ManagedAgentBroker.Domain.Entities
{
    public class AgentApplication : AggregateRoot<Guid>
    {
        public string ApplicationNumber { get; private set; } = string.Empty;
        public ApplicationStatus Status { get; private set; } = ApplicationStatus.Draft;
        public AgentType AgentType { get; private set; } = AgentType.Individual;
        public string BranchCode { get; private set; } = string.Empty;
        public string BranchName { get; private set; } = string.Empty;
        public string? HandlerCode { get; private set; }
        public decimal RequestedCreditLimit { get; private set; }
        public decimal ApprovedCreditLimit { get; private set; }
        public int CreditTermMotorDays { get; private set; } = 30;
        public int CreditTermNonMotorDays { get; private set; } = 45;

        // Core System Identifiers
        public string? AgentCode { get; private set; }
        public string? SourceCode { get; private set; }
        public string? UnitExecutiveCode { get; private set; }
        public decimal CommissionPercentage { get; private set; }

        // Provisional Selling Rights & SLA Timers
        public DateTime? ProvisionalSellingActivatedAt { get; private set; }
        public DateTime? Sla30DayDeadline { get; private set; }
        public DateTime? Sla90DayDeadline { get; private set; }
        public DateTime? SuspendedAt { get; private set; }
        public string? SuspensionReason { get; private set; }

        // Navigation Properties
        public AgentProfile Profile { get; private set; } = new();
        public Guarantor? Guarantor { get; private set; }
        public Collateral? Collateral { get; private set; }
        public ComplianceRecord ComplianceRecord { get; private set; } = new();
        public PhysicalContractRecord PhysicalContractRecord { get; private set; } = new();
        public List<ApplicationAttachment> Attachments { get; private set; } = new();
        public List<RejectChecklistItem> RejectChecklistItems { get; private set; } = new();
        public List<CoreSyncTransaction> SyncTransactions { get; private set; } = new();

        // EF Core Constructor
        private AgentApplication() { }

        // Factory Method
        public static AgentApplication CreateDraft(
            string applicationNumber,
            AgentType agentType,
            string branchCode,
            string branchName,
            decimal requestedCreditLimit,
            string createdBy)
        {
            if (string.IsNullOrWhiteSpace(applicationNumber))
                throw new DomainRuleValidationException("BR-APP-01", "Application number cannot be empty.");

            if (requestedCreditLimit < 10000)
                throw new DomainRuleValidationException("BR-CREDIT-01", "Requested credit limit must be at least 10,000 THB.");

            var application = new AgentApplication
            {
                Id = Guid.NewGuid(),
                ApplicationNumber = applicationNumber,
                AgentType = agentType,
                BranchCode = branchCode,
                BranchName = branchName,
                RequestedCreditLimit = requestedCreditLimit,
                Status = ApplicationStatus.Draft,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow
            };

            application.Profile.ApplicationId = application.Id;
            application.ComplianceRecord.ApplicationId = application.Id;
            application.PhysicalContractRecord.ApplicationId = application.Id;

            application.AddDomainEvent(new ApplicationStatusChangedEvent(
                application.Id, 
                application.ApplicationNumber, 
                ApplicationStatus.Draft, 
                ApplicationStatus.Draft, 
                createdBy));

            return application;
        }

        public void SetProfile(AgentProfile profile)
        {
            Profile = profile ?? throw new ArgumentNullException(nameof(profile));
            Profile.ApplicationId = Id;
        }

        public void SetGuarantor(Guarantor guarantor)
        {
            Guarantor = guarantor;
            if (Guarantor != null) Guarantor.ApplicationId = Id;
        }

        public void SetCollateral(Collateral collateral)
        {
            Collateral = collateral;
            if (Collateral != null) Collateral.ApplicationId = Id;
        }

        public void SetCreditTerms(int motorDays, int nonMotorDays)
        {
            if (motorDays != 15 && motorDays != 30 && motorDays != 31)
                throw new DomainRuleValidationException("BR-CREDIT-02", "Motor credit term must be strictly 15, 30, or 31 days.");

            if (nonMotorDays <= 0 || nonMotorDays > 45)
                throw new DomainRuleValidationException("BR-CREDIT-02", "Non-Motor credit term must not exceed 45 days.");

            CreditTermMotorDays = motorDays;
            CreditTermNonMotorDays = nonMotorDays;
        }

        public void SubmitByBranch(string userId)
        {
            if (Status != ApplicationStatus.Draft && Status != ApplicationStatus.ReturnedForCorrection)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.SubmittedBranch);

            if (string.IsNullOrWhiteSpace(Profile.NationalIdOrTaxId))
                throw new DomainRuleValidationException("BR-APP-02", "Applicant National ID / Tax ID is required before submission.");

            TransitionTo(ApplicationStatus.SubmittedBranch, userId);
        }

        public void AssignToHeadOfficeReview(string reviewerId)
        {
            if (Status != ApplicationStatus.SubmittedBranch)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.ReviewHeadOffice);

            HandlerCode = reviewerId;
            TransitionTo(ApplicationStatus.ReviewHeadOffice, reviewerId);
        }

        public void ForwardToExecutiveApproval(string userId)
        {
            if (Status != ApplicationStatus.ReviewHeadOffice)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.PendingExecutiveApproval);

            if (ComplianceRecord.AmloStatus == AmloStatus.RejectedDesignated)
                throw new DomainRuleValidationException("BR-COMPLIANCE-01", "Cannot forward application: AMLO designated sanction match.");

            if (ComplianceRecord.OicStatus == OicStatus.Red)
                throw new DomainRuleValidationException("BR-COMPLIANCE-02", "Cannot forward application: OIC Blacklist RED rating.");

            TransitionTo(ApplicationStatus.PendingExecutiveApproval, userId);
        }

        public void ProcessExecutiveApproval(bool isApproved, string approverId, string? notes = null)
        {
            if (Status != ApplicationStatus.PendingExecutiveApproval)
                throw new InvalidStateTransitionException(Status, isApproved ? ApplicationStatus.ReviewPremium : ApplicationStatus.ExecutiveRejected);

            if (isApproved)
            {
                TransitionTo(ApplicationStatus.ReviewPremium, approverId);
            }
            else
            {
                TransitionTo(ApplicationStatus.ExecutiveRejected, approverId);
            }
        }

        public void ApproveCreditAndTriggerProvisioning(decimal approvedCreditLimit, decimal commissionPercentage, string userId)
        {
            if (Status != ApplicationStatus.ReviewPremium)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.CoreAutoProvisioning);

            if (approvedCreditLimit <= 0)
                throw new DomainRuleValidationException("BR-CREDIT-01", "Approved credit limit must be greater than zero.");

            ApprovedCreditLimit = approvedCreditLimit;
            CommissionPercentage = commissionPercentage;
            TransitionTo(ApplicationStatus.CoreAutoProvisioning, userId);
        }

        public void ActivateProvisionalSelling(string agentCode, string sourceCode, string? unitExecutiveCode, string systemUserId = "SYSTEM_PROVISIONER")
        {
            if (Status != ApplicationStatus.CoreAutoProvisioning)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.ActiveTemporary);

            if (string.IsNullOrWhiteSpace(agentCode) || string.IsNullOrWhiteSpace(sourceCode))
                throw new DomainRuleValidationException("BR-CORE-01", "AgentCode and SourceCode must be generated before activating provisional selling.");

            AgentCode = agentCode;
            SourceCode = sourceCode;
            UnitExecutiveCode = unitExecutiveCode;

            var now = DateTime.UtcNow;
            ProvisionalSellingActivatedAt = now;
            Sla30DayDeadline = now.Date.AddDays(30);
            Sla90DayDeadline = now.Date.AddDays(90);

            TransitionTo(ApplicationStatus.ActiveTemporary, systemUserId);

            AddDomainEvent(new ProvisionalSellingActivatedEvent(
                Id,
                ApplicationNumber,
                AgentCode,
                SourceCode,
                now,
                Sla30DayDeadline.Value,
                Sla90DayDeadline.Value));
        }

        public void VerifyAndArchiveHardCopy(string archiveBoxNumber, string auditorUserId)
        {
            if (Status != ApplicationStatus.ActiveTemporary && Status != ApplicationStatus.Suspended30D)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.ActivePermanent);

            PhysicalContractRecord.Status = PhysicalContractStatus.Archived;
            PhysicalContractRecord.ReceivedAtLegalAt = DateTime.UtcNow;
            PhysicalContractRecord.ArchiveBoxNumber = archiveBoxNumber;

            SuspendedAt = null;
            SuspensionReason = null;

            TransitionTo(ApplicationStatus.ActivePermanent, auditorUserId);
        }

        public void TriggerAutoSuspension(string reason, string systemUserId = "SLA_DAEMON")
        {
            if (Status != ApplicationStatus.ActiveTemporary)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.Suspended30D);

            SuspendedAt = DateTime.UtcNow;
            SuspensionReason = reason;

            TransitionTo(ApplicationStatus.Suspended30D, systemUserId);

            AddDomainEvent(new AgentAutoSuspendedEvent(
                Id,
                ApplicationNumber,
                AgentCode ?? string.Empty,
                reason,
                SuspendedAt.Value));
        }

        public void TriggerAutoTermination(string reason, string systemUserId = "SLA_DAEMON")
        {
            if (Status != ApplicationStatus.Suspended30D)
                throw new InvalidStateTransitionException(Status, ApplicationStatus.Terminated90D);

            TransitionTo(ApplicationStatus.Terminated90D, systemUserId);

            AddDomainEvent(new AgentAutoTerminatedEvent(
                Id,
                ApplicationNumber,
                AgentCode ?? string.Empty,
                reason,
                DateTime.UtcNow));
        }

        public void ReturnForCorrection(IEnumerable<RejectChecklistItem> checklist, string reviewerId)
        {
            if (checklist != null)
            {
                foreach (var item in checklist)
                {
                    item.ApplicationId = Id;
                    RejectChecklistItems.Add(item);
                }
            }

            TransitionTo(ApplicationStatus.ReturnedForCorrection, reviewerId);
        }

        private void TransitionTo(ApplicationStatus newStatus, string changedBy)
        {
            var previous = Status;
            Status = newStatus;
            UpdatedAt = DateTime.UtcNow;
            UpdatedBy = changedBy;

            AddDomainEvent(new ApplicationStatusChangedEvent(Id, ApplicationNumber, previous, newStatus, changedBy));
        }
    }
}
