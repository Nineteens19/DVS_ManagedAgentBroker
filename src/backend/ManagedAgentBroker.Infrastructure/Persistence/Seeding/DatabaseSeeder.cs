using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Persistence.Seeding
{
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync(CancellationToken ct = default)
        {
            try
            {
                if (await _context.AgentApplications.AnyAsync(ct))
                {
                    _logger.LogInformation("Database already contains records. Skipping seed.");
                    return;
                }

                _logger.LogInformation("Seeding initial demo agent applications...");

                // Seed Application 1: Draft from Udon Thani branch
                var app1 = AgentApplication.CreateDraft(
                    "APP-20260829-0001",
                    AgentType.Individual,
                    "5Q",
                    "สาขาอุดรธานี",
                    50000m,
                    "USER_BRANCH_UDON");

                app1.SetProfile(new AgentProfile
                {
                    TitleTh = "นางสาว",
                    FirstNameTh = "กรรณิการ์",
                    LastNameTh = "ลอดคำทุย",
                    NationalIdOrTaxId = "1410100123456",
                    LicenseNumber = "6204012345",
                    PhoneNumber = "0812345678",
                    Email = "kannika.l@broker-sample.com",
                    Address = "123 หมู่ 4 ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000",
                    BankName = "ธนาคารกสิกรไทย",
                    BankAccountNumber = "123-4-56789-0",
                    BankAccountName = "นางสาว กรรณิการ์ ลอดคำทุย"
                });

                app1.SetGuarantor(new Guarantor
                {
                    TitleTh = "นาย",
                    FirstNameTh = "สมชาย",
                    LastNameTh = "ลอดคำทุย",
                    NationalId = "3410100987654",
                    Relationship = "บิดา",
                    EmployerName = "บจก. อุดรการค้า",
                    Position = "ผู้จัดการฝ่ายขาย",
                    MonthlySalary = 35000m,
                    ContactPhone = "0898765432"
                });

                app1.SetCreditTerms(30, 45);

                // Seed Application 2: Active Temporary with provisional selling rights active
                var app2 = AgentApplication.CreateDraft(
                    "APP-20260825-0002",
                    AgentType.Individual,
                    "10",
                    "สาขาหาดใหญ่",
                    100000m,
                    "USER_BRANCH_HATYAI");

                app2.SetProfile(new AgentProfile
                {
                    TitleTh = "นาย",
                    FirstNameTh = "ปรีชา",
                    LastNameTh = "มั่นคง",
                    NationalIdOrTaxId = "1900100456789",
                    LicenseNumber = "6404098765",
                    PhoneNumber = "0865432109",
                    Email = "preecha.m@broker-sample.com",
                    Address = "45/2 ถ.เพชรเกษม อ.หาดใหญ่ จ.สงขลา 90110",
                    BankName = "ธนาคารไทยพาณิชย์",
                    BankAccountNumber = "987-6-54321-0",
                    BankAccountName = "นาย ปรีชา มั่นคง"
                });

                app2.SubmitByBranch("USER_BRANCH_HATYAI");
                app2.AssignToHeadOfficeReview("USER_HO_REVIEWER");
                app2.ForwardToExecutiveApproval("USER_HO_REVIEWER");
                app2.ProcessExecutiveApproval(true, "USER_DIRECTOR_MD", "Approved per Credit Committee guidelines.");
                app2.ApproveCreditAndTriggerProvisioning(100000m, 18.00m, "USER_PREMIUM_OFFICER");
                app2.ActivateProvisionalSelling("AG-2026-0088", "SRC-5590", "UE-SOUTH-01");

                _context.AgentApplications.AddRange(app1, app2);
                await _context.SaveChangesAsync(ct);

                _logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }
    }
}
