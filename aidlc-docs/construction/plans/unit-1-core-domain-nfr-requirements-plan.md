# NFR Requirements Plan — Unit 1: Core Domain & DB Schema

## Purpose
This plan outlines the non-functional requirements (NFRs), security baselines, and resiliency rules for **Unit 1: Core Domain, Database Schema & EF Core Infrastructure**.

---

## Execution Checklist

- [x] **Step 1: Define Unit 1 NFR Requirements (`nfr-requirements.md`)**
  - [x] Performance & Latency targets (DB query p95 $< 50$ms, indexing on ApplicationNumber, Status, BranchCode)
  - [x] Concurrency & Data Consistency (Optimistic concurrency with RowVersion token)
  - [x] Security & Privacy (AES-256 encryption on NationalId, BankAccountNumber, PII protection)
  - [x] Audit & Compliance (ISO 27001 immutable change history, soft deletion query filters)
  - [x] Resiliency & Connection Recovery (EF Core SQL Server automatic retry execution strategy)
  - [x] Property-Based Testing Invariants (`PBT-01`, `PBT-02`)

- [x] **Step 2: Document Tech Stack & Framework Choices (`tech-stack-decisions.md`)**
  - [x] Target Framework: .NET 8 (C# 12)
  - [x] ORM: Entity Framework Core 8.0 (Microsoft.EntityFrameworkCore.SqlServer)
  - [x] Database Engine: Microsoft SQL Server 2022 (Compatibility Level 160)
  - [x] Testing Frameworks: xUnit, FluentAssertions, FsCheck / Bogus (for PBT)

---

## Planning Questions for Unit 1 NFR Requirements

Please answer the following questions to help finalize NFR decisions. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Concurrency Conflict Handling
เมื่อมีผู้ใช้งานเปิดดูหรืออัปเดต Application พร้อมกัน (เช่น Branch แก้ไขข้อมูล ขณะที่ HO กำลังส่งไป EAS) ต้องการให้จัดการ Concurrency อย่างไร?

A) Optimistic Concurrency Control (ใช้ `byte[] RowVersion` / `ConcurrencyToken` แจ้งเตือนเมื่อข้อมูลถูกแก้ไขโดยผู้อื่นก่อนหน้า `DbUpdateConcurrencyException`)

B) Last Write Wins (บันทึกทับข้อมูลล่าสุดโดยไม่ตรวจสอบ Version)

C) Pessimistic Record Locking

X) Other (please describe after [Answer]: tag below)

[Answer]: EAS  ไม่ใช้แล้วเราจะวิ่งอนุมัติในระบบนี้เลย แต่ต้องมี noti ในแจ้งเพื่อ approval ทางอีเมลด้วย 

---

### Question 2: PII Data Protection (เลขบัตรประชาชน / เลขบัญชีธนาคาร)
ข้อมูลอ่อนไหว (PII) เช่น เลขบัตรประจำตัวประชาชน 13 หลัก และเลขที่บัญชีธนาคาร ต้องการให้จัดเก็บอย่างไร?

A) Application-Level AES-256-GCM Encryption (ใช้ EF Core ValueConverter เข้ารหัสก่อนบันทึกลง SQL Server และถอดรหัสอัตโนมัติเมื่ออ่านข้อมูล)

B) SQL Server Always Encrypted (Column-Level Encryption ผ่าน Database Driver)

C) Plain Text ในฐานข้อมูล แต่จำกัดสิทธิ์เข้าถึงตารางด้วย RBAC

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Database Connection Resiliency & Retry Policy
กรณีเกิด Transient Network Glitch หรือ Database Failover ชั่วขณะ ต้องการให้ EF Core จัดการการเชื่อมต่ออย่างไร?

A) EF Core Built-in Execution Strategy (`EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null)`)

B) Polly Pipeline รอบทุก Database Operation

C) Fail-Fast (โยนข้อผิดพลาดทันทีโดยไม่ Retry)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
