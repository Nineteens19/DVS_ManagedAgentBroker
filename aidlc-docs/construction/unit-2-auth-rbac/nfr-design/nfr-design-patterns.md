# NFR Design Patterns — Unit 2: Authentication, RBAC & Organization Service

This document specifies the authorization patterns, token generation algorithms, and password hashing architecture.

---

## 1. Branch Data Scope Authorization Pattern

```
[Incoming Request with JWT]
        |
        v
[JwtBearer Authentication Handler]
        | (Extracts Claims: sub, email, branch_code, roles)
        v
[ClaimsPrincipal in HttpContext.User]
        |
        +---> [IBranchScopeEvaluator]
                    |
                    +--- IsGlobalScope(roles) -> true? (HO_BU, PREMIUM_DEPT, LEGAL_DEPT, APPROVER_MD, IT_ADMIN)
                    |         ===> Query: `dbContext.AgentApplications` (Unfiltered)
                    |
                    +--- IsBranchRestricted(roles) -> true? (BRANCH_BU)
                              ===> Query: `dbContext.AgentApplications.Where(a => a.BranchCode == user.BranchCode)`
```

---

## 2. Token Issuance & Refresh Rotation Pattern

- **JWT Claims Transformation**:
  - `ClaimTypes.NameIdentifier` $\rightarrow$ `user.Id.ToString()`
  - `ClaimTypes.Name` $\rightarrow$ `user.FullName`
  - `ClaimTypes.Email` $\rightarrow$ `user.Email`
  - `ClaimTypes.Role` $\rightarrow$ `role.Code` (multiple claims for multi-role users)
  - `branch_code` $\rightarrow$ `user.BranchCode`
- **Refresh Token Storage Pattern**:
  - Cryptographic token generated using `RandomNumberGenerator.GetBytes(64)`.
  - SHA-256 hash computed and saved in `RefreshTokens` table.
  - On rotation: `oldToken.IsRevoked = true`, `oldToken.ReplacedByTokenHash = newHash`.
  - If a revoked token is used, trigger `RevokeAllUserTokens(userId)` immediately.

---

## 3. Password Hashing (RFC 2898 Binary Format)

The `PasswordHasher` encodes the hash into a 50-byte binary payload encoded as Base64:
- Header: Format byte `0x01` (PBKDF2 with HMAC-SHA512)
- Pseudo-random Function: Key derivation identifier `0x00000001`
- Iteration Count: `0x000186A0` (100,000 in big-endian)
- Salt: 16 bytes (128-bit CSPRNG salt)
- Subkey: 32 bytes (256-bit derived key)
