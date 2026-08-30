using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Exceptions;
using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class HardCopyArchiveServiceTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"ArchiveTestDb_{Guid.NewGuid()}")
                .Options;

            var key = System.Text.Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Security.Cryptography.Aes256GcmDataProtectionProvider(key);

            return new ApplicationDbContext(options, dataProtectionProvider);
        }

        [Fact(DisplayName = "ArchivePhysicalContractAsync upgrades ActiveTemporary to ActivePermanent and saves box number")]
        public async Task ArchivePhysicalContract_ActiveTemporary_TransitionsTo_ActivePermanent()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0300", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            app.SetProfile(new AgentProfile { FirstNameTh = "สมชาย", LastNameTh = "ใจดี", NationalIdOrTaxId = "1100400011223" });
            app.SubmitByBranch("AGENT");
            app.AssignToHeadOfficeReview("REVIEWER");
            app.ForwardToExecutiveApproval("REVIEWER");
            app.ProcessExecutiveApproval(true, "MD");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15m, "PREMIUM");
            app.ActivateProvisionalSelling("AG202600020", "SRC-B001-0020", "UE-B001-01");

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var service = new HardCopyArchiveService(db, emailService, NullLogger<HardCopyArchiveService>.Instance);

            var cmd = new ArchivePhysicalContractCommand
            {
                ArchiveBoxNumber = "BOX-2026-HQ-001",
                LegalAuditorNotes = "Verified ID card copy and signed contract."
            };

            var result = await service.ArchivePhysicalContractAsync(app.Id, cmd, "LEGAL_AUDITOR_01");

            Assert.Equal(PhysicalContractStatus.Archived, result.Status);
            Assert.Equal("BOX-2026-HQ-001", result.ArchiveBoxNumber);
            Assert.NotNull(result.ReceivedAtLegalAt);

            var updatedApp = await db.AgentApplications
                .Include(a => a.PhysicalContractRecord)
                .FirstAsync(a => a.Id == app.Id);

            Assert.Equal(ApplicationStatus.ActivePermanent, updatedApp.Status);
            Assert.Equal(PhysicalContractStatus.Archived, updatedApp.PhysicalContractRecord.Status);
            Assert.Equal("BOX-2026-HQ-001", updatedApp.PhysicalContractRecord.ArchiveBoxNumber);
        }

        [Fact(DisplayName = "ArchivePhysicalContractAsync upgrades Suspended30D to ActivePermanent and clears suspension")]
        public async Task ArchivePhysicalContract_Suspended30D_TransitionsTo_ActivePermanent()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0301", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            app.SetProfile(new AgentProfile { FirstNameTh = "สมชาย", LastNameTh = "ใจดี", NationalIdOrTaxId = "1100400011223" });
            app.SubmitByBranch("AGENT");
            app.AssignToHeadOfficeReview("REVIEWER");
            app.ForwardToExecutiveApproval("REVIEWER");
            app.ProcessExecutiveApproval(true, "MD");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15m, "PREMIUM");
            app.ActivateProvisionalSelling("AG202600021", "SRC-B001-0021", "UE-B001-01");
            app.TriggerAutoSuspension("30-Day SLA breach");

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var service = new HardCopyArchiveService(db, emailService, NullLogger<HardCopyArchiveService>.Instance);

            var cmd = new ArchivePhysicalContractCommand
            {
                ArchiveBoxNumber = "BOX-2026-HQ-002",
                LegalAuditorNotes = "Hard copies received after suspension. Restoring active permanent rights."
            };

            var result = await service.ArchivePhysicalContractAsync(app.Id, cmd, "LEGAL_AUDITOR_01");

            Assert.Equal(PhysicalContractStatus.Archived, result.Status);

            var updatedApp = await db.AgentApplications.FirstAsync(a => a.Id == app.Id);
            Assert.Equal(ApplicationStatus.ActivePermanent, updatedApp.Status);
            Assert.Null(updatedApp.SuspendedAt);
            Assert.Null(updatedApp.SuspensionReason);
        }

        [Fact(DisplayName = "ArchivePhysicalContractAsync throws DomainRuleValidationException if archive box number is missing")]
        public async Task ArchivePhysicalContract_MissingBoxNumber_ThrowsException()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0302", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var service = new HardCopyArchiveService(db, emailService, NullLogger<HardCopyArchiveService>.Instance);

            var cmd = new ArchivePhysicalContractCommand
            {
                ArchiveBoxNumber = "   "
            };

            await Assert.ThrowsAsync<DomainRuleValidationException>(() =>
                service.ArchivePhysicalContractAsync(app.Id, cmd, "LEGAL_AUDITOR_01"));
        }
    }
}
