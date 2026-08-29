using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Persistence.Seeding
{
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashService _passwordHashService;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(
            ApplicationDbContext context,
            IPasswordHashService passwordHashService,
            ILogger<DatabaseSeeder> logger)
        {
            _context = context;
            _passwordHashService = passwordHashService;
            _logger = logger;
        }

        public async Task SeedAsync(CancellationToken ct = default)
        {
            try
            {
                await SeedBranchesAsync(ct);
                await SeedRolesAndUsersAsync(ct);
                await SeedApplicationsAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private async Task SeedBranchesAsync(CancellationToken ct)
        {
            if (await _context.Branches.AnyAsync(ct)) return;

            _logger.LogInformation("Seeding corporate branches...");

            var branches = new List<Branch>
            {
                new() { Id = Guid.NewGuid(), BranchCode = "HQ", BranchName = "สำนักงานใหญ่", Region = "Central", Address = "123 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กทม. 10120", PhoneNumber = "02-123-4567" },
                new() { Id = Guid.NewGuid(), BranchCode = "5Q", BranchName = "สาขาอุดรธานี", Region = "Northeast", Address = "88 ถ.โพศรี ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000", PhoneNumber = "042-123-456" },
                new() { Id = Guid.NewGuid(), BranchCode = "10", BranchName = "สาขาหาดใหญ่", Region = "South", Address = "45 ถ.เพชรเกษม อ.หาดใหญ่ จ.สงขลา 90110", PhoneNumber = "074-123-456" },
                new() { Id = Guid.NewGuid(), BranchCode = "3A", BranchName = "สาขาเชียงใหม่", Region = "North", Address = "12 ถ.ห้วยแก้ว ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200", PhoneNumber = "053-123-456" },
                new() { Id = Guid.NewGuid(), BranchCode = "2B", BranchName = "สาขาชลบุรี", Region = "East", Address = "99 ถ.สุขุมวิท ต.แสนสุข อ.เมือง จ.ชลบุรี 20130", PhoneNumber = "038-123-456" }
            };

            _context.Branches.AddRange(branches);
            await _context.SaveChangesAsync(ct);
        }

        private async Task SeedRolesAndUsersAsync(CancellationToken ct)
        {
            if (await _context.Users.AnyAsync(ct)) return;

            _logger.LogInformation("Seeding roles and demo persona user accounts...");

            var roleBranch = new Role { Id = Guid.NewGuid(), Code = "ROLE_BRANCH_BU", Name = "เจ้าหน้าที่การตลาดสาขา", Description = "สร้างคำขอและจัดส่งเอกสาร" };
            var roleHo = new Role { Id = Guid.NewGuid(), Code = "ROLE_HO_BU", Name = "เจ้าหน้าที่ธุรกิจสาขา สำนักงานใหญ่", Description = "ตรวจสอบคัดกรองคำขอและ AMLO/OIC" };
            var rolePremium = new Role { Id = Guid.NewGuid(), Code = "ROLE_PREMIUM_DEPT", Name = "เจ้าหน้าที่ฝ่ายการเงินและเบี้ยประกัน", Description = "พิจารณาวงเงินสินเชื่อและส่ง Provisioning" };
            var roleLegal = new Role { Id = Guid.NewGuid(), Code = "ROLE_LEGAL_DEPT", Name = "นิติกรฝ่ายกฎหมาย", Description = "ตรวจสอบเอกสารตัวจริงและจัดเก็บเข้ากล่อง" };
            var roleMd = new Role { Id = Guid.NewGuid(), Code = "ROLE_APPROVER_MD", Name = "กรรมการผู้จัดการ (MD)", Description = "อนุมัติคำขอตัวแทนนายหน้าทางอิเล็กทรอนิกส์" };
            var roleIt = new Role { Id = Guid.NewGuid(), Code = "ROLE_IT_ADMIN", Name = "ผู้ดูแลระบบเทคโนโลยีสารสนเทศ", Description = "บริหารจัดการระบบและตรวจสอบ Audit Trail" };

            _context.Roles.AddRange(roleBranch, roleHo, rolePremium, roleLegal, roleMd, roleIt);
            await _context.SaveChangesAsync(ct);

            var defaultPasswordHash = _passwordHashService.HashPassword("P@ssword123!");

            var users = new List<User>
            {
                new() { Id = Guid.NewGuid(), Username = "branch.user", Email = "branch.user@broker-system.co.th", FullName = "สมชาย รักสาขา", BranchCode = "5Q", Department = "Branch Marketing", PasswordHash = defaultPasswordHash },
                new() { Id = Guid.NewGuid(), Username = "ho.reviewer", Email = "ho.reviewer@broker-system.co.th", FullName = "วิภาณี ตรวจสอบ", BranchCode = "HQ", Department = "Underwriting & Compliance", PasswordHash = defaultPasswordHash },
                new() { Id = Guid.NewGuid(), Username = "premium.officer", Email = "premium.officer@broker-system.co.th", FullName = "กิตติพงษ์ การเงิน", BranchCode = "HQ", Department = "Premium & Credit Control", PasswordHash = defaultPasswordHash },
                new() { Id = Guid.NewGuid(), Username = "legal.officer", Email = "legal.officer@broker-system.co.th", FullName = "ธนภัทร กฎหมาย", BranchCode = "HQ", Department = "Legal & Contract Archive", PasswordHash = defaultPasswordHash },
                new() { Id = Guid.NewGuid(), Username = "md.approver", Email = "md.approver@broker-system.co.th", FullName = "ดร. บัญชา บริหาร", BranchCode = "HQ", Department = "Executive Committee", PasswordHash = defaultPasswordHash },
                new() { Id = Guid.NewGuid(), Username = "it.admin", Email = "it.admin@broker-system.co.th", FullName = "วรวิทย์ ผู้ดูแลระบบ", BranchCode = "HQ", Department = "Information Technology", PasswordHash = defaultPasswordHash }
            };

            _context.Users.AddRange(users);
            await _context.SaveChangesAsync(ct);

            // Assign Roles
            _context.UserRoles.AddRange(
                new UserRole { UserId = users[0].Id, RoleId = roleBranch.Id },
                new UserRole { UserId = users[1].Id, RoleId = roleHo.Id },
                new UserRole { UserId = users[2].Id, RoleId = rolePremium.Id },
                new UserRole { UserId = users[3].Id, RoleId = roleLegal.Id },
                new UserRole { UserId = users[4].Id, RoleId = roleMd.Id },
                new UserRole { UserId = users[5].Id, RoleId = roleIt.Id }
            );

            await _context.SaveChangesAsync(ct);
        }

        private async Task SeedApplicationsAsync(CancellationToken ct)
        {
            if (await _context.AgentApplications.AnyAsync(ct)) return;

            _logger.LogInformation("Seeding demo agent applications...");

            // Seed Application 1: Draft from Udon Thani branch
            var app1 = AgentApplication.CreateDraft(
                "APP-20260829-0001",
                AgentType.Individual,
                "5Q",
                "สาขาอุดรธานี",
                50000m,
                "branch.user");

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
                "branch.user");

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

            app2.SubmitByBranch("branch.user");
            app2.AssignToHeadOfficeReview("ho.reviewer");
            app2.ForwardToExecutiveApproval("ho.reviewer");
            app2.ProcessExecutiveApproval(true, "md.approver", "Approved per Credit Committee guidelines.");
            app2.ApproveCreditAndTriggerProvisioning(100000m, 18.00m, "premium.officer");
            app2.ActivateProvisionalSelling("AG-2026-0088", "SRC-5590", "UE-SOUTH-01");

            _context.AgentApplications.AddRange(app1, app2);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Database seeding completed successfully.");
        }
    }
}
