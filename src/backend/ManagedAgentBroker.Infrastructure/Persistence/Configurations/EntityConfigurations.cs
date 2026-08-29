using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ManagedAgentBroker.Infrastructure.Persistence.Configurations
{
    public class AgentApplicationConfiguration : IEntityTypeConfiguration<AgentApplication>
    {
        public void Configure(EntityTypeBuilder<AgentApplication> builder)
        {
            builder.ToTable("AgentApplications");
            builder.HasKey(e => e.Id);

            builder.Property<byte[]>("RowVersion")
                .IsRowVersion();

            builder.Property(e => e.ApplicationNumber)
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(e => e.BranchCode).HasMaxLength(20).IsRequired();
            builder.Property(e => e.BranchName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.HandlerCode).HasMaxLength(50);
            builder.Property(e => e.AgentCode).HasMaxLength(30);
            builder.Property(e => e.SourceCode).HasMaxLength(30);
            builder.Property(e => e.UnitExecutiveCode).HasMaxLength(30);

            builder.Property(e => e.RequestedCreditLimit).HasPrecision(18, 2);
            builder.Property(e => e.ApprovedCreditLimit).HasPrecision(18, 2);
            builder.Property(e => e.CommissionPercentage).HasPrecision(5, 2);

            builder.HasIndex(e => e.ApplicationNumber).IsUnique();
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => e.BranchCode);
            builder.HasIndex(e => e.Sla30DayDeadline);
            builder.HasIndex(e => e.Sla90DayDeadline);

            builder.HasOne(e => e.Profile)
                .WithOne(p => p.Application)
                .HasForeignKey<AgentProfile>(p => p.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Guarantor)
                .WithOne(g => g.Application)
                .HasForeignKey<Guarantor>(g => g.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Collateral)
                .WithOne(c => c.Application)
                .HasForeignKey<Collateral>(c => c.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.ComplianceRecord)
                .WithOne(c => c.Application)
                .HasForeignKey<ComplianceRecord>(c => c.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.PhysicalContractRecord)
                .WithOne(p => p.Application)
                .HasForeignKey<PhysicalContractRecord>(p => p.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Attachments)
                .WithOne(a => a.Application)
                .HasForeignKey(a => a.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.RejectChecklistItems)
                .WithOne(r => r.Application)
                .HasForeignKey(r => r.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.SyncTransactions)
                .WithOne(s => s.Application)
                .HasForeignKey(s => s.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class AgentProfileConfiguration : IEntityTypeConfiguration<AgentProfile>
    {
        private readonly Aes256GcmValueConverter _encryptionConverter;

        public AgentProfileConfiguration(Aes256GcmValueConverter encryptionConverter)
        {
            _encryptionConverter = encryptionConverter;
        }

        public void Configure(EntityTypeBuilder<AgentProfile> builder)
        {
            builder.ToTable("AgentProfiles");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.TitleTh).HasMaxLength(30);
            builder.Property(e => e.FirstNameTh).HasMaxLength(100).IsRequired();
            builder.Property(e => e.LastNameTh).HasMaxLength(100).IsRequired();

            // PII Encrypted at Rest
            builder.Property(e => e.NationalIdOrTaxId)
                .HasMaxLength(255)
                .HasConversion(_encryptionConverter)
                .IsRequired();

            builder.Property(e => e.BankAccountNumber)
                .HasMaxLength(255)
                .HasConversion(_encryptionConverter);

            builder.Property(e => e.LicenseNumber).HasMaxLength(50);
            builder.Property(e => e.PhoneNumber).HasMaxLength(30);
            builder.Property(e => e.Email).HasMaxLength(100);
            builder.Property(e => e.Address).HasMaxLength(500);
            builder.Property(e => e.BankName).HasMaxLength(100);
            builder.Property(e => e.BankAccountName).HasMaxLength(150);
        }
    }

    public class GuarantorConfiguration : IEntityTypeConfiguration<Guarantor>
    {
        private readonly Aes256GcmValueConverter _encryptionConverter;

        public GuarantorConfiguration(Aes256GcmValueConverter encryptionConverter)
        {
            _encryptionConverter = encryptionConverter;
        }

        public void Configure(EntityTypeBuilder<Guarantor> builder)
        {
            builder.ToTable("Guarantors");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.TitleTh).HasMaxLength(30);
            builder.Property(e => e.FirstNameTh).HasMaxLength(100).IsRequired();
            builder.Property(e => e.LastNameTh).HasMaxLength(100).IsRequired();

            // PII Encrypted at Rest
            builder.Property(e => e.NationalId)
                .HasMaxLength(255)
                .HasConversion(_encryptionConverter)
                .IsRequired();

            builder.Property(e => e.Relationship).HasMaxLength(50);
            builder.Property(e => e.EmployerName).HasMaxLength(150);
            builder.Property(e => e.Position).HasMaxLength(100);
            builder.Property(e => e.ContactPhone).HasMaxLength(30);
            builder.Property(e => e.MonthlySalary).HasPrecision(18, 2);
        }
    }
}
