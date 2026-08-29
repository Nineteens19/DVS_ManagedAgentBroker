using System;
using System.Text;
using System.Threading.Tasks;
using FsCheck;
using FsCheck.Xunit;
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
    public class ComplianceScreeningPbtTests
    {
        private static ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var key = Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Aes256GcmDataProtectionProvider(key);
            return new ApplicationDbContext(options, dataProtectionProvider);
        }

        [Property(MaxTest = 50)]
        public Property Pbt05_AmloDesignated_Always_Yields_HardStop_Ineligibility(NonEmptyString randomSuffix)
        {
            var nationalId = "999" + (randomSuffix.Get.Length > 10 ? randomSuffix.Get[..10] : randomSuffix.Get);
            using var context = CreateInMemoryDbContext();
            var service = new ComplianceScreeningService(context, NullLogger<ComplianceScreeningService>.Instance);

            var app = AgentApplication.CreateDraft(
                "APP-TEST-999",
                AgentType.Individual,
                "B01",
                "Test Branch",
                50000m,
                "tester");
            context.AgentApplications.Add(app);
            context.SaveChanges();

            var result = service.CheckComplianceAsync(app.Id, nationalId).GetAwaiter().GetResult();

            var isDesignated = result.AmloStatus == AmloStatus.RejectedDesignated;
            var isRed = result.OicStatus == OicStatus.Red;
            var isNotEligible = !result.IsEligibleForApproval;

            return (isDesignated && isRed && isNotEligible).ToProperty();
        }

        [Property(MaxTest = 50)]
        public Property Pbt05_Pep_Always_Yields_RequiresDirectorApproval_And_Eligible(NonEmptyString randomSuffix)
        {
            var nationalId = "888" + (randomSuffix.Get.Length > 10 ? randomSuffix.Get[..10] : randomSuffix.Get);
            using var context = CreateInMemoryDbContext();
            var service = new ComplianceScreeningService(context, NullLogger<ComplianceScreeningService>.Instance);

            var app = AgentApplication.CreateDraft(
                "APP-TEST-888",
                AgentType.Individual,
                "B01",
                "Test Branch",
                50000m,
                "tester");
            context.AgentApplications.Add(app);
            context.SaveChanges();

            var result = service.CheckComplianceAsync(app.Id, nationalId).GetAwaiter().GetResult();

            var isPep = result.AmloStatus == AmloStatus.FlaggedPep;
            var requiresDirector = result.RequiresDirectorApproval;
            var isEligible = result.IsEligibleForApproval;

            return (isPep && requiresDirector && isEligible).ToProperty();
        }

        [Property(MaxTest = 50)]
        public Property Pbt05_StandardId_Always_Yields_Clear_Green_Eligible(NonEmptyString randomSuffix)
        {
            // Ensure does not start with 999, 888, 777
            var suffix = randomSuffix.Get.Replace("9", "1").Replace("8", "2").Replace("7", "3");
            var nationalId = "1100" + (suffix.Length > 9 ? suffix[..9] : suffix);
            using var context = CreateInMemoryDbContext();
            var service = new ComplianceScreeningService(context, NullLogger<ComplianceScreeningService>.Instance);

            var app = AgentApplication.CreateDraft(
                "APP-TEST-CLEAN",
                AgentType.Individual,
                "B01",
                "Test Branch",
                50000m,
                "tester");
            context.AgentApplications.Add(app);
            context.SaveChanges();

            var result = service.CheckComplianceAsync(app.Id, nationalId).GetAwaiter().GetResult();

            var isClear = result.AmloStatus == AmloStatus.Passed;
            var isGreen = result.OicStatus == OicStatus.Green;
            var isEligible = result.IsEligibleForApproval;
            var noDirectorReq = !result.RequiresDirectorApproval;

            return (isClear && isGreen && isEligible && noDirectorReq).ToProperty();
        }
    }
}
