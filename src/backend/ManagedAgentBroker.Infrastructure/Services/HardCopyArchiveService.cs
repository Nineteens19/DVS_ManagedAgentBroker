using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Exceptions;
using ManagedAgentBroker.Infrastructure.Persistence;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class HardCopyArchiveService : IHardCopyArchiveService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IEmailNotificationService _emailService;
        private readonly ILogger<HardCopyArchiveService> _logger;

        public HardCopyArchiveService(
            ApplicationDbContext dbContext,
            IEmailNotificationService emailService,
            ILogger<HardCopyArchiveService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PhysicalContractRecordDto> ArchivePhysicalContractAsync(
            Guid applicationId,
            ArchivePhysicalContractCommand cmd,
            string auditorUserId,
            CancellationToken ct = default)
        {
            if (cmd == null)
                throw new ArgumentNullException(nameof(cmd));

            if (string.IsNullOrWhiteSpace(cmd.ArchiveBoxNumber))
                throw new DomainRuleValidationException("BR-ARCH-02", "Archive Box Number is mandatory for legal physical document archiving.");

            var application = await _dbContext.AgentApplications
                .Include(a => a.PhysicalContractRecord)
                .Include(a => a.ComplianceRecord)
                .Include(a => a.Profile)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
            {
                throw new EntityNotFoundException(nameof(AgentApplication), applicationId);
            }

            _logger.LogInformation(
                "Archiving physical hard-copy contract for App: {AppNumber} (Box: {BoxNumber}) by Auditor: {AuditorId}",
                application.ApplicationNumber, cmd.ArchiveBoxNumber, auditorUserId);

            application.PhysicalContractRecord.LegalAuditorNotes = cmd.LegalAuditorNotes;

            // Transition status to ActivePermanent & update PhysicalContractRecord to Archived
            application.VerifyAndArchiveHardCopy(cmd.ArchiveBoxNumber, auditorUserId);

            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation(
                "Physical contract archived successfully. App: {AppNumber} is now ActivePermanent.",
                application.ApplicationNumber);

            // Send non-blocking confirmation email
            _ = Task.Run(async () =>
            {
                try
                {
                    var recipient = !string.IsNullOrWhiteSpace(application.Profile?.Email)
                        ? application.Profile.Email
                        : "branch-ops@deves.co.th";

                    var emailMsg = new EmailNotificationMessage
                    {
                        RecipientEmail = recipient,
                        RecipientName = application.Profile?.FullNameTh ?? string.Empty,
                        Subject = $"[ระบบตัวแทน] เอกสารสัญญาผ่านการตรวจสอบและเปิดสิทธิ์ถาวร (Active Permanent): {application.AgentCode}",
                        HtmlBody = $@"
                            <h2>แจ้งผลการตรวจรับเอกสารสัญญาตัวจริงและเปิดสิทธิ์ถาวร (Active Permanent)</h2>
                            <p>เรียน คุณ {application.Profile?.FullNameTh},</p>
                            <p>ฝ่ายกฎหมายได้ทำการตรวจสอบเอกสารสัญญาฉบับจริงและหลักประกันของใบสมัครเลขที่ <strong>{application.ApplicationNumber}</strong> (รหัสตัวแทน: <strong>{application.AgentCode}</strong>) ครบถ้วนถูกต้องแล้ว</p>
                            <ul>
                                <li><strong>สถานะตัวแทน:</strong> เปิดสิทธิ์ขายถาวร (Active Permanent)</li>
                                <li><strong>เลขที่กล่องจัดเก็บเอกสาร:</strong> {cmd.ArchiveBoxNumber}</li>
                                <li><strong>วันที่ตรวจรับเอกสาร:</strong> {DateTime.UtcNow:dd/MM/yyyy HH:mm} น.</li>
                            </ul>
                            <p>ขอบคุณที่ร่วมงานกับเรา</p>"
                    };

                    await _emailService.SendAsync(emailMsg, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to dispatch permanent activation email for App: {AppNumber}", application.ApplicationNumber);
                }
            }, CancellationToken.None);

            return new PhysicalContractRecordDto
            {
                Id = application.PhysicalContractRecord.Id,
                ApplicationId = application.Id,
                Status = application.PhysicalContractRecord.Status,
                DispatchedFromBranchAt = application.PhysicalContractRecord.DispatchedFromBranchAt,
                ReceivedAtLegalAt = application.PhysicalContractRecord.ReceivedAtLegalAt,
                ArchiveBoxNumber = application.PhysicalContractRecord.ArchiveBoxNumber,
                LegalAuditorNotes = application.PhysicalContractRecord.LegalAuditorNotes
            };
        }
    }
}
