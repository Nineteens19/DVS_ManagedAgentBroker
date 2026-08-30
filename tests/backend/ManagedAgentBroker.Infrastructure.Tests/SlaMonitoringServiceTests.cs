using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class SlaMonitoringServiceTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"SlaTestDb_{Guid.NewGuid()}")
                .Options;

            var key = System.Text.Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Security.Cryptography.Aes256GcmDataProtectionProvider(key);

            return new ApplicationDbContext(options, dataProtectionProvider);
        }

        private void SetPrivateProperty(object target, string propertyName, object value)
        {
            var prop = target.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
            if (prop != null && prop.CanWrite)
            {
                prop.SetValue(target, value);
            }
            else
            {
                var field = target.GetType().GetField($"<{propertyName}>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance);
                field?.SetValue(target, value);
            }
        }

        [Fact(DisplayName = "SlaMonitoringService auto-suspends application after 30 days without physical contract")]
        public async Task SlaSweep_AutoSuspends_After30Days()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0200", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            app.SetProfile(new AgentProfile { FirstNameTh = "สมชาย", LastNameTh = "ใจดี", NationalIdOrTaxId = "1100400011223" });
            app.SubmitByBranch("AGENT");
            app.AssignToHeadOfficeReview("REVIEWER");
            app.ForwardToExecutiveApproval("REVIEWER");
            app.ProcessExecutiveApproval(true, "MD");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15m, "PREMIUM");
            app.ActivateProvisionalSelling("AG202600010", "SRC-B001-0010", "UE-B001-01");

            // Simulate SLA 30 days exceeded (Deadline was yesterday)
            SetPrivateProperty(app, nameof(AgentApplication.Sla30DayDeadline), DateTime.UtcNow.AddDays(-1));

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var slaService = new SlaMonitoringService(db, emailService, NullLogger<SlaMonitoringService>.Instance);

            var report = await slaService.ExecuteSlaSweepAsync();

            Assert.Equal(1, report.ApplicationsScanned);
            Assert.Equal(1, report.AutoSuspensionsTriggered);
            Assert.Contains(app.ApplicationNumber, report.AffectedApplicationNumbers);

            var updatedApp = await db.AgentApplications.FirstAsync(a => a.Id == app.Id);
            Assert.Equal(ApplicationStatus.Suspended30D, updatedApp.Status);
            Assert.NotNull(updatedApp.SuspendedAt);
            Assert.NotNull(updatedApp.SuspensionReason);
        }

        [Fact(DisplayName = "SlaMonitoringService exempts applications whose physical contract is already archived")]
        public async Task SlaSweep_Exempts_ArchivedContract()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0201", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            app.SetProfile(new AgentProfile { FirstNameTh = "สมชาย", LastNameTh = "ใจดี", NationalIdOrTaxId = "1100400011223" });
            app.SubmitByBranch("AGENT");
            app.AssignToHeadOfficeReview("REVIEWER");
            app.ForwardToExecutiveApproval("REVIEWER");
            app.ProcessExecutiveApproval(true, "MD");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15m, "PREMIUM");
            app.ActivateProvisionalSelling("AG202600011", "SRC-B001-0011", "UE-B001-01");

            SetPrivateProperty(app, nameof(AgentApplication.Sla30DayDeadline), DateTime.UtcNow.AddDays(-1));
            app.PhysicalContractRecord.Status = PhysicalContractStatus.Archived;

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var slaService = new SlaMonitoringService(db, emailService, NullLogger<SlaMonitoringService>.Instance);

            var report = await slaService.ExecuteSlaSweepAsync();

            Assert.Equal(1, report.ApplicationsScanned);
            Assert.Equal(0, report.AutoSuspensionsTriggered);

            var updatedApp = await db.AgentApplications.FirstAsync(a => a.Id == app.Id);
            Assert.Equal(ApplicationStatus.ActiveTemporary, updatedApp.Status);
        }

        [Fact(DisplayName = "SlaMonitoringService auto-terminates suspended application after 90 days")]
        public async Task SlaSweep_AutoTerminates_After90Days()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0202", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            app.SetProfile(new AgentProfile { FirstNameTh = "สมชาย", LastNameTh = "ใจดี", NationalIdOrTaxId = "1100400011223" });
            app.SubmitByBranch("AGENT");
            app.AssignToHeadOfficeReview("REVIEWER");
            app.ForwardToExecutiveApproval("REVIEWER");
            app.ProcessExecutiveApproval(true, "MD");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15m, "PREMIUM");
            app.ActivateProvisionalSelling("AG202600012", "SRC-B001-0012", "UE-B001-01");
            app.TriggerAutoSuspension("30-Day SLA breach");

            // Simulate SLA 90 days exceeded (Deadline was yesterday)
            SetPrivateProperty(app, nameof(AgentApplication.Sla90DayDeadline), DateTime.UtcNow.AddDays(-1));

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var slaService = new SlaMonitoringService(db, emailService, NullLogger<SlaMonitoringService>.Instance);

            var report = await slaService.ExecuteSlaSweepAsync();

            Assert.Equal(1, report.ApplicationsScanned);
            Assert.Equal(1, report.AutoTerminationsTriggered);
            Assert.Contains(app.ApplicationNumber, report.AffectedApplicationNumbers);

            var updatedApp = await db.AgentApplications.FirstAsync(a => a.Id == app.Id);
            Assert.Equal(ApplicationStatus.Terminated90D, updatedApp.Status);
        }

        [Fact(DisplayName = "SlaMonitoringService dispatches early warning alerts at 7 days before 30-day deadline")]
        public async Task SlaSweep_DispatchesWarning_At7Days()
        {
            using var db = CreateDbContext();
            var app = AgentApplication.CreateDraft("APP-20260830-0203", AgentType.Individual, "001", "HQ", 500000m, "AGENT");
            app.SetProfile(new AgentProfile { FirstNameTh = "สมชาย", LastNameTh = "ใจดี", NationalIdOrTaxId = "1100400011223" });
            app.SubmitByBranch("AGENT");
            app.AssignToHeadOfficeReview("REVIEWER");
            app.ForwardToExecutiveApproval("REVIEWER");
            app.ProcessExecutiveApproval(true, "MD");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15m, "PREMIUM");
            app.ActivateProvisionalSelling("AG202600013", "SRC-B001-0013", "UE-B001-01");

            // Exactly 7 days remaining
            SetPrivateProperty(app, nameof(AgentApplication.Sla30DayDeadline), DateTime.UtcNow.Date.AddDays(7));

            db.AgentApplications.Add(app);
            await db.SaveChangesAsync();

            var emailService = new InMemoryEmailNotificationService(NullLogger<InMemoryEmailNotificationService>.Instance);
            var slaService = new SlaMonitoringService(db, emailService, NullLogger<SlaMonitoringService>.Instance);

            var report = await slaService.ExecuteSlaSweepAsync();

            Assert.Equal(1, report.ApplicationsScanned);
            Assert.Equal(1, report.WarningsDispatched);
            Assert.Equal(0, report.AutoSuspensionsTriggered);

            var updatedApp = await db.AgentApplications.FirstAsync(a => a.Id == app.Id);
            Assert.Equal(ApplicationStatus.ActiveTemporary, updatedApp.Status);
        }
    }
}
