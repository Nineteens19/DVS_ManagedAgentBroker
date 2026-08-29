# Functional Design Plan — Unit 1: Core Domain & Database Schema

## Purpose
This plan outlines the detailed functional design activities for **Unit 1: Core Domain, Database Schema & EF Core Infrastructure**, establishing the foundational domain entities, state transition invariants, and business calculation rules.

---

## Execution Checklist

- [x] **Step 1: Define Domain Entities & Value Objects (`domain-entities.md`)**
  - [x] `AgentApplicationAggregate` (Application No, Status, Branch, Agent Type, Credit Terms)
  - [x] `AgentProfileEntity` (Personal/Corporate details, Tax ID, National ID, Bank Account)
  - [x] `GuarantorEntity` (Guarantor details, Employer, Monthly Salary, Relation)
  - [x] `CollateralEntity` (Collateral type, Title deed / Deposit certificate, Value)
  - [x] `ComplianceRecordEntity` (AMLO check result, OIC check result, Color rating, PEP flag)
  - [x] `CoreSyncTransactionEntity` (AS400, SAP, APAR, PCSDIS provisioning transaction logs)
  - [x] `PhysicalContractRecordEntity` (Hard copy receipt date, Archive box ref, 30d/90d timer dates)
  - [x] Audit & Soft Delete metadata (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IsDeleted`)

- [x] **Step 2: Define Business Logic Model & State Invariants (`business-logic-model.md`)**
  - [x] Application state transition matrix & valid state progression
  - [x] Invariant enforcement (Invalid state transition rejection)
  - [x] Provisional selling rights lifecycle (`ACTIVE_TEMPORARY`)

- [x] **Step 3: Define Business Rules & Calculation Specs (`business-rules.md`)**
  - [x] Credit Limit & Credit Term validation (Motor 15/30/31d, Non-Motor $\le$ 45d)
  - [x] Guarantor salary vs Credit Limit minimum coverage ratios
  - [x] AMLO and OIC decision matrix (Green/Yellow/Orange/Red)
  - [x] 30-Day SLA breach auto-suspension calculation and 90-day auto-termination rule

---

## Planning Questions for Unit 1 Functional Design

Please answer the following questions to help finalize domain entity designs. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Entity Primary Key & Identifier Strategy
คุณต้องการให้ใช้ Identifier Strategy แบบใดสำหรับ Domain Entities ใน EF Core / SQL Server?

A) UUID / Guid (`Guid.NewGuid()` / `NEWSEQUENTIALID()`) เพื่อความปลอดภัยและความง่ายในการสร้าง ID จาก Client/Service โดยไม่ต้องรอ Database Round-trip

B) 64-bit Integer (BigInt / Auto-increment Identity)

C) Hybrid (Guid สำหรับ External Public API ID + BigInt สำหรับ Internal Clustered Index)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Audit Trail & Soft Delete Strategy
ระบบต้องรองรับการตรวจสอบย้อนหลังตามมาตรฐาน ISO27001 ต้องการให้จัดการ Audit Fields และ Soft Delete อย่างไร?

A) Standard Audit Fields (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IsDeleted`, `DeletedAt`, `DeletedBy`) พร้อม EF Core Global Query Filters และ Interceptors บันทึกการเปลี่ยนแปลงอัตโนมัติ

B) Temporal Tables (System-Versioned Tables ใน MS SQL Server)

C) Dedicated Audit Event Log Table บันทึก JSON Diff ของทุก Transaction

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Domain Event Notification Strategy
เมื่อสถานะของ Application เปลี่ยนแปลง (เช่น ได้รับอนุมัติ, ตรวจพบผล ปปง., หรือถูกระงับการส่งงาน Auto) ต้องการให้กระจาย Domain Event ภายในระบบอย่างไร?

A) MediatR / In-Process Domain Event Handlers (Publish notification ภายในขอบเขตการทำงานของคำขอ)

B) Outbox Pattern with Background Event Dispatcher (บันทึก Event ลงตาราง Outbox ก่อนส่งต่อ)

C) Direct Synchronous Service Calls

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
