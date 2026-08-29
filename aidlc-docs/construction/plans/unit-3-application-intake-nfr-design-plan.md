# NFR Design Plan — Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)

## Purpose
This plan outlines the architectural patterns, streaming file management abstractions, validation pipeline designs, and logical component specifications for **Unit 3: Application Intake & Document Management Service**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define NFR Design Patterns (`nfr-design-patterns.md`)**
  - [x] Concurrent Application Number generation pattern with retry resilience
  - [x] Streaming file upload and SHA-256 integrity inspection pipeline pattern
  - [x] Soft delete and physical storage retention design pattern
  - [x] Thai National ID Modulo 11 property-based invariant pattern

- [x] **Step 2: Define Logical Components & DI Registrations (`logical-components.md`)**
  - [x] `IApplicationNumberGenerator` & `ApplicationNumberGenerator`
  - [x] `IFileStorageService` & `LocalDiskFileStorageService`
  - [x] `IFileSignatureValidator` & `FileSignatureValidator`
  - [x] `IApplicationIntakeService` & `ApplicationIntakeService`
  - [x] FluentValidation Validators (`CreateDraftApplicationValidator`, `AgentProfileValidator`)

---

## Planning Questions for Unit 3 NFR Design

Please answer the following questions to help guide the design patterns. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Application Number Concurrency & Unique Sequence Strategy
สำหรับการสร้างรหัสเลขที่คำขอ `APP-YYYYMMDD-XXXX` ภายใต้สภาพแวดล้อมที่มีการส่งคำขอพร้อมกัน (Concurrency) ต้องการออกแบบกลยุทธ์อย่างไร?

A) Database Unique Index + Optimistic Concurrency Retry: อาศัย Unique Index บนคอลัมน์ `ApplicationNumber` ร่วมกับ Polly Retry Policy ในกรณีเกิด Duplicate Key Collision *(Recommended สำหรับ Clean Architecture & Scalability)*

B) DB-Level Table Lock: ใช้ Transaction Exclusive Lock (`TABLOCKX` / `SERIALIZABLE`) ขณะนับและสร้าง Sequence

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Attachment Deletion / Soft Delete Policy
เมื่อผู้ใช้ลบเอกสารแนบที่อัปโหลดผิด หรือเมื่อมีการ Re-upload เอกสารใหม่ ต้องการจัดการไฟล์ Physical อย่างไร?

A) Soft Delete Metadata Only: ตั้งค่า `IsDeleted = true` ในฐานข้อมูล และคง Physical File ไว้ใน Storage เพื่อการตรวจสอบย้อนหลังตาม Audit Policy (ISO 27001) *(Recommended)*

B) Hard Delete: ลบทั้ง Metadata ในฐานข้อมูลและ Physical File ออกจากดิสก์ทันที

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
