using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FsCheck;
using FsCheck.Xunit;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Configuration;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class DevesMasterAndProvisioningPbtTests
    {
        private readonly DevesMasterApiClient _client;

        public DevesMasterAndProvisioningPbtTests()
        {
            var options = Options.Create(new ProvisioningSettings { UseSandboxSimulators = true });
            _client = new DevesMasterApiClient(options, NullLogger<DevesMasterApiClient>.Instance);
        }

        [Property(DisplayName = "PBT-06.1: Individual applicants must receive AgentCode with format AG{YYYY}{5-digits}")]
        public Property PBT_06_1_IndividualAgentCodeFormat()
        {
            return Prop.ForAll(
                Arb.Default.NonNull<string>().Filter(s => !string.IsNullOrWhiteSpace(s.Item)),
                Arb.Default.NonNull<string>().Filter(s => !string.IsNullOrWhiteSpace(s.Item)),
                (nationalId, branch) =>
                {
                    var cmd = new GenerateAgentCodesCommand
                    {
                        ApplicationId = Guid.NewGuid(),
                        AgentType = AgentType.Individual,
                        BranchCode = branch.Item,
                        NationalIdOrTaxId = nationalId.Item,
                        FullNameTh = "นาย สมชาย มั่งมี"
                    };

                    var result = _client.GenerateCodesAsync(cmd).GetAwaiter().GetResult();

                    var pattern = @"^AG\d{4}\d{5}$";
                    return Regex.IsMatch(result.AgentCode, pattern)
                        && result.SourceCode.StartsWith($"SRC-B{branch.Item.Trim()}-")
                        && result.MasterReferenceTransactionId.StartsWith("DM-TXN-");
                });
        }

        [Property(DisplayName = "PBT-06.2: Corporate applicants must receive AgentCode with format BR{YYYY}{5-digits}")]
        public Property PBT_06_2_CorporateAgentCodeFormat()
        {
            return Prop.ForAll(
                Arb.Default.NonNull<string>().Filter(s => !string.IsNullOrWhiteSpace(s.Item)),
                Arb.Default.NonNull<string>().Filter(s => !string.IsNullOrWhiteSpace(s.Item)),
                (taxId, branch) =>
                {
                    var cmd = new GenerateAgentCodesCommand
                    {
                        ApplicationId = Guid.NewGuid(),
                        AgentType = AgentType.Corporate,
                        BranchCode = branch.Item,
                        NationalIdOrTaxId = taxId.Item,
                        FullNameTh = "บริษัท ดีเวส โบรกเกอร์ จำกัด"
                    };

                    var result = _client.GenerateCodesAsync(cmd).GetAwaiter().GetResult();

                    var pattern = @"^BR\d{4}\d{5}$";
                    return Regex.IsMatch(result.AgentCode, pattern)
                        && result.SourceCode.StartsWith($"SRC-B{branch.Item.Trim()}-")
                        && result.MasterReferenceTransactionId.StartsWith("DM-TXN-");
                });
        }

        [Fact(DisplayName = "PBT-06.3: Provisional selling rights inception strictly sets 30-day and 90-day SLA deadlines")]
        public void PBT_06_3_ProvisionalSellingSlaDeadlines()
        {
            var app = AgentApplication.CreateDraft(
                "APP-20260830-0001",
                AgentType.Individual,
                "001",
                "Bangkok Head Office",
                500000m,
                "USER-001");

            app.SetProfile(new AgentProfile
            {
                TitleTh = "นาย",
                FirstNameTh = "สมชาย",
                LastNameTh = "ใจดี",
                NationalIdOrTaxId = "1100400011223"
            });

            app.SubmitByBranch("USER-001");
            app.AssignToHeadOfficeReview("REVIEWER-01");
            app.ForwardToExecutiveApproval("REVIEWER-01");
            app.ProcessExecutiveApproval(true, "MD-001");
            app.ApproveCreditAndTriggerProvisioning(500000m, 15.0m, "PREMIUM-01");

            var before = DateTime.UtcNow.Date;
            app.ActivateProvisionalSelling("AG202600001", "SRC-B001-0001", "UE-B001-01");
            var after = DateTime.UtcNow.Date;

            Assert.Equal(ApplicationStatus.ActiveTemporary, app.Status);
            Assert.NotNull(app.ProvisionalSellingActivatedAt);
            Assert.NotNull(app.Sla30DayDeadline);
            Assert.NotNull(app.Sla90DayDeadline);

            Assert.InRange(app.Sla30DayDeadline.Value.Date, before.AddDays(30), after.AddDays(30));
            Assert.InRange(app.Sla90DayDeadline.Value.Date, before.AddDays(90), after.AddDays(90));
        }
    }
}
