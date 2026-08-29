# NFR Requirements — Unit 2: Authentication, RBAC & Organization Service

This document defines non-functional requirements and security baseline specifications for identity management and access control.

---

## 1. Authentication & Cryptography Standards

- **NFR-SEC-01 (Password Hashing)**:
  - Algorithm: PBKDF2 with HMAC-SHA512
  - Iteration Count: 100,000 iterations
  - Salt Length: 128 bits (16 bytes) cryptographically generated per user
  - Implementation: `Microsoft.AspNetCore.Identity.IPasswordHasher<User>`
- **NFR-SEC-02 (JWT Token Signing & Validation)**:
  - Algorithm: HMAC-SHA256 (`HS256`)
  - Key Length: 256-bit minimum (stored in Key Vault / environment variable `Jwt:Secret`)
  - Claims validation: `ValidateIssuer = true`, `ValidateAudience = true`, `ValidateLifetime = true`, `ValidateIssuerSigningKey = true`, `ClockSkew = TimeSpan.Zero`.
  - Token Lifetime: Strictly 15 minutes (`900` seconds).
- **NFR-SEC-03 (Refresh Token Storage & Rotation)**:
  - Token entropy: 64 random bytes (Base64URL encoded).
  - Storage: SHA-256 hash of token stored in `RefreshTokens.TokenHash` (never plaintext).
  - Lifetime: Strictly 7 days (`604,800` seconds).

---

## 2. API Rate Limiting & DoS Protection

- **NFR-SEC-04 (Brute-Force Rate Limiting)**:
  - Target Endpoints: `/api/v1/auth/login`, `/api/v1/auth/refresh`
  - Policy: Fixed Window Rate Limiter
  - Limit: 10 requests per 1-minute window partitioned by Client IP Address (`HttpContext.Connection.RemoteIpAddress`).
  - Response on breach: HTTP `429 Too Many Requests` with `Retry-After: 60` header.

---

## 3. Observability & Security Audit Trail

- **NFR-SEC-05 (Authentication Audit Events)**:
  - Successful logins, failed authentication attempts, account lockouts, token refreshes, and logouts must emit structured log events containing:
    - Event Type (`AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `AUTH_ACCOUNT_LOCKED`, `AUTH_TOKEN_REFRESHED`, `AUTH_LOGOUT`)
    - Client IP Address
    - Username
    - Timestamp (UTC)
    - Sensitive credentials (passwords, tokens) must never appear in logs.
