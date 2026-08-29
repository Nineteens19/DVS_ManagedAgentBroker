using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Exceptions;
using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class ApplicationIntakeServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly IApplicationNumberGenerator _numberGenerator;
        private readonly IFileStorageService _fileStorageService;
        private readonly ApplicationIntakeService _service;
        private readonly string _tempStoragePath;

        public ApplicationIntakeServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var key = Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Aes256GcmDataProtectionProvider(key);
            _context = new ApplicationDbContext(options, dataProtectionProvider);

            _numberGenerator = new ApplicationNumberGenerator(_context);

            _tempStoragePath = Path.Combine(Path.GetTempPath(), "mab_test_storage_" + Guid.NewGuid().ToString("N"));
            var inMemoryConfig = new Dictionary<string, string?>
            {
                { "Storage:BasePath", _tempStoragePath }
            };
            var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();

            var signatureValidator = new FileSignatureValidator();
            _fileStorageService = new LocalDiskFileStorageService(config, signatureValidator, NullLogger<LocalDiskFileStorageService>.Instance);

            _service = new ApplicationIntakeService(
                _context,
                _numberGenerator,
                _fileStorageService,
                NullLogger<ApplicationIntakeService>.Instance);
        }

        public void Dispose()
        {
            _context.Dispose();
            if (Directory.Exists(_tempStoragePath))
            {
                try { Directory.Delete(_tempStoragePath, true); } catch { /* ignore */ }
            }
        }

        private static string GenerateValidThaiId()
        {
            var random = new Random();
            var digits = new char[12];
            for (int i = 0; i < 12; i++)
            {
                digits[i] = (char)('0' + random.Next(0, 10));
            }
            var twelveStr = new string(digits);
            int checkDigit = ThaiNationalIdValidator.CalculateCheckDigit(twelveStr);
            return $"{twelveStr}{checkDigit}";
        }

        [Fact]
        public async Task CreateDraftAsync_WithValidData_ShouldCreateDraftApplication()
        {
            var validId = GenerateValidThaiId();
            var cmd = new CreateDraftApplicationCommand
            {
                AgentType = AgentType.Individual,
                BranchCode = "5Q",
                BranchName = "สาขาอุดรธานี",
                RequestedCreditLimit = 50000m,
                CreditTermMotorDays = 30,
                CreditTermNonMotorDays = 45,
                Profile = new AgentProfileDto
                {
                    TitleTh = "นาย",
                    FirstNameTh = "สมชาย",
                    LastNameTh = "ใจดี",
                    NationalIdOrTaxId = validId,
                    PhoneNumber = "0812345678",
                    Email = "somchai@example.com",
                    Address = "123 ถ.มิตรภาพ อุดรธานี",
                    BankName = "KBANK",
                    BankAccountNumber = "1234567890",
                    BankAccountName = "นาย สมชาย ใจดี"
                }
            };

            var result = await _service.CreateDraftAsync(cmd, "branch.user");

            result.Should().NotBeNull();
            result.ApplicationNumber.Should().StartWith("APP-");
            result.Status.Should().Be(ApplicationStatus.Draft);
            result.Profile.NationalIdOrTaxId.Should().Be(validId);
            result.RequestedCreditLimit.Should().Be(50000m);
        }

        [Fact]
        public async Task CreateDraftAsync_WithInvalidThaiId_ShouldThrowValidationException()
        {
            var cmd = new CreateDraftApplicationCommand
            {
                AgentType = AgentType.Individual,
                BranchCode = "5Q",
                BranchName = "สาขาอุดรธานี",
                RequestedCreditLimit = 50000m,
                Profile = new AgentProfileDto
                {
                    TitleTh = "นาย",
                    FirstNameTh = "สมชาย",
                    LastNameTh = "ใจดี",
                    NationalIdOrTaxId = "1234567890123", // invalid checksum
                    PhoneNumber = "0812345678"
                }
            };

            var act = () => _service.CreateDraftAsync(cmd, "branch.user");
            await act.Should().ThrowAsync<DomainRuleValidationException>()
                .WithMessage("*Invalid Thai National ID checksum*");
        }

        [Fact]
        public async Task UploadAttachmentAsync_WithValidPdf_ShouldSaveAndRecordAttachment()
        {
            var draft = await _service.CreateDraftAsync(new CreateDraftApplicationCommand
            {
                AgentType = AgentType.Individual,
                BranchCode = "5Q",
                BranchName = "สาขาอุดรธานี",
                RequestedCreditLimit = 50000m,
                Profile = new AgentProfileDto { NationalIdOrTaxId = GenerateValidThaiId() }
            }, "branch.user");

            var pdfBytes = Encoding.ASCII.GetBytes("%PDF-1.4 sample PDF document content");
            using var stream = new MemoryStream(pdfBytes);

            var uploadCmd = new UploadAttachmentCommand
            {
                DocumentType = "ID_CARD",
                FileName = "citizen_id.pdf",
                ContentType = "application/pdf",
                ContentStream = stream
            };

            var attachment = await _service.UploadAttachmentAsync(draft.Id, uploadCmd, "branch.user");

            attachment.Should().NotBeNull();
            attachment.DocumentType.Should().Be("ID_CARD");
            attachment.FileSizeBytes.Should().Be(pdfBytes.Length);
            attachment.FileHashSha256.Should().NotBeNullOrWhiteSpace();
        }

        [Fact]
        public async Task SubmitByBranchAsync_WithoutMandatoryDocs_ShouldThrowValidationException()
        {
            var draft = await _service.CreateDraftAsync(new CreateDraftApplicationCommand
            {
                AgentType = AgentType.Individual,
                BranchCode = "5Q",
                BranchName = "สาขาอุดรธานี",
                RequestedCreditLimit = 50000m,
                Profile = new AgentProfileDto { NationalIdOrTaxId = GenerateValidThaiId() }
            }, "branch.user");

            var act = () => _service.SubmitByBranchAsync(draft.Id, "branch.user");
            await act.Should().ThrowAsync<DomainRuleValidationException>()
                .WithMessage("*Missing mandatory attachments*");
        }

        [Fact]
        public async Task SubmitByBranchAsync_WithAllMandatoryDocs_ShouldSucceed()
        {
            var draft = await _service.CreateDraftAsync(new CreateDraftApplicationCommand
            {
                AgentType = AgentType.Individual,
                BranchCode = "5Q",
                BranchName = "สาขาอุดรธานี",
                RequestedCreditLimit = 50000m,
                Profile = new AgentProfileDto { NationalIdOrTaxId = GenerateValidThaiId() }
            }, "branch.user");

            // Upload 3 mandatory docs: ID_CARD, BOOK_BANK, BROKER_LICENSE
            foreach (var docType in new[] { "ID_CARD", "BOOK_BANK", "BROKER_LICENSE" })
            {
                var pdfBytes = Encoding.ASCII.GetBytes("%PDF-1.4 sample content for " + docType);
                using var stream = new MemoryStream(pdfBytes);
                await _service.UploadAttachmentAsync(draft.Id, new UploadAttachmentCommand
                {
                    DocumentType = docType,
                    FileName = $"{docType}.pdf",
                    ContentType = "application/pdf",
                    ContentStream = stream
                }, "branch.user");
            }

            var submitted = await _service.SubmitByBranchAsync(draft.Id, "branch.user");
            submitted.Status.Should().Be(ApplicationStatus.SubmittedBranch);
        }

        [Fact]
        public async Task ReturnForCorrection_And_Resubmit_Workflow_ShouldFunctionCorrectly()
        {
            var draft = await _service.CreateDraftAsync(new CreateDraftApplicationCommand
            {
                AgentType = AgentType.Individual,
                BranchCode = "5Q",
                BranchName = "สาขาอุดรธานี",
                RequestedCreditLimit = 50000m,
                Profile = new AgentProfileDto { NationalIdOrTaxId = GenerateValidThaiId() }
            }, "branch.user");

            foreach (var docType in new[] { "ID_CARD", "BOOK_BANK", "BROKER_LICENSE" })
            {
                var pdfBytes = Encoding.ASCII.GetBytes("%PDF-1.4 sample content for " + docType);
                using var stream = new MemoryStream(pdfBytes);
                await _service.UploadAttachmentAsync(draft.Id, new UploadAttachmentCommand
                {
                    DocumentType = docType,
                    FileName = $"{docType}.pdf",
                    ContentType = "application/pdf",
                    ContentStream = stream
                }, "branch.user");
            }

            await _service.SubmitByBranchAsync(draft.Id, "branch.user");

            // Return for correction
            var returnCmd = new ReturnForCorrectionCommand
            {
                Items = new List<RejectChecklistItemDto>
                {
                    new() { Category = "DocumentMissing", Description = "Book bank copy is blurred." }
                }
            };
            var returnedApp = await _service.ReturnForCorrectionAsync(draft.Id, returnCmd, "ho.reviewer");
            returnedApp.Status.Should().Be(ApplicationStatus.ReturnedForCorrection);
            returnedApp.RejectChecklistItems.Should().HaveCount(1);

            var itemId = returnedApp.RejectChecklistItems[0].Id;

            // Attempt to resubmit without resolving item -> Fail
            var actUnresolved = () => _service.ResubmitAsync(draft.Id, new ResubmitApplicationCommand(), "branch.user");
            await actUnresolved.Should().ThrowAsync<DomainRuleValidationException>()
                .WithMessage("*deficiency items remain unresolved*");

            // Resubmit with resolved item -> Succeed
            var resubmitCmd = new ResubmitApplicationCommand
            {
                ResolvedItemIds = new List<Guid> { itemId },
                ResubmissionNotes = "Re-uploaded clear copy."
            };
            var resubmitted = await _service.ResubmitAsync(draft.Id, resubmitCmd, "branch.user");
            resubmitted.Status.Should().Be(ApplicationStatus.SubmittedBranch);
        }
    }
}
