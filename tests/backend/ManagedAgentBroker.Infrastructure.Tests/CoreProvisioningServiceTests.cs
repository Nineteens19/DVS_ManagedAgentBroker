using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Exceptions;
using ManagedAgentBroker.Infrastructure.Configuration;
using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class CoreProvisioningServiceTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"ProvisioningTestDb_{Guid.NewGuid()}")
                .Options;

            var key = System.Text.Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Security.Cryptography.Aes256GcmDataProtectionProvider(key);

            return new ApplicationDbContext(options, dataProtectionProvider);
        }

        [Fact(DisplayName = "TriggerProvisioningAsync provisions all 4 core systems and activates ActiveTemporary")]
        public async Task TriggerProvisioning_SuccessfulFlow()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft(
                "APP-20260830-0100",
                AgentType.Individual,
                "001",
                "Head Office",
                1000000m,
                "AGENT-01");

            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "สมเกียรติ",
                LastNameTh = "มีทรัพย์",
                NationalIdOrTaxId = "1100400011223"
            });

            app.SubmitByBranch("AGENT-01");
            app.AssignToHeadOfficeReview("REVIEWER-01");
            app.ForwardToExecutiveApproval("REVIEWER-01");
            app.ProcessExecutiveApproval(true, "MD-001");

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var devesClient = new DevesMasterApiClient(
                Options.Create(new ProvisioningSettings { UseSandboxSimulators = true }),
                NullLogger<DevesMasterApiClient>.Instance);

            var emailService = new InMemoryEmailNotificationService(
                NullLogger<InMemoryEmailNotificationService>.Instance);

            var service = new CoreProvisioningService(
                db,
                devesClient,
                emailService,
                NullLogger<CoreProvisioningService>.Instance);

            var cmd = new TriggerProvisioningCommand
            {
                ApprovedCreditLimit = 1000000m,
                CommissionPercentage = 18.5m
            };

            var result = await service.TriggerProvisioningAsync(app.Id, cmd, "PREMIUM_USER_01");

            Assert.True(result.IsFullyProvisioned);
            Assert.NotEmpty(result.AgentCode);
            Assert.NotEmpty(result.SourceCode);
            Assert.Equal(4, result.Transactions.Count);
            Assert.All(result.Transactions, t => Assert.Equal(SyncStatus.Success, t.Status));

            var updatedApp = await db.AgentApplications
                .Include(a => a.SyncTransactions)
                .FirstAsync(a => a.Id == app.Id);

            Assert.Equal(ApplicationStatus.ActiveTemporary, updatedApp.Status);
            Assert.Equal(1000000m, updatedApp.ApprovedCreditLimit);
            Assert.Equal(18.5m, updatedApp.CommissionPercentage);
            Assert.Equal(4, updatedApp.SyncTransactions.Count);
            Assert.NotNull(updatedApp.Sla30DayDeadline);
            Assert.NotNull(updatedApp.Sla90DayDeadline);
        }

        [Fact(DisplayName = "TriggerProvisioningAsync fails if application is not in ReviewPremium status")]
        public async Task TriggerProvisioning_InvalidStatus_ThrowsException()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft(
                "APP-20260830-0101",
                AgentType.Individual,
                "001",
                "Head Office",
                500000m,
                "AGENT-01");

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var devesClient = new DevesMasterApiClient(
                Options.Create(new ProvisioningSettings { UseSandboxSimulators = true }),
                NullLogger<DevesMasterApiClient>.Instance);

            var emailService = new InMemoryEmailNotificationService(
                NullLogger<InMemoryEmailNotificationService>.Instance);

            var service = new CoreProvisioningService(
                db,
                devesClient,
                emailService,
                NullLogger<CoreProvisioningService>.Instance);

            var cmd = new TriggerProvisioningCommand
            {
                ApprovedCreditLimit = 500000m,
                CommissionPercentage = 15m
            };

            await Assert.ThrowsAsync<InvalidStateTransitionException>(() =>
                service.TriggerProvisioningAsync(app.Id, cmd, "PREMIUM_USER_01"));
        }

        [Fact(DisplayName = "TriggerProvisioningAsync fails if approved credit limit is zero or negative")]
        public async Task TriggerProvisioning_ZeroCreditLimit_ThrowsException()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft(
                "APP-20260830-0102",
                AgentType.Individual,
                "001",
                "Head Office",
                500000m,
                "AGENT-01");

            app.SetProfile(new AgentProfile
            {
                FirstNameTh = "สมเกียรติ",
                LastNameTh = "มีทรัพย์",
                NationalIdOrTaxId = "1100400011223"
            });

            app.SubmitByBranch("AGENT-01");
            app.AssignToHeadOfficeReview("REVIEWER-01");
            app.ForwardToExecutiveApproval("REVIEWER-01");
            app.ProcessExecutiveApproval(true, "MD-001");

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var devesClient = new DevesMasterApiClient(
                Options.Create(new ProvisioningSettings { UseSandboxSimulators = true }),
                NullLogger<DevesMasterApiClient>.Instance);

            var emailService = new InMemoryEmailNotificationService(
                NullLogger<InMemoryEmailNotificationService>.Instance);

            var service = new CoreProvisioningService(
                db,
                devesClient,
                emailService,
                NullLogger<CoreProvisioningService>.Instance);

            var cmd = new TriggerProvisioningCommand
            {
                ApprovedCreditLimit = 0m,
                CommissionPercentage = 15m
            };

            await Assert.ThrowsAsync<DomainRuleValidationException>(() =>
                service.TriggerProvisioningAsync(app.Id, cmd, "PREMIUM_USER_01"));
        }
    }
}
