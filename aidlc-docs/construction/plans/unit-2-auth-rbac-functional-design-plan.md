# Functional Design Plan — Unit 2: Authentication, RBAC & Organization Service

## Purpose
This plan outlines the detailed functional design activities for **Unit 2: Authentication, RBAC & Organization Directory Service**, establishing identity management, Active Directory / SSO token exchange, role-based authorization matrix, and branch scope isolation.

---

## Execution Checklist

- [x] **Step 1: Define Identity & Organization Entities (`domain-entities.md`)**
  - [x] `UserEntity` (UserId, Username, Email, FullName, BranchCode, IsActive, PasswordHash)
  - [x] `RoleEntity` (RoleId, RoleName, Description)
  - [x] `UserRoleEntity` (Mapping user to assigned roles)
  - [x] `BranchEntity` (BranchCode, BranchName, Region, IsActive)
  - [x] `RefreshTokenEntity` (Token, ExpiryDate, IsRevoked, CreatedByIp)

- [x] **Step 2: Define Authentication & RBAC Business Logic (`business-logic-model.md`)**
  - [x] SSO / Active Directory OAuth2/OIDC token exchange and local session provisioning
  - [x] JWT Claims construction (`sub`, `name`, `email`, `branch_code`, `roles`, `permissions`)
  - [x] Branch Data Scope isolation model (Branch BU sees only local branch; HO/Dept/MD sees all branches)
  - [x] Refresh token rotation and session revocation lifecycle

- [x] **Step 3: Define Authorization Rules & Permissions Matrix (`business-rules.md`)**
  - [x] 6 Personas Role-Permission Matrix (`ROLE_BRANCH_BU`, `ROLE_HO_BU`, `ROLE_PREMIUM_DEPT`, `ROLE_LEGAL_DEPT`, `ROLE_APPROVER_MD`, `ROLE_IT_ADMIN`)
  - [x] Account security rules: Max failed login attempts (5 times -> 15 min lock), session timeout (15 min token expiry)
  - [x] Segregation of duties rules (A user cannot approve their own submitted application)

---

## Planning Questions for Unit 2 Functional Design

Please answer the following questions to help finalize identity and authorization designs. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Active Directory & SSO Authentication Mode
ต้องการให้ระบบรองรับการเข้าสู่ระบบ (Authentication) ในรูปแบบใด?

A) Hybrid SSO (รองรับ Enterprise OpenID Connect / Active Directory OAuth2 SSO สำหรับ Production + Local Database Credential Login พร้อม Secure Password Hashing PBKDF2/BCrypt สำหรับ Local Dev / Fallback) *(Recommended)*

B) OIDC / Azure AD SSO Only (ต้องเชื่อมต่อ Identity Provider เสมอ)

C) Local Database Authentication Only (จัดการ Username / Password ภายในระบบทั้งหมด)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Branch Data Isolation & Access Scope Rule
สำหรับผู้ใช้งานระดับสาขา (Branch BU) และสำนักงานใหญ่ (Head Office / Premium / Legal / MD / IT) ต้องการให้จำกัดการมองเห็นข้อมูลคำขออย่างไร?

A) Strict Branch Scoping (ผู้ใช้สาขาเห็นเฉพาะคำขอที่สร้างโดยสาขาตนเอง `BranchCode == user.BranchCode`, ผู้ใช้ระดับ Head Office, Premium, Legal, Approver MD, และ IT Admin สามารถดูและจัดการคำขอได้ทั่วประเทศ) *(Recommended)*

B) Department-only Scoping (แบ่งตามฝ่ายงาน)

C) Global View (ทุกบทบาทมองเห็นคำขอทั้งหมด)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Token Lifetime & Session Invalidation Strategy
ตามมาตรฐาน ISO 27001 Security Baseline ต้องการกำหนดอายุของ JWT Access Token และ Refresh Token อย่างไร?

A) Access Token 15 นาที + Refresh Token 7 วัน (พร้อม Token Rotation และกลไก Revocation ในฐานข้อมูลเมื่อ Logout หรือเปลี่ยนรหัสผ่าน) *(Recommended)*

B) Access Token 60 นาที + No Refresh Token (ต้อง Login ใหม่ทุกชั่วโมง)

C) Access Token 8 ชั่วโมง (ตามรอบเวลาการทำงานปกติ)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
