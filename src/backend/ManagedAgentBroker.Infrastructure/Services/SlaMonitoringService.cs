using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Persistence;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class SlaMonitoringService : ISlaMonitoringService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IEmailNotificationService _emailService;
        private readonly ILogger<SlaMonitoringService> _logger;

        public SlaMonitoringService(
            ApplicationDbContext dbContext,
            IEmailNotificationService emailService,
            ILogger<SlaMonitoringService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SlaDaemonExecutionReport> ExecuteSlaSweepAsync(CancellationToken ct = default)
        {
            var report = new SlaDaemonExecutionReport
            {
                ExecutionStartedAt = DateTime.UtcNow
            };

            _logger.LogInformation("Starting SLA Monitoring Sweep at {Time} UTC", report.ExecutionStartedAt);

            var now = DateTime.UtcNow;

            // 1. Scan ActiveTemporary Applications for 30-Day SLA
            var activeTempApps = await _dbContext.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.ComplianceRecord)
                .Include(a => a.PhysicalContractRecord)
                .Where(a => a.Status == ApplicationStatus.ActiveTemporary)
                .ToListAsync(ct);

            report.ApplicationsScanned += activeTempApps.Count;

            foreach (var app in activeTempApps)
            {
                if (app.PhysicalContractRecord != null && 
                    app.PhysicalContractRecord.Status == PhysicalContractStatus.Archived)
                {
                    // Physical contract is already archived; skip suspension
                    continue;
                }

                if (app.Sla30DayDeadline.HasValue && now >= app.Sla30DayDeadline.Value)
                {
                    // SLA 30 Days Breached -> Auto Suspend
                    _logger.LogWarning(
                        "30-Day SLA BREACH detected for App: {AppNumber} (AgentCode: {AgentCode}). Deadline: {Deadline}. Triggering auto-suspension.",
                        app.ApplicationNumber, app.AgentCode, app.Sla30DayDeadline);

                    app.TriggerAutoSuspension("30-Day SLA breach: Missing original hard-copy contract documents", "SLA_DAEMON");
                    report.AutoSuspensionsTriggered++;
                    report.AffectedApplicationNumbers.Add(app.ApplicationNumber);

                    // Dispatch suspension alert email
                    await DispatchSlaEmailAsync(
                        app.Profile?.Email,
                        $"[แจ้งเตือนด่วน] ระงับสิทธิ์การส่งงานชั่วคราว (30-Day SLA): {app.AgentCode}",
                        $@"<h2>แจ้งระงับสิทธิ์การส่งงานตัวแทนชั่วคราว (Auto-Suspended 30 Days)</h2>
                           <p>เรียน คุณ {app.Profile?.FullNameTh},</p>
                           <p>เนื่องจากใบสมัครเลขที่ <strong>{app.ApplicationNumber}</strong> (รหัสตัวแทน: <strong>{app.AgentCode}</strong>) ครบกำหนดระยะเวลาผ่อนผัน 30 วันแล้ว แต่ยังไม่ได้รับเอกสารสัญญาตัวจริงที่ฝ่ายกฎหมาย</p>
                           <p><span style='color:red;'><strong>ระบบได้ทำการระงับสิทธิ์การคีย์งานและออกกรมธรรม์ชั่วคราวแล้ว</strong></span></p>
                           <p>หากท่านจัดส่งเอกสารและฝ่ายกฎหมายตรวจรับเรียบร้อยแล้ว ระบบจะปลดการระงับและเปิดสิทธิ์ถาวร (Active Permanent) ทันที</p>");
                }
                else if (app.Sla30DayDeadline.HasValue)
                {
                    var daysRemaining = (app.Sla30DayDeadline.Value.Date - now.Date).Days;
                    if (daysRemaining == 7 || daysRemaining == 3 || daysRemaining == 1)
                    {
                        report.WarningsDispatched++;
                        _logger.LogInformation(
                            "Dispatching early warning alert for App: {AppNumber}. {Days} days remaining before 30-Day SLA deadline.",
                            app.ApplicationNumber, daysRemaining);

                        await DispatchSlaEmailAsync(
                            app.Profile?.Email,
                            $"[แจ้งเตือน] อีก {daysRemaining} วันจะครบกำหนดส่งเอกสารสัญญาตัวจริง: {app.AgentCode}",
                            $@"<h2>แจ้งเตือนกำหนดส่งเอกสารสัญญาตัวจริง (เหลืออีก {daysRemaining} วัน)</h2>
                               <p>เรียน คุณ {app.Profile?.FullNameTh},</p>
                               <p>ใบสมัครเลขที่ <strong>{app.ApplicationNumber}</strong> (รหัสตัวแทน: <strong>{app.AgentCode}</strong>) มีกำหนดส่งเอกสารสัญญาตัวจริงภายในวันที่ <strong>{app.Sla30DayDeadline:dd/MM/yyyy}</strong></p>
                               <p>กรุณาเร่งจัดส่งเอกสารฉบับจริงพร้อมหลักประกันมายังฝ่ายกฎหมายก่อนครบกำหนด เพื่อป้องกันการถูกระงับสิทธิ์การส่งงานอัตโนมัติ</p>");
                    }
                }
            }

            // 2. Scan Suspended30D Applications for 90-Day SLA
            var suspendedApps = await _dbContext.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.ComplianceRecord)
                .Include(a => a.PhysicalContractRecord)
                .Where(a => a.Status == ApplicationStatus.Suspended30D)
                .ToListAsync(ct);

            report.ApplicationsScanned += suspendedApps.Count;

            foreach (var app in suspendedApps)
            {
                if (app.PhysicalContractRecord != null && 
                    app.PhysicalContractRecord.Status == PhysicalContractStatus.Archived)
                {
                    continue;
                }

                if (app.Sla90DayDeadline.HasValue && now >= app.Sla90DayDeadline.Value)
                {
                    // SLA 90 Days Breached -> Auto Terminate
                    _logger.LogError(
                        "90-Day SLA BREACH detected for App: {AppNumber} (AgentCode: {AgentCode}). Deadline: {Deadline}. Triggering permanent termination.",
                        app.ApplicationNumber, app.AgentCode, app.Sla90DayDeadline);

                    app.TriggerAutoTermination("90-Day SLA expiration: Document non-compliance", "SLA_DAEMON");
                    report.AutoTerminationsTriggered++;
                    report.AffectedApplicationNumbers.Add(app.ApplicationNumber);

                    // Dispatch permanent termination alert email
                    await DispatchSlaEmailAsync(
                        app.Profile?.Email,
                        $"[แจ้งเตือน] ปิดรหัสตัวแทนถาวร (90-Day SLA Expiration): {app.AgentCode}",
                        $@"<h2>แจ้งปิดรหัสตัวแทนถาวร (Terminated 90 Days)</h2>
                           <p>เรียน คุณ {app.Profile?.FullNameTh},</p>
                           <p>เนื่องจากใบสมัครเลขที่ <strong>{app.ApplicationNumber}</strong> (รหัสตัวแทน: <strong>{app.AgentCode}</strong>) พ้นกำหนดระยะเวลาสิ้นสุด 90 วันโดยไม่ได้รับเอกสารสัญญาตัวจริง</p>
                           <p><span style='color:red;'><strong>ระบบได้ดำเนินการปิดรหัสและยกเลิกสิทธิ์ตัวแทนถาวรเรียบร้อยแล้ว</strong></span></p>");
                }
            }

            await _dbContext.SaveChangesAsync(ct);

            report.ExecutionCompletedAt = DateTime.UtcNow;
            _logger.LogInformation(
                "SLA Monitoring Sweep completed in {Duration} ms. Scanned: {Scanned}, Warnings: {Warn}, Suspended: {Susp}, Terminated: {Term}",
                (report.ExecutionCompletedAt - report.ExecutionStartedAt).TotalMilliseconds,
                report.ApplicationsScanned,
                report.WarningsDispatched,
                report.AutoSuspensionsTriggered,
                report.AutoTerminationsTriggered);

            return report;
        }

        private async Task DispatchSlaEmailAsync(string? recipientEmail, string subject, string htmlContent)
        {
            try
            {
                var recipient = !string.IsNullOrWhiteSpace(recipientEmail)
                    ? recipientEmail
                    : "branch-ops@deves.co.th";

                var emailMsg = new EmailNotificationMessage
                {
                    RecipientEmail = recipient,
                    Subject = subject,
                    HtmlBody = htmlContent
                };

                await _emailService.SendAsync(emailMsg, CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to dispatch SLA notification email for {Subject}", subject);
            }
        }
    }
}
