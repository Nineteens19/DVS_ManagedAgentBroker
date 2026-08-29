using System;
using System.Linq;
using FluentAssertions;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Events;
using ManagedAgentBroker.Domain.Exceptions;
using Xunit;

namespace ManagedAgentBroker.Domain.Tests
{
    public class AgentApplicationStateTests
    {
        [Fact]
        public void CreateDraft_WithValidData_ShouldInitializeInDraftStatus()
        {
            // Act
            var app = AgentApplication.CreateDraft(
                "APP-20260829-0001",
                AgentType.Individual,
                "5Q",
                "สาขาอุดรธานี",
                50000m,
                "USER_TEST");

            // Assert
            app.Should().NotBeNull();
            app.Status.Should().Be(ApplicationStatus.Draft);
            app.ApplicationNumber.Should().Be("APP-20260829-0001");
            app.RequestedCreditLimit.Should().Be(50000m);
            app.DomainEvents.Should().ContainSingle(e => e is ApplicationStatusChangedEvent);
        }

        [Fact]
        public void CreateDraft_WithCreditLimitUnder10000_ShouldThrowDomainRuleValidationException()
        {
            // Act
            Action act = () => AgentApplication.CreateDraft(
                "APP-20260829-0001",
                AgentType.Individual,
                "5Q",
                "สาขาอุดรธานี",
                5000m,
                "USER_TEST");

            // Assert
            act.Should().Throw<DomainRuleValidationException>()
                .WithMessage("*BR-CREDIT-01*");
        }

        [Fact]
        public void SubmitByBranch_WithoutNationalId_ShouldThrowDomainRuleValidationException()
        {
            // Arrange
            var app = AgentApplication.CreateDraft("APP-20260829-0001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER_TEST");

            // Act
            Action act = () => app.SubmitByBranch("USER_TEST");

            // Assert
            act.Should().Throw<DomainRuleValidationException>()
                .WithMessage("*BR-APP-02*");
        }

        [Fact]
        public void FullHappyPath_ShouldProgressToActivePermanent()
        {
            // Arrange
            var app = AgentApplication.CreateDraft("APP-20260829-0001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER_TEST");
            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "กรรณิการ์",
                LastNameTh = "ลอดคำทุย",
                NationalIdOrTaxId = "1410100123456"
            });
            app.SetCreditTerms(30, 45);

            // Step 1: Submit by Branch
            app.SubmitByBranch("USER_BRANCH");
            app.Status.Should().Be(ApplicationStatus.SubmittedBranch);

            // Step 2: Head Office Review
            app.AssignToHeadOfficeReview("USER_HO");
            app.Status.Should().Be(ApplicationStatus.ReviewHeadOffice);

            // Step 3: Forward to Executive Approval
            app.ForwardToExecutiveApproval("USER_HO");
            app.Status.Should().Be(ApplicationStatus.PendingExecutiveApproval);

            // Step 4: Executive Approval
            app.ProcessExecutiveApproval(true, "USER_MD", "Approved");
            app.Status.Should().Be(ApplicationStatus.ReviewPremium);

            // Step 5: Premium Approval
            app.ApproveCreditAndTriggerProvisioning(50000m, 18m, "USER_PREMIUM");
            app.Status.Should().Be(ApplicationStatus.CoreAutoProvisioning);

            // Step 6: 100% Automated Provisioning Completed -> Active Temporary (Provisional Selling)
            app.ActivateProvisionalSelling("AG-1001", "SRC-2001", "UE-01");
            app.Status.Should().Be(ApplicationStatus.ActiveTemporary);
            app.ProvisionalSellingActivatedAt.Should().NotBeNull();
            app.Sla30DayDeadline.Should().NotBeNull();
            app.DomainEvents.Should().Contain(e => e is ProvisionalSellingActivatedEvent);

            // Step 7: Legal verifies physical contract -> Active Permanent
            app.VerifyAndArchiveHardCopy("BOX-2026-A1", "USER_LEGAL");
            app.Status.Should().Be(ApplicationStatus.ActivePermanent);
            app.PhysicalContractRecord.Status.Should().Be(PhysicalContractStatus.Archived);
        }

        [Fact]
        public void SlaBreached_ShouldTriggerAutoSuspension_AndSubsequentPermanentTermination()
        {
            // Arrange
            var app = AgentApplication.CreateDraft("APP-20260829-0001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER_TEST");
            app.SetProfile(new AgentProfile { FirstNameTh = "Test", LastNameTh = "Agent", NationalIdOrTaxId = "1410100123456" });
            app.SubmitByBranch("USER_BRANCH");
            app.AssignToHeadOfficeReview("USER_HO");
            app.ForwardToExecutiveApproval("USER_HO");
            app.ProcessExecutiveApproval(true, "USER_MD");
            app.ApproveCreditAndTriggerProvisioning(50000m, 18m, "USER_PREMIUM");
            app.ActivateProvisionalSelling("AG-1001", "SRC-2001", "UE-01");

            // Act 1: 30-day SLA Auto Suspension
            app.TriggerAutoSuspension("Exceeded 30-day SLA without hard-copy contract submission.");

            // Assert 1
            app.Status.Should().Be(ApplicationStatus.Suspended30D);
            app.SuspendedAt.Should().NotBeNull();
            app.DomainEvents.Should().Contain(e => e is AgentAutoSuspendedEvent);

            // Act 2: 90-day SLA Auto Termination
            app.TriggerAutoTermination("Exceeded 90-day hard-copy expiration deadline.");

            // Assert 2
            app.Status.Should().Be(ApplicationStatus.Terminated90D);
            app.DomainEvents.Should().Contain(e => e is AgentAutoTerminatedEvent);
        }

        [Fact]
        public void InvalidTransition_FromDraftToActivePermanent_ShouldThrowInvalidStateTransitionException()
        {
            // Arrange
            var app = AgentApplication.CreateDraft("APP-20260829-0001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER_TEST");

            // Act
            Action act = () => app.VerifyAndArchiveHardCopy("BOX-01", "USER_LEGAL");

            // Assert
            act.Should().Throw<InvalidStateTransitionException>()
                .Where(ex => ex.CurrentStatus == ApplicationStatus.Draft && ex.TargetStatus == ApplicationStatus.ActivePermanent);
        }
    }
}
