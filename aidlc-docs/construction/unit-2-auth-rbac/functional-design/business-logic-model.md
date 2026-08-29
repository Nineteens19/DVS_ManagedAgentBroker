# Business Logic Model — Unit 2: Authentication, RBAC & Organization Service

This document defines the authentication lifecycle, hybrid SSO token exchange, JWT claims generation, data scoping, and session security.

---

## 1. Authentication Lifecycle

```
[User Browser / Next.js]
        |
        +---> (1) POST /api/v1/auth/login { username, password }
        |         OR POST /api/v1/auth/sso/callback { oidc_code, state }
        |
[ASP.NET Core Web API]
        |
        +---> (2) Validate Credentials OR Verify OIDC Token against Azure AD/OIDC
        +---> (3) Check Account Status (IsActive == true, LockoutEndUtc < Now)
        +---> (4) Load User Roles & BranchCode
        +---> (5) Generate JWT Access Token (15 mins) with Claims:
        |         - sub: UserId
        |         - name: FullName
        |         - email: Email
        |         - branch_code: BranchCode
        |         - roles: [ROLE_BRANCH_BU, ...]
        +---> (6) Generate Refresh Token (7 days) -> Store Hash in DB
        +---> (7) Return TokenResponse { AccessToken, RefreshToken, ExpiresIn: 900 }
```

---

## 2. Branch Data Scope Isolation Model

The system enforces data isolation based on the user's role and branch code:

| Role Code | Accessible Applications Scope | Business Rationale |
|---|---|---|
| `ROLE_BRANCH_BU` | `app.BranchCode == currentUser.BranchCode` | สาขาสามารถดูและจัดการได้เฉพาะคำขอที่ส่งจากสาขาตนเองเท่านั้น |
| `ROLE_HO_BU` | Global (All Branches) | เจ้าหน้าที่สำนักงานใหญ่คัดกรองและตรวจสอบคำขอทั่วประเทศ |
| `ROLE_PREMIUM_DEPT` | Global (All Branches) | เจ้าหน้าที่ฝ่ายการเงินและเบี้ยประกันอนุมัติวงเงินทั่วประเทศ |
| `ROLE_LEGAL_DEPT` | Global (All Branches) | เจ้าหน้าที่ฝ่ายกฎหมายตรวจสอบเอกสารตัวจริงและจัดเก็บทั่วประเทศ |
| `ROLE_APPROVER_MD` | Global (All Branches) | ผู้บริหารระดับสูงอนุมัติคำขอทั่วประเทศ |
| `ROLE_IT_ADMIN` | Global (All System Data) | เจ้าหน้าที่ไอทีดูแลระบบและการเชื่อมต่อ Core Systems |

---

## 3. Refresh Token Rotation & Session Revocation

1. **Token Refresh Flow**:
   - Client sends `POST /api/v1/auth/refresh { refreshToken }`.
   - Server verifies token hash, expiry, and revocation state.
   - If valid, server marks old token as revoked (`ReplacedByTokenHash = newHash`) and issues a new Access Token + new Refresh Token.
2. **Replay Attack Detection**:
   - If an already revoked refresh token is submitted, the server detects potential token theft and immediately revokes all active refresh tokens for that user.
3. **Session Revocation (Logout / Password Change)**:
   - Sets `IsRevoked = true` on all active refresh tokens for the user.
