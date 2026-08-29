# NFR Design Plan — Unit 1: Core Domain & DB Schema

## Purpose
This plan outlines the design patterns, logical components, and security/resiliency structures for **Unit 1: Core Domain, Database Schema & EF Core Infrastructure**.

---

## Execution Checklist

- [x] **Step 1: Design NFR Patterns (`nfr-design-patterns.md`)**
  - [x] Optimistic Concurrency Control Pattern (`RowVersion` + `ConcurrencyCheck`)
  - [x] AES-256-GCM Value Converter Pattern for PII encryption at rest
  - [x] ISO 27001 Audit Trail Interceptor Pattern (`SaveChangesInterceptor`)
  - [x] Global Query Filter Soft-Delete Pattern
  - [x] SQL Execution Strategy with Exponential Backoff Retry

- [x] **Step 2: Define Logical Components (`logical-components.md`)**
  - [x] `IAesEncryptionProvider` & `Aes256GcmEncryptionProvider`
  - [x] `AesEncryptedConverter<T>` for EF Core ModelBuilder
  - [x] `AuditSaveChangesInterceptor`
  - [x] `ApplicationDbContext` with custom schema configurations and index definitions
  - [x] Structured Serilog logger with PII masking filter

---

## Planning Questions for Unit 1 NFR Design

Please answer the following questions to guide the component implementations. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Encryption Key Management Strategy
สำหรับ Master Key ในการเข้ารหัส AES-256-GCM ของฟิลด์ PII (เลขบัตรประชาชน / เลขบัญชี) ต้องการให้จัดการ Key อย่างไร?

A) Configuration / Environment Variable (`DataEncryption:Key`) พร้อมรองรับ `IKeyVaultProvider` abstraction เพื่อให้สามารถเสียบ Azure Key Vault / AWS KMS หรือ Environment Secret ได้ในอนาคต

B) Local File-based Key Store

C) Hardcoded Dev Key ใน Development และ Environment Variable ใน Production

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Structured Logging & Sensitive Data Masking
สำหรับการ Log ข้อมูล Query และ Application Events ต้องการให้จัดการอย่างไรเพื่อไม่ให้ข้อมูลบัตรประชาชนหลุดไปใน Log Files?

A) Serilog Structured Logging พร้อม Custom Destructuring Policy / PII Masking Filter (แปลงเลขบัตร 13 หลักเป็น `1-1002-XXXXX-99-1` ใน Log เสมอ)

B) Standard ASP.NET Core ILogger (ปิดการแสดง Parameter Values ใน SQL Queries ใน Production)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
