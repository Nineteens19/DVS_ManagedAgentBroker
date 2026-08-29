using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class ComplianceScreeningService : IComplianceScreeningService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ComplianceScreeningService> _logger;

        public ComplianceScreeningService(
            ApplicationDbContext context,
            ILogger<ComplianceScreeningService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ComplianceCheckResultDto> CheckComplianceAsync(
            Guid applicationId,
            string nationalIdOrTaxId,
            CancellationToken ct = default)
        {
            _logger.LogInformation("Starting compliance screening for application {AppId}", applicationId);

            var application = await _context.AgentApplications
                .Include(a => a.ComplianceRecord)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
            {
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");
            }

            var now = DateTime.UtcNow;
            AmloStatus amloStatus;
            string amloRemarks;
            string amloRef = $"AMLO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            OicStatus oicStatus;
            string oicRemarks;
            string oicRef = $"OIC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            // Deterministic Sandbox Evaluation Heuristics
            if (!string.IsNullOrEmpty(nationalIdOrTaxId) && nationalIdOrTaxId.StartsWith("999"))
            {
                amloStatus = AmloStatus.RejectedDesignated;
                amloRemarks = "Match found in AMLO Designated Sanction List.";

                oicStatus = OicStatus.Red;
                oicRemarks = "Match found in OIC Agent/Broker Blacklist database.";
            }
            else if (!string.IsNullOrEmpty(nationalIdOrTaxId) && nationalIdOrTaxId.StartsWith("888"))
            {
                amloStatus = AmloStatus.FlaggedPep;
                amloRemarks = "Identified as Politically Exposed Person (PEP). Escalated director review required.";

                oicStatus = OicStatus.Green;
                oicRemarks = "Valid OIC broker license with good standing.";
            }
            else if (!string.IsNullOrEmpty(nationalIdOrTaxId) && nationalIdOrTaxId.StartsWith("777"))
            {
                amloStatus = AmloStatus.Passed;
                amloRemarks = "No record found in AMLO sanction databases.";

                oicStatus = OicStatus.Orange;
                oicRemarks = "Broker license expiring within 30 days. Action required prior to full activation.";
            }
            else
            {
                amloStatus = AmloStatus.Passed;
                amloRemarks = "No AMLO sanction record found.";

                oicStatus = OicStatus.Green;
                oicRemarks = "Valid OIC broker license verified.";
            }

            if (application.ComplianceRecord == null)
            {
                var record = new ComplianceRecord
                {
                    ApplicationId = applicationId,
                    AmloStatus = amloStatus,
                    AmloCheckedAt = now,
                    AmloReferenceId = amloRef,
                    OicStatus = oicStatus,
                    OicCheckedAt = now,
                    OicReferenceId = oicRef
                };

                _context.ComplianceRecords.Add(record);
            }
            else
            {
                application.ComplianceRecord.AmloStatus = amloStatus;
                application.ComplianceRecord.AmloCheckedAt = now;
                application.ComplianceRecord.AmloReferenceId = amloRef;
                application.ComplianceRecord.OicStatus = oicStatus;
                application.ComplianceRecord.OicCheckedAt = now;
                application.ComplianceRecord.OicReferenceId = oicRef;
            }

            await _context.SaveChangesAsync(ct);

            var requiresDirector = amloStatus == AmloStatus.FlaggedPep || oicStatus == OicStatus.Orange;

            _logger.LogInformation(
                "Compliance screening complete for {AppId}: AMLO={Amlo}, OIC={Oic}, RequiresDirectorApproval={ReqDir}",
                applicationId, amloStatus, oicStatus, requiresDirector);

            return new ComplianceCheckResultDto
            {
                ApplicationId = applicationId,
                AmloStatus = amloStatus,
                AmloCheckedAt = now,
                AmloReferenceId = amloRef,
                AmloRemarks = amloRemarks,
                OicStatus = oicStatus,
                OicCheckedAt = now,
                OicReferenceId = oicRef,
                OicRemarks = oicRemarks
            };
        }
    }
}
