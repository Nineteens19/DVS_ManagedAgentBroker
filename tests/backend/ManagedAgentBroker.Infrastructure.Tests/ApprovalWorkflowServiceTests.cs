using System;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class ApprovalWorkflowServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly ComplianceScreeningService _complianceService;
        private readonly InMemoryEmailNotificationService _emailService;
        private readonly ApprovalWorkflowService _approvalService;

        public ApprovalWorkflowServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var key = Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Aes256GcmDataProtectionProvider(key);
            _context = new ApplicationDbContext(options, dataProtectionProvider);

            _complianceService = new ComplianceScreeningService(
                _context, NullLogger<ComplianceScreeningService>.Instance);
            _emailService = new InMemoryEmailNotificationService(
                NullLogger<InMemoryEmailNotificationService>.Instance);
            _approvalService = new ApprovalWorkflowService(
                _context,
                _complianceService,
                _emailService,
                NullLogger<ApprovalWorkflowService>.Instance);
        }

        [Fact]
        public async Task ForwardToExecutive_WithValidSubmittedApp_ShouldSucceed_AndSendEmail()
        {
            // Arrange
            var app = AgentApplication.CreateDraft(
                "APP-20260829-0001",
                AgentType.Individual,
                "B01",
                "Headquarters",
                500000m,
                "branch.user");

            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "Somchai",
                LastNameTh = "Jaidee",
                NationalIdOrTaxId = "1100400011223"
            });
            app.SubmitByBranch("branch.user");

            _context.AgentApplications.Add(app);
            await _context.SaveChangesAsync();

            var cmd = new ForwardToExecutiveCommand { Notes = "Forwarding for executive signoff." };

            // Act
            var result = await _approvalService.ForwardToExecutiveAsync(app.Id, cmd, "ho.reviewer");

            // Assert
            result.Status.Should().Be(ApplicationStatus.PendingExecutiveApproval);

            var sentEmails = _emailService.GetSentMessages();
            sentEmails.Should().ContainSingle(m => m.Subject.Contains("Pending Executive Approval"));
        }

        [Fact]
        public async Task ForwardToExecutive_WithAmloDesignated_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var app = AgentApplication.CreateDraft(
                "APP-20260829-0002",
                AgentType.Individual,
                "B01",
                "Headquarters",
                500000m,
                "branch.user");

            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "Blacklisted",
                LastNameTh = "Person",
                NationalIdOrTaxId = "9990000000001" // Triggers designated sanctions
            });
            app.SubmitByBranch("branch.user");

            _context.AgentApplications.Add(app);
            await _context.SaveChangesAsync();

            var cmd = new ForwardToExecutiveCommand { Notes = "Try forwarding bad actor." };

            // Act & Assert
            var act = async () => await _approvalService.ForwardToExecutiveAsync(app.Id, cmd, "ho.reviewer");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*critical compliance violations*");
        }

        [Fact]
        public async Task ProcessDecision_Approve_ShouldTransitionToReviewPremium_AndSendEmail()
        {
            // Arrange
            var app = AgentApplication.CreateDraft(
                "APP-20260829-0003",
                AgentType.Individual,
                "B01",
                "Headquarters",
                300000m,
                "branch.user");

            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "Somsak",
                LastNameTh = "Meeprasert",
                NationalIdOrTaxId = "1100400033445"
            });
            app.SubmitByBranch("branch.user");
            app.AssignToHeadOfficeReview("ho.reviewer");
            app.ForwardToExecutiveApproval("ho.reviewer");

            _context.AgentApplications.Add(app);
            await _context.SaveChangesAsync();

            var cmd = new ProcessApprovalDecisionCommand
            {
                IsApproved = true,
                DecisionNotes = "Approved with full credit limit."
            };

            // Act
            var result = await _approvalService.ProcessDecisionAsync(app.Id, cmd, "md.executive");

            // Assert
            result.Status.Should().Be(ApplicationStatus.ReviewPremium);

            var sentEmails = _emailService.GetSentMessages();
            sentEmails.Should().ContainSingle(m => m.Subject.Contains("[Approved]"));
        }

        [Fact]
        public async Task ProcessDecision_Reject_ShouldTransitionToExecutiveRejected_AndSendEmail()
        {
            // Arrange
            var app = AgentApplication.CreateDraft(
                "APP-20260829-0004",
                AgentType.Individual,
                "B01",
                "Headquarters",
                300000m,
                "branch.user");

            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "Somying",
                LastNameTh = "Ruangdet",
                NationalIdOrTaxId = "1100400055667"
            });
            app.SubmitByBranch("branch.user");
            app.AssignToHeadOfficeReview("ho.reviewer");
            app.ForwardToExecutiveApproval("ho.reviewer");

            _context.AgentApplications.Add(app);
            await _context.SaveChangesAsync();

            var cmd = new ProcessApprovalDecisionCommand
            {
                IsApproved = false,
                DecisionNotes = "Credit limit too high for applicant profile."
            };

            // Act
            var result = await _approvalService.ProcessDecisionAsync(app.Id, cmd, "md.executive");

            // Assert
            result.Status.Should().Be(ApplicationStatus.ExecutiveRejected);

            var sentEmails = _emailService.GetSentMessages();
            sentEmails.Should().ContainSingle(m => m.Subject.Contains("[Rejected]"));
        }

        [Fact]
        public async Task ProcessDecision_OnDraftStatus_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var app = AgentApplication.CreateDraft(
                "APP-20260829-0005",
                AgentType.Individual,
                "B01",
                "Headquarters",
                300000m,
                "branch.user");

            _context.AgentApplications.Add(app);
            await _context.SaveChangesAsync();

            var cmd = new ProcessApprovalDecisionCommand { IsApproved = true };

            // Act & Assert
            var act = async () => await _approvalService.ProcessDecisionAsync(app.Id, cmd, "md.executive");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Expected 'PendingExecutiveApproval'*");
        }
    }
}
