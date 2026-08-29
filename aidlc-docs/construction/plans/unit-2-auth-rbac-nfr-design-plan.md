# NFR Design Plan — Unit 2: Authentication, RBAC & Organization Service

## Purpose
This plan outlines the architectural patterns, security component designs, and authorization handler abstractions for **Unit 2: Authentication, RBAC & Organization Directory Service**.

---

## Execution Checklist

- [x] **Step 1: Define NFR Design Patterns (`nfr-design-patterns.md`)**
  - [x] ASP.NET Core Policy-Based Authorization pattern (`BranchDataScopeRequirement`, `BranchDataScopeHandler`)
  - [x] Token Issuance & Refresh rotation pattern with race condition guards
  - [x] Cryptographic password hashing encapsulation (`IPasswordHasher<User>`)
  - [x] Audit event logging pipeline for authentication lifecycle

- [x] **Step 2: Define Logical Components & DI Registrations (`logical-components.md`)**
  - [x] `ITokenService` & `JwtTokenService`
  - [x] `IIdentityService` & `IdentityService`
  - [x] `IBranchScopeEvaluator`
  - [x] Dependency Injection registrations in `ManagedAgentBroker.Infrastructure`

---

## Planning Questions for Unit 2 NFR Design

Please answer the following questions to guide the component and pattern designs. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Branch Scope Authorization Design Pattern
สำหรับการตรวจสอบสิทธิ์การเข้าถึงข้อมูลตามสาขา (Branch Scoping) ใน Web API ต้องการออกแบบ Handler อย่างไร?

A) Custom ASP.NET Core Authorization Handler (`BranchDataScopeRequirement` / `IBranchScopeEvaluator`) ตรวจสอบ claims อัตโนมัติและ Filter Query ผ่าน MediatR Pipeline Behaviors *(Recommended สำหรับ Clean Architecture และความปลอดภัยแบบศูนย์กลาง)*

B) Manual Controller-level Checks (เขียน if-else ในแต่ละ Controller Action)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Password Hash Storage Format
สำหรับการจัดเก็บ Password Hash ในฐานข้อมูล ต้องการใช้ฟอร์แมตใด?

A) Self-contained RFC 2898 Binary Payload (บรรจุ Format Marker, Algorithm Identifier, Salt 128-bit, และ Subkey 256-bit ใน Base64 String เดียวกันตามมาตรฐาน ASP.NET Core Identity) *(Recommended)*

B) แยกฟิลด์ `PasswordHash` และ `PasswordSalt` ออกเป็น 2 คอลัมน์

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
