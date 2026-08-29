using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
    public class ApprovalWorkflowService : IApprovalWorkflowService
    {
        private readonly ApplicationDbContext _context;
        private readonly IComplianceScreeningService _complianceService;
        private readonly IEmailNotificationService _emailService;
        private readonly ILogger<ApprovalWorkflowService> _logger;

        public ApprovalWorkflowService(
            ApplicationDbContext context,
            IComplianceScreeningService complianceService,
            IEmailNotificationService emailService,
            ILogger<ApprovalWorkflowService> logger)
        {
            _context = context;
            _complianceService = complianceService;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AgentApplicationDto> ForwardToExecutiveAsync(
            Guid applicationId,
            ForwardToExecutiveCommand cmd,
            string forwardedByUserId,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .Include(a => a.ComplianceRecord)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
            {
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");
            }

            if (application.Status != ApplicationStatus.SubmittedBranch &&
                application.Status != ApplicationStatus.ReviewHeadOffice)
            {
                throw new InvalidOperationException(
                    $"Cannot forward application {application.ApplicationNumber} in status '{application.Status}' to executive approval.");
            }

            // Run / verify compliance screening if not yet screened
            if ((application.ComplianceRecord == null || application.ComplianceRecord.AmloStatus == AmloStatus.Pending) && application.Profile != null)
            {
                var checkResult = await _complianceService.CheckComplianceAsync(application.Id, application.Profile.NationalIdOrTaxId, ct);
                if (!checkResult.IsEligibleForApproval)
                {
                    throw new InvalidOperationException(
                        $"Cannot forward application {application.ApplicationNumber} due to critical compliance violations (AMLO: {checkResult.AmloStatus}, OIC: {checkResult.OicStatus}).");
                }
            }

            if (application.ComplianceRecord != null)
            {
                if (application.ComplianceRecord.AmloStatus == AmloStatus.RejectedDesignated ||
                    application.ComplianceRecord.OicStatus == OicStatus.Red)
                {
                    throw new InvalidOperationException(
                        $"Cannot forward application {application.ApplicationNumber} due to critical compliance violations (AMLO: {application.ComplianceRecord.AmloStatus}, OIC: {application.ComplianceRecord.OicStatus}).");
                }
            }

            if (application.Status == ApplicationStatus.SubmittedBranch)
            {
                application.AssignToHeadOfficeReview(forwardedByUserId);
            }

            application.ForwardToExecutiveApproval(forwardedByUserId);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation(
                "Application {AppNumber} forwarded to executive approval by {User}",
                application.ApplicationNumber, forwardedByUserId);

            // Dispatch Email Notification to Approvers
            var applicantName = application.Profile != null
                ? $"{application.Profile.FirstNameTh} {application.Profile.LastNameTh}"
                : "Applicant";

            var notification = new EmailNotificationMessage
            {
                RecipientEmail = "approver.md@insurance-broker.com",
                RecipientName = "Executive Committee / Managing Director",
                Subject = $"[Action Required] Pending Executive Approval: {application.ApplicationNumber} - {applicantName}",
                HtmlBody = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                        <h2 style='color: #1e3a8a;'>Agent Application Awaiting Approval</h2>
                        <p>Application <strong>{application.ApplicationNumber}</strong> has been submitted for your review.</p>
                        <table style='border-collapse: collapse; width: 100%; margin: 15px 0;'>
                            <tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Applicant:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>{applicantName}</td></tr>
                            <tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Type:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>{application.AgentType}</td></tr>
                            <tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Branch:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>{application.BranchName} ({application.BranchCode})</td></tr>
                            <tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Requested Limit:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>฿{application.RequestedCreditLimit:N2}</td></tr>
                            <tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Requires Director:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>{(application.ComplianceRecord?.RequiresDirectorApproval == true ? "YES (PEP/Orange Flagged)" : "Standard")}</td></tr>
                        </table>
                        <p>Please log in to the Agent & Broker Portal to review and execute approval decision.</p>
                    </div>",
                PlainTextBody = $"Application {application.ApplicationNumber} for {applicantName} (Branch: {application.BranchName}) is awaiting your executive approval."
            };

            await _emailService.SendAsync(notification, ct);

            return MapToDto(application);
        }

        public async Task<AgentApplicationDto> ProcessDecisionAsync(
            Guid applicationId,
            ProcessApprovalDecisionCommand cmd,
            string approverUserId,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .Include(a => a.ComplianceRecord)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
            {
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");
            }

            if (application.Status != ApplicationStatus.PendingExecutiveApproval)
            {
                throw new InvalidOperationException(
                    $"Cannot process approval decision for application {application.ApplicationNumber} in status '{application.Status}'. Expected 'PendingExecutiveApproval'.");
            }

            var applicantName = application.Profile != null
                ? $"{application.Profile.FirstNameTh} {application.Profile.LastNameTh}"
                : "Applicant";

            application.ProcessExecutiveApproval(cmd.IsApproved, approverUserId, cmd.DecisionNotes);
            await _context.SaveChangesAsync(ct);

            if (cmd.IsApproved)
            {
                _logger.LogInformation(
                    "Application {AppNumber} APPROVED by executive {User}. Status transitioned to ReviewPremium.",
                    application.ApplicationNumber, approverUserId);

                // Dispatch Email Notification of Approval
                var approvalEmail = new EmailNotificationMessage
                {
                    RecipientEmail = "branch.bu@insurance-broker.com",
                    RecipientName = $"{application.BranchName} Team",
                    Subject = $"[Approved] Agent Application Approved: {application.ApplicationNumber} - {applicantName}",
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                            <h2 style='color: #15803d;'>Application Approved by Executive</h2>
                            <p>Application <strong>{application.ApplicationNumber}</strong> has been approved by executive <strong>{approverUserId}</strong>.</p>
                            <p><strong>Approved Credit Limit:</strong> ฿{application.RequestedCreditLimit:N2}</p>
                            <p><strong>Decision Notes:</strong> {cmd.DecisionNotes ?? "None"}</p>
                            <p>Status transitioned to <strong>ReviewPremium</strong>. Automatic Core System provisioning will proceed.</p>
                        </div>",
                    PlainTextBody = $"Application {application.ApplicationNumber} has been approved by {approverUserId}. Status: ReviewPremium."
                };

                await _emailService.SendAsync(approvalEmail, ct);
            }
            else
            {
                _logger.LogWarning(
                    "Application {AppNumber} REJECTED by executive {User}. Status transitioned to ExecutiveRejected.",
                    application.ApplicationNumber, approverUserId);

                // Dispatch Email Notification of Rejection
                var rejectionEmail = new EmailNotificationMessage
                {
                    RecipientEmail = "branch.bu@insurance-broker.com",
                    RecipientName = $"{application.BranchName} Team",
                    Subject = $"[Rejected] Agent Application Rejected: {application.ApplicationNumber} - {applicantName}",
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                            <h2 style='color: #b91c1c;'>Application Rejected by Executive</h2>
                            <p>Application <strong>{application.ApplicationNumber}</strong> was rejected by executive <strong>{approverUserId}</strong>.</p>
                            <p><strong>Rejection Reason:</strong> {cmd.DecisionNotes ?? "Unspecified"}</p>
                        </div>",
                    PlainTextBody = $"Application {application.ApplicationNumber} was rejected by executive {approverUserId}. Reason: {cmd.DecisionNotes}"
                };

                await _emailService.SendAsync(rejectionEmail, ct);
            }

            return MapToDto(application);
        }

        private static AgentApplicationDto MapToDto(AgentApplication app)
        {
            return new AgentApplicationDto
            {
                Id = app.Id,
                ApplicationNumber = app.ApplicationNumber,
                AgentType = app.AgentType,
                Status = app.Status,
                BranchCode = app.BranchCode,
                BranchName = app.BranchName,
                HandlerCode = app.HandlerCode,
                AgentCode = app.AgentCode,
                SourceCode = app.SourceCode,
                UnitExecutiveCode = app.UnitExecutiveCode,
                RequestedCreditLimit = app.RequestedCreditLimit,
                ApprovedCreditLimit = app.ApprovedCreditLimit,
                CommissionPercentage = app.CommissionPercentage,
                ProvisionalSellingActivatedAt = app.ProvisionalSellingActivatedAt,
                Sla30DayDeadline = app.Sla30DayDeadline,
                Sla90DayDeadline = app.Sla90DayDeadline,
                SuspendedAt = app.SuspendedAt,
                SuspensionReason = app.SuspensionReason,
                CreatedAt = app.CreatedAt,
                CreatedBy = app.CreatedBy,
                UpdatedAt = app.UpdatedAt,
                UpdatedBy = app.UpdatedBy,
                Profile = new AgentProfileDto
                {
                    TitleTh = app.Profile?.TitleTh ?? string.Empty,
                    FirstNameTh = app.Profile?.FirstNameTh ?? string.Empty,
                    LastNameTh = app.Profile?.LastNameTh ?? string.Empty,
                    NationalIdOrTaxId = app.Profile?.NationalIdOrTaxId ?? string.Empty,
                    LicenseNumber = app.Profile?.LicenseNumber,
                    LicenseExpiryDate = app.Profile?.LicenseExpiryDate,
                    PhoneNumber = app.Profile?.PhoneNumber ?? string.Empty,
                    Email = app.Profile?.Email ?? string.Empty,
                    Address = app.Profile?.Address ?? string.Empty,
                    BankName = app.Profile?.BankName ?? string.Empty,
                    BankAccountNumber = app.Profile?.BankAccountNumber ?? string.Empty,
                    BankAccountName = app.Profile?.BankAccountName ?? string.Empty
                },
                Guarantor = app.Guarantor == null ? null : new GuarantorDto
                {
                    TitleTh = app.Guarantor.TitleTh,
                    FirstNameTh = app.Guarantor.FirstNameTh,
                    LastNameTh = app.Guarantor.LastNameTh,
                    NationalId = app.Guarantor.NationalId,
                    Relationship = app.Guarantor.Relationship,
                    EmployerName = app.Guarantor.EmployerName,
                    Position = app.Guarantor.Position,
                    MonthlySalary = app.Guarantor.MonthlySalary,
                    ContactPhone = app.Guarantor.ContactPhone
                },
                Collateral = app.Collateral == null ? null : new CollateralDto
                {
                    Type = app.Collateral.Type,
                    DocumentRefNumber = app.Collateral.DocumentRefNumber,
                    AppraisedValue = app.Collateral.AppraisedValue,
                    Description = app.Collateral.Description
                },
                Attachments = app.Attachments?.Where(a => !a.IsDeleted).Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    ApplicationId = a.ApplicationId,
                    DocumentType = a.DocumentType,
                    FileName = a.FileName,
                    ContentType = a.ContentType,
                    FileSizeBytes = a.FileSizeBytes,
                    FileHashSha256 = a.FileHashSha256,
                    CreatedAt = a.CreatedAt,
                    CreatedBy = a.CreatedBy
                }).ToList() ?? new List<AttachmentDto>(),
                RejectChecklistItems = app.RejectChecklistItems?.Select(r => new RejectChecklistItemDto
                {
                    Id = r.Id,
                    Category = r.Category,
                    Description = r.Description,
                    IsResolved = r.IsResolved,
                    ResolvedAt = r.ResolvedAt
                }).ToList() ?? new List<RejectChecklistItemDto>()
            };
        }
    }
}
