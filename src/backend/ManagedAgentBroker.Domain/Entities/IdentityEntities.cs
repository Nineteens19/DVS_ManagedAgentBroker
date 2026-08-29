using System;
using System.Collections.Generic;
using ManagedAgentBroker.Domain.Common;

namespace ManagedAgentBroker.Domain.Entities
{
    public class User : BaseEntity<Guid>
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public bool IsActive { get; set; } = true;
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockoutEndUtc { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? SsoSubjectId { get; set; }

        public Branch? Branch { get; set; }
        public List<UserRole> UserRoles { get; set; } = new();
        public List<RefreshToken> RefreshTokens { get; set; } = new();

        public bool IsLockedOut => LockoutEndUtc.HasValue && LockoutEndUtc.Value > DateTime.UtcNow;

        public void RecordSuccessfulLogin()
        {
            FailedLoginAttempts = 0;
            LockoutEndUtc = null;
            LastLoginAt = DateTime.UtcNow;
        }

        public void RecordFailedLogin()
        {
            FailedLoginAttempts++;
            if (FailedLoginAttempts >= 5)
            {
                LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
            }
        }
    }

    public class Role : BaseEntity<Guid>
    {
        public string Code { get; set; } = string.Empty; // ROLE_BRANCH_BU, ROLE_HO_BU, ROLE_PREMIUM_DEPT, etc.
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public List<UserRole> UserRoles { get; set; } = new();
    }

    public class UserRole
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public string AssignedBy { get; set; } = "SYSTEM";

        public User? User { get; set; }
        public Role? Role { get; set; }
    }

    public class Branch : BaseEntity<Guid>
    {
        public string BranchCode { get; set; } = string.Empty; // HQ, 5Q, 10, 3A, 2B
        public string BranchName { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public List<User> Users { get; set; } = new();
    }

    public class RefreshToken : BaseEntity<Guid>
    {
        public Guid UserId { get; set; }
        public string TokenHash { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public bool IsRevoked { get; set; } = false;
        public DateTime? RevokedAtUtc { get; set; }
        public string? ReplacedByTokenHash { get; set; }
        public string CreatedByIp { get; set; } = string.Empty;

        public User? User { get; set; }

        public bool IsActive => !IsRevoked && !IsExpired;
        public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;

        public void Revoke(string? replacedByTokenHash = null)
        {
            IsRevoked = true;
            RevokedAtUtc = DateTime.UtcNow;
            ReplacedByTokenHash = replacedByTokenHash;
        }
    }
}
