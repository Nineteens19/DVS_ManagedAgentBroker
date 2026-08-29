# Code Generation Plan — Unit 2: Authentication, RBAC & Organization Service

## Purpose
This plan outlines the code generation steps for **Unit 2: Authentication, RBAC & Organization Directory Service**, delivering identity models, JWT token issuance, PBKDF2 password hashing, branch data scope evaluation, user seed fixtures, and automated test suites.

---

## Code Location
- **Backend Source Code**: `/Users/nineteen/DVS/managedAgentBroker/src/backend/`
  - `ManagedAgentBroker.Domain/` (User, Role, UserRole, Branch, RefreshToken entities)
  - `ManagedAgentBroker.Infrastructure/` (Identity, JWT Token Service, Password Hashing, Branch Scoping, Seeder)
- **Backend Test Code**: `/Users/nineteen/DVS/managedAgentBroker/tests/backend/`
  - `ManagedAgentBroker.Infrastructure.Tests/` (PasswordHashPbtTests, JwtTokenServiceTests, BranchScopeEvaluatorTests)

---

## Execution Checklist (Part 2: Generation)

- [x] **Step 1: Identity & Organization Domain Entities**
  - [x] `User.cs` (Id, Username, Email, FullName, BranchCode, Department, PasswordHash, IsActive, LockoutEndUtc, FailedLoginAttempts)
  - [x] `Role.cs` (Id, Code, Name, Description)
  - [x] `UserRole.cs` (UserId, RoleId, AssignedAt, AssignedBy)
  - [x] `Branch.cs` (Id, BranchCode, BranchName, Region, Address, PhoneNumber, IsActive)
  - [x] `RefreshToken.cs` (Id, UserId, TokenHash, ExpiresAtUtc, IsRevoked, RevokedAtUtc, ReplacedByTokenHash, CreatedByIp)

- [x] **Step 2: Cryptographic Password Hashing Service (PBKDF2)**
  - [x] `IPasswordHashService.cs` & `PasswordHashService.cs` using RFC 2898 PBKDF2 HMAC-SHA512 with 100,000 iterations

- [x] **Step 3: JWT Token Service & Claims Transformer**
  - [x] `ITokenService.cs` & `JwtTokenService.cs` (HS256 JWT generation with `sub`, `name`, `email`, `branch_code`, `roles` claims and SHA-256 refresh tokens)

- [x] **Step 4: Branch Data Scope Evaluator**
  - [x] `IBranchScopeEvaluator.cs` & `BranchScopeEvaluator.cs` (Evaluates ClaimsPrincipal and applies transparent `BranchCode` isolation filters)

- [x] **Step 5: Identity & Authentication Business Service**
  - [x] `IIdentityService.cs` & `IdentityService.cs` (Login, Token Refresh, Revocation, Lockout enforcement, Branch directory queries)

- [x] **Step 6: EF Core Identity Configurations & DbContext Updates**
  - [x] `UserConfiguration`, `RoleConfiguration`, `UserRoleConfiguration`, `BranchConfiguration`, `RefreshTokenConfiguration`
  - [x] Update `ApplicationDbContext.cs` & `IApplicationDbContext.cs`

- [x] **Step 7: Database Seeding for 6 Personas & Regional Branches**
  - [x] Update `DatabaseSeeder.cs` with branches (`HQ`, `5Q`, `10`, `3A`, `2B`), roles, and 6 demo persona accounts (`branch.user`, `ho.reviewer`, `premium.officer`, `legal.officer`, `md.approver`, `it.admin`)

- [x] **Step 8: Unit Testing & Property-Based Invariant Verification**
  - [x] `PasswordHashPbtTests.cs` (PBT tests for PBKDF2 hash verification `PBT-03`)
  - [x] `JwtTokenServiceTests.cs` (Token generation, claims extraction, expiration validation)
  - [x] `BranchScopeEvaluatorTests.cs` (Branch BU vs Global HO/MD/IT scope filtering tests)
  - [x] Verify test suite execution via `dotnet test` (22/22 tests passing)

---
