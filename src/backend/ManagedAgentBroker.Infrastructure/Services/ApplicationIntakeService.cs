using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Exceptions;
using ManagedAgentBroker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class ApplicationIntakeService : IApplicationIntakeService
    {
        private readonly IApplicationDbContext _context;
        private readonly IApplicationNumberGenerator _numberGenerator;
        private readonly IFileStorageService _fileStorageService;
        private readonly ILogger<ApplicationIntakeService> _logger;

        private static readonly string[] IndividualMandatoryDocs = { "ID_CARD", "BOOK_BANK", "BROKER_LICENSE" };
        private static readonly string[] JuristicMandatoryDocs = { "COMPANY_REGISTRATION", "BOOK_BANK", "SHAREHOLDER_LIST", "DIRECTOR_ID_CARD" };

        public ApplicationIntakeService(
            IApplicationDbContext context,
            IApplicationNumberGenerator numberGenerator,
            IFileStorageService fileStorageService,
            ILogger<ApplicationIntakeService> logger)
        {
            _context = context;
            _numberGenerator = numberGenerator;
            _fileStorageService = fileStorageService;
            _logger = logger;
        }

        public async Task<AgentApplicationDto> CreateDraftAsync(
            CreateDraftApplicationCommand cmd,
            string createdBy,
            CancellationToken ct = default)
        {
            if (cmd == null)
                throw new ArgumentNullException(nameof(cmd));

            // Validate Thai National ID for individual applicants
            if (cmd.AgentType == AgentType.Individual && !string.IsNullOrWhiteSpace(cmd.Profile.NationalIdOrTaxId))
            {
                if (!ThaiNationalIdValidator.IsValid(cmd.Profile.NationalIdOrTaxId))
                {
                    throw new DomainRuleValidationException("BR-APP-03", "Invalid Thai National ID checksum for applicant.");
                }
            }

            // Validate Guarantor National ID if provided
            if (cmd.Guarantor != null && !string.IsNullOrWhiteSpace(cmd.Guarantor.NationalId))
            {
                if (!ThaiNationalIdValidator.IsValid(cmd.Guarantor.NationalId))
                {
                    throw new DomainRuleValidationException("BR-APP-04", "Invalid Thai National ID checksum for guarantor.");
                }
            }

            var appNumber = await _numberGenerator.GenerateNextApplicationNumberAsync(ct);

            var application = AgentApplication.CreateDraft(
                appNumber,
                cmd.AgentType,
                cmd.BranchCode,
                cmd.BranchName,
                cmd.RequestedCreditLimit,
                createdBy);

            application.SetCreditTerms(cmd.CreditTermMotorDays, cmd.CreditTermNonMotorDays);

            // Populate Profile
            var profile = new AgentProfile
            {
                ApplicationId = application.Id,
                TitleTh = cmd.Profile.TitleTh,
                FirstNameTh = cmd.Profile.FirstNameTh,
                LastNameTh = cmd.Profile.LastNameTh,
                NationalIdOrTaxId = cmd.Profile.NationalIdOrTaxId,
                LicenseNumber = cmd.Profile.LicenseNumber,
                LicenseExpiryDate = cmd.Profile.LicenseExpiryDate,
                PhoneNumber = cmd.Profile.PhoneNumber,
                Email = cmd.Profile.Email,
                Address = cmd.Profile.Address,
                BankName = cmd.Profile.BankName,
                BankAccountNumber = cmd.Profile.BankAccountNumber,
                BankAccountName = cmd.Profile.BankAccountName,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow
            };
            application.SetProfile(profile);

            // Populate Guarantor if provided
            if (cmd.Guarantor != null && !string.IsNullOrWhiteSpace(cmd.Guarantor.NationalId))
            {
                var guarantor = new Guarantor
                {
                    ApplicationId = application.Id,
                    TitleTh = cmd.Guarantor.TitleTh,
                    FirstNameTh = cmd.Guarantor.FirstNameTh,
                    LastNameTh = cmd.Guarantor.LastNameTh,
                    NationalId = cmd.Guarantor.NationalId,
                    Relationship = cmd.Guarantor.Relationship,
                    EmployerName = cmd.Guarantor.EmployerName,
                    Position = cmd.Guarantor.Position,
                    MonthlySalary = cmd.Guarantor.MonthlySalary,
                    ContactPhone = cmd.Guarantor.ContactPhone,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };
                application.SetGuarantor(guarantor);
            }

            // Populate Collateral if provided
            if (cmd.Collateral != null && cmd.Collateral.AppraisedValue > 0)
            {
                var collateral = new Collateral
                {
                    ApplicationId = application.Id,
                    Type = cmd.Collateral.Type,
                    DocumentRefNumber = cmd.Collateral.DocumentRefNumber,
                    AppraisedValue = cmd.Collateral.AppraisedValue,
                    Description = cmd.Collateral.Description,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };
                application.SetCollateral(collateral);
            }

            _context.AgentApplications.Add(application);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Created draft application {AppNumber} ({AppId}) by {User}",
                application.ApplicationNumber, application.Id, createdBy);

            return MapToDto(application);
        }

        public async Task<AgentApplicationDto> UpdateDraftAsync(
            Guid applicationId,
            UpdateDraftApplicationCommand cmd,
            string updatedBy,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");

            if (application.Status != ApplicationStatus.Draft && application.Status != ApplicationStatus.ReturnedForCorrection)
                throw new InvalidOperationException($"Cannot modify application in status '{application.Status}'.");

            // Validate Thai National ID for individual applicants
            if (cmd.AgentType == AgentType.Individual && !string.IsNullOrWhiteSpace(cmd.Profile.NationalIdOrTaxId))
            {
                if (!ThaiNationalIdValidator.IsValid(cmd.Profile.NationalIdOrTaxId))
                {
                    throw new DomainRuleValidationException("BR-APP-03", "Invalid Thai National ID checksum for applicant.");
                }
            }

            if (cmd.Guarantor != null && !string.IsNullOrWhiteSpace(cmd.Guarantor.NationalId))
            {
                if (!ThaiNationalIdValidator.IsValid(cmd.Guarantor.NationalId))
                {
                    throw new DomainRuleValidationException("BR-APP-04", "Invalid Thai National ID checksum for guarantor.");
                }
            }

            application.SetCreditTerms(cmd.CreditTermMotorDays, cmd.CreditTermNonMotorDays);

            // Update profile
            application.Profile.TitleTh = cmd.Profile.TitleTh;
            application.Profile.FirstNameTh = cmd.Profile.FirstNameTh;
            application.Profile.LastNameTh = cmd.Profile.LastNameTh;
            application.Profile.NationalIdOrTaxId = cmd.Profile.NationalIdOrTaxId;
            application.Profile.LicenseNumber = cmd.Profile.LicenseNumber;
            application.Profile.LicenseExpiryDate = cmd.Profile.LicenseExpiryDate;
            application.Profile.PhoneNumber = cmd.Profile.PhoneNumber;
            application.Profile.Email = cmd.Profile.Email;
            application.Profile.Address = cmd.Profile.Address;
            application.Profile.BankName = cmd.Profile.BankName;
            application.Profile.BankAccountNumber = cmd.Profile.BankAccountNumber;
            application.Profile.BankAccountName = cmd.Profile.BankAccountName;
            application.Profile.UpdatedAt = DateTime.UtcNow;
            application.Profile.UpdatedBy = updatedBy;

            // Update guarantor
            if (cmd.Guarantor != null && !string.IsNullOrWhiteSpace(cmd.Guarantor.NationalId))
            {
                if (application.Guarantor == null)
                {
                    application.SetGuarantor(new Guarantor
                    {
                        ApplicationId = application.Id,
                        CreatedBy = updatedBy,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                application.Guarantor!.TitleTh = cmd.Guarantor.TitleTh;
                application.Guarantor.FirstNameTh = cmd.Guarantor.FirstNameTh;
                application.Guarantor.LastNameTh = cmd.Guarantor.LastNameTh;
                application.Guarantor.NationalId = cmd.Guarantor.NationalId;
                application.Guarantor.Relationship = cmd.Guarantor.Relationship;
                application.Guarantor.EmployerName = cmd.Guarantor.EmployerName;
                application.Guarantor.Position = cmd.Guarantor.Position;
                application.Guarantor.MonthlySalary = cmd.Guarantor.MonthlySalary;
                application.Guarantor.ContactPhone = cmd.Guarantor.ContactPhone;
                application.Guarantor.UpdatedAt = DateTime.UtcNow;
                application.Guarantor.UpdatedBy = updatedBy;
            }

            // Update collateral
            if (cmd.Collateral != null && cmd.Collateral.AppraisedValue > 0)
            {
                if (application.Collateral == null)
                {
                    application.SetCollateral(new Collateral
                    {
                        ApplicationId = application.Id,
                        CreatedBy = updatedBy,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                application.Collateral!.Type = cmd.Collateral.Type;
                application.Collateral.DocumentRefNumber = cmd.Collateral.DocumentRefNumber;
                application.Collateral.AppraisedValue = cmd.Collateral.AppraisedValue;
                application.Collateral.Description = cmd.Collateral.Description;
                application.Collateral.UpdatedAt = DateTime.UtcNow;
                application.Collateral.UpdatedBy = updatedBy;
            }

            await _context.SaveChangesAsync(ct);
            return MapToDto(application);
        }

        public async Task<AgentApplicationDto?> GetByIdAsync(Guid applicationId, CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            return application == null ? null : MapToDto(application);
        }

        public async Task<AttachmentDto> UploadAttachmentAsync(
            Guid applicationId,
            UploadAttachmentCommand cmd,
            string uploadedBy,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Attachments)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");

            if (application.Status != ApplicationStatus.Draft && application.Status != ApplicationStatus.ReturnedForCorrection)
                throw new InvalidOperationException($"Cannot attach documents to application in status '{application.Status}'.");

            var (storagePath, hashSha256, fileSizeBytes) = await _fileStorageService.SaveFileAsync(
                cmd.ContentStream,
                cmd.FileName,
                applicationId,
                cmd.ContentType,
                ct);

            var attachment = new ApplicationAttachment
            {
                Id = Guid.NewGuid(),
                ApplicationId = applicationId,
                DocumentType = cmd.DocumentType.ToUpperInvariant(),
                FileName = cmd.FileName,
                FilePath = storagePath,
                ContentType = cmd.ContentType,
                FileSizeBytes = fileSizeBytes,
                FileHashSha256 = hashSha256,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = uploadedBy
            };

            _context.ApplicationAttachments.Add(attachment);
            await _context.SaveChangesAsync(ct);

            return new AttachmentDto
            {
                Id = attachment.Id,
                ApplicationId = attachment.ApplicationId,
                DocumentType = attachment.DocumentType,
                FileName = attachment.FileName,
                ContentType = attachment.ContentType,
                FileSizeBytes = attachment.FileSizeBytes,
                FileHashSha256 = attachment.FileHashSha256,
                CreatedAt = attachment.CreatedAt,
                CreatedBy = attachment.CreatedBy
            };
        }

        public async Task<bool> DeleteAttachmentAsync(
            Guid applicationId,
            Guid attachmentId,
            string deletedBy,
            CancellationToken ct = default)
        {
            var attachment = await _context.ApplicationAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId && a.ApplicationId == applicationId, ct);

            if (attachment == null)
                return false;

            attachment.IsDeleted = true;
            attachment.DeletedAt = DateTime.UtcNow;
            attachment.DeletedBy = deletedBy;

            await _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<AgentApplicationDto> SubmitByBranchAsync(
            Guid applicationId,
            string userId,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");

            // Mandatory attachments checklist verification
            var activeDocs = application.Attachments
                .Where(a => !a.IsDeleted)
                .Select(a => a.DocumentType.ToUpperInvariant())
                .ToHashSet();

            var requiredDocs = application.AgentType == AgentType.Individual
                ? IndividualMandatoryDocs
                : JuristicMandatoryDocs;

            var missingDocs = requiredDocs.Where(d => !activeDocs.Contains(d)).ToList();
            if (missingDocs.Any())
            {
                throw new DomainRuleValidationException("BR-DOC-01",
                    $"Missing mandatory attachments for submission: {string.Join(", ", missingDocs)}");
            }

            application.SubmitByBranch(userId);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Application {AppNumber} submitted by branch user {User}",
                application.ApplicationNumber, userId);

            return MapToDto(application);
        }

        public async Task<AgentApplicationDto> ReturnForCorrectionAsync(
            Guid applicationId,
            ReturnForCorrectionCommand cmd,
            string reviewerId,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");

            var items = cmd.Items.Select(i => new RejectChecklistItem
            {
                ApplicationId = applicationId,
                Category = i.Category,
                Description = i.Description,
                IsResolved = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = reviewerId
            }).ToList();

            application.ReturnForCorrection(items, reviewerId);
            await _context.SaveChangesAsync(ct);

            _logger.LogWarning("Application {AppNumber} returned for correction with {Count} deficiencies by {User}",
                application.ApplicationNumber, items.Count, reviewerId);

            return MapToDto(application);
        }

        public async Task<AgentApplicationDto> ResubmitAsync(
            Guid applicationId,
            ResubmitApplicationCommand cmd,
            string userId,
            CancellationToken ct = default)
        {
            var application = await _context.AgentApplications
                .Include(a => a.Profile)
                .Include(a => a.Guarantor)
                .Include(a => a.Collateral)
                .Include(a => a.Attachments)
                .Include(a => a.RejectChecklistItems)
                .FirstOrDefaultAsync(a => a.Id == applicationId, ct);

            if (application == null)
                throw new KeyNotFoundException($"Application with ID '{applicationId}' was not found.");

            if (application.Status != ApplicationStatus.ReturnedForCorrection)
                throw new InvalidOperationException($"Cannot resubmit application in status '{application.Status}'.");

            // Mark resolved items
            foreach (var item in application.RejectChecklistItems)
            {
                if (cmd.ResolvedItemIds.Contains(item.Id))
                {
                    item.IsResolved = true;
                    item.ResolvedAt = DateTime.UtcNow;
                }
            }

            var unresolvedCount = application.RejectChecklistItems.Count(i => !i.IsResolved);
            if (unresolvedCount > 0)
            {
                throw new DomainRuleValidationException("BR-APP-05",
                    $"Cannot resubmit application: {unresolvedCount} deficiency items remain unresolved.");
            }

            application.SubmitByBranch(userId);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Application {AppNumber} successfully resubmitted by {User}",
                application.ApplicationNumber, userId);

            return MapToDto(application);
        }

        private static AgentApplicationDto MapToDto(AgentApplication app)
        {
            return new AgentApplicationDto
            {
                Id = app.Id,
                ApplicationNumber = app.ApplicationNumber,
                Status = app.Status,
                AgentType = app.AgentType,
                BranchCode = app.BranchCode,
                BranchName = app.BranchName,
                HandlerCode = app.HandlerCode,
                RequestedCreditLimit = app.RequestedCreditLimit,
                ApprovedCreditLimit = app.ApprovedCreditLimit,
                CreditTermMotorDays = app.CreditTermMotorDays,
                CreditTermNonMotorDays = app.CreditTermNonMotorDays,
                AgentCode = app.AgentCode,
                SourceCode = app.SourceCode,
                UnitExecutiveCode = app.UnitExecutiveCode,
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
