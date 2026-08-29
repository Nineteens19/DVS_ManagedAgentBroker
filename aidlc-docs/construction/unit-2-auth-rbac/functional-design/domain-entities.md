# Domain Entities — Unit 2: Authentication, RBAC & Organization Service

This document defines the identity, role-based authorization, session management, and organization branch models.

---

## 1. Entity Definitions

### 1.1 User (`Users`)
Represents an internal corporate employee or external agent who logs into the system.
- **Id**: `Guid` (UUID, Primary Key)
- **Username**: `string(50)` (Unique, e.g. `somchai.k`, `kannika.l`)
- **Email**: `string(100)` (Unique)
- **FullName**: `string(150)` (e.g. `นายสมชาย ใจดี`)
- **BranchCode**: `string(20)` (Foreign reference to `Branches.BranchCode`, e.g. `5Q`, `10`, `HQ`)
- **Department**: `string(100)` (e.g. `Branch Marketing`, `Underwriting`, `Legal`, `Premium Credit`)
- **PasswordHash**: `string(255)` (Salted PBKDF2/BCrypt hash for local accounts; null for pure SSO)
- **IsActive**: `bool` (Default: `true`)
- **FailedLoginAttempts**: `int` (Lockout threshold counter)
- **LockoutEndUtc**: `DateTime?` (Timestamp when temporary account lock expires)
- **LastLoginAt**: `DateTime?`
- **SsoSubjectId**: `string(100)?` (External AD / Azure AD Object ID / sub claim)

### 1.2 Role (`Roles`)
Represents a predefined authorization role in the system.
- **Id**: `Guid` (Primary Key)
- **Code**: `string(50)` (Unique, e.g. `ROLE_BRANCH_BU`, `ROLE_HO_BU`, `ROLE_PREMIUM_DEPT`, `ROLE_LEGAL_DEPT`, `ROLE_APPROVER_MD`, `ROLE_IT_ADMIN`)
- **Name**: `string(100)` (Display Name, e.g. `เจ้าหน้าที่การตลาดสาขา`, `กรรมการผู้จัดการ (MD)`)
- **Description**: `string(255)`

### 1.3 UserRole (`UserRoles`)
Many-to-many junction between `Users` and `Roles`.
- **UserId**: `Guid` (FK $\rightarrow$ `Users.Id`)
- **RoleId**: `Guid` (FK $\rightarrow$ `Roles.Id`)
- **AssignedAt**: `DateTime`
- **AssignedBy**: `string`

### 1.4 Branch (`Branches`)
Represents corporate branches and head office divisions.
- **Id**: `Guid` (Primary Key)
- **BranchCode**: `string(20)` (Unique, e.g. `HQ`, `5Q`, `10`, `3A`)
- **BranchName**: `string(150)` (e.g. `สำนักงานใหญ่`, `สาขาอุดรธานี`, `สาขาหาดใหญ่`)
- **Region**: `string(50)` (e.g. `Central`, `Northeast`, `South`, `North`)
- **Address**: `string(255)`
- **PhoneNumber**: `string(30)`
- **IsActive**: `bool` (Default: `true`)

### 1.5 RefreshToken (`RefreshTokens`)
Tracks active and revoked refresh tokens for session rotation and ISO 27001 audit.
- **Id**: `Guid` (Primary Key)
- **UserId**: `Guid` (FK $\rightarrow$ `Users.Id`)
- **TokenHash**: `string(128)` (SHA-256 hash of random refresh token secret)
- **ExpiresAtUtc**: `DateTime`
- **IsRevoked**: `bool` (Default: `false`)
- **RevokedAtUtc**: `DateTime?`
- **ReplacedByTokenHash**: `string(128)?` (For token rotation chain detection)
- **CreatedByIp**: `string(50)`
