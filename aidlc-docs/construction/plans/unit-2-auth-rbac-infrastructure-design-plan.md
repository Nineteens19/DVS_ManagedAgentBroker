# Infrastructure Design Plan — Unit 2: Authentication, RBAC & Organization Service

## Purpose
This plan outlines the infrastructure mapping, database schema configurations, seed account fixtures, and deployment settings for **Unit 2: Authentication, RBAC & Organization Directory Service**.

---

## Execution Checklist

- [x] **Step 1: Define Infrastructure Design (`infrastructure-design.md`)**
  - [x] Relational schema mappings for `Users`, `Roles`, `UserRoles`, `Branches`, and `RefreshTokens`
  - [x] Performance indexes on `Username`, `Email`, `BranchCode`, and `TokenHash`
  - [x] Seeding strategy for 6 standard demo persona accounts and corporate branches

- [x] **Step 2: Define Deployment Architecture (`deployment-architecture.md`)**
  - [x] Authentication middleware pipeline architecture
  - [x] Rate-limiting memory cache and IP extraction behind reverse proxy (X-Forwarded-For)

---

## Planning Questions for Unit 2 Infrastructure Design

Please answer the following questions to help finalize infrastructure configurations. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Default Persona Seed Accounts for Dev/Testing
สำหรับการทดสอบระบบและการพัฒนาในเครื่อง Development ต้องการให้ระบบสร้าง Demo Accounts อัตโนมัติใน DatabaseSeeder ครบทั้ง 6 บทบาทหรือไม่?

A) Yes, Seed All 6 Persona Accounts (`branch.user` [5Q], `ho.reviewer`, `premium.officer`, `legal.officer`, `md.approver`, `it.admin` พร้อม Default Password `P@ssword123!` ที่ Hash ผ่าน PBKDF2) *(Recommended สำหรับการทดสอบ)*

B) Seed Only IT Admin Account (`it.admin` / `P@ssword123!`)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Branch Directory Seed Data
สำหรับการเริ่มต้นระบบ ต้องการให้เตรียม Master Data สาขาเบื้องต้นอย่างไร?

A) Seed Corporate Headquarters & Regional Hubs (HQ - สำนักงานใหญ่, 5Q - สาขาอุดรธานี, 10 - สาขาหาดใหญ่, 3A - สาขาเชียงใหม่, 2B - สาขาชลบุรี) *(Recommended)*

B) Seed Only Headquarters (HQ)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
---
