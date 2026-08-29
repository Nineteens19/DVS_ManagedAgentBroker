using ManagedAgentBroker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ManagedAgentBroker.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Username).HasMaxLength(50).IsRequired();
            builder.Property(e => e.Email).HasMaxLength(100).IsRequired();
            builder.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.BranchCode).HasMaxLength(20).IsRequired();
            builder.Property(e => e.Department).HasMaxLength(100);
            builder.Property(e => e.PasswordHash).HasMaxLength(255);
            builder.Property(e => e.SsoSubjectId).HasMaxLength(100);

            builder.HasIndex(e => e.Username).IsUnique();
            builder.HasIndex(e => e.Email).IsUnique();
            builder.HasIndex(e => e.BranchCode);

            builder.HasMany(e => e.UserRoles)
                .WithOne(ur => ur.User)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.RefreshTokens)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("Roles");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Code).HasMaxLength(50).IsRequired();
            builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
            builder.Property(e => e.Description).HasMaxLength(255);

            builder.HasIndex(e => e.Code).IsUnique();

            builder.HasMany(e => e.UserRoles)
                .WithOne(ur => ur.Role)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            builder.ToTable("UserRoles");
            builder.HasKey(e => new { e.UserId, e.RoleId });

            builder.Property(e => e.AssignedBy).HasMaxLength(50);
        }
    }

    public class BranchConfiguration : IEntityTypeConfiguration<Branch>
    {
        public void Configure(EntityTypeBuilder<Branch> builder)
        {
            builder.ToTable("Branches");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.BranchCode).HasMaxLength(20).IsRequired();
            builder.Property(e => e.BranchName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.Region).HasMaxLength(50);
            builder.Property(e => e.Address).HasMaxLength(255);
            builder.Property(e => e.PhoneNumber).HasMaxLength(30);

            builder.HasIndex(e => e.BranchCode).IsUnique();

            builder.HasMany(e => e.Users)
                .WithOne(u => u.Branch)
                .HasPrincipalKey(b => b.BranchCode)
                .HasForeignKey(u => u.BranchCode)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.TokenHash).HasMaxLength(128).IsRequired();
            builder.Property(e => e.ReplacedByTokenHash).HasMaxLength(128);
            builder.Property(e => e.CreatedByIp).HasMaxLength(50);

            builder.HasIndex(e => e.TokenHash).IsUnique();
            builder.HasIndex(e => e.UserId);
        }
    }
}
