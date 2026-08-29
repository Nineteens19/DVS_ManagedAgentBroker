# Functional Design Plan — Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)

## Purpose
This plan outlines the functional requirements, intake command workflows, file attachment validation rules, and document checklist lifecycles for **Unit 3: Application Intake & Document Management Service**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Domain Entities & Value Objects (`domain-entities.md`)**
  - [x] Application intake commands and DTOs (Individual & Juristic profile intake, Guarantor, Collateral, Credit Terms)
  - [x] Attachment metadata entity with SHA-256 integrity hash and content type validation
  - [x] Rejection checklist items and resubmission tracking

- [x] **Step 2: Define Business Logic Model (`business-logic-model.md`)**
  - [x] Application creation workflow (`CreateDraftApplication`, `UpdateDraftApplication`, `SubmitApplication`)
  - [x] Attachment upload and retrieval pipeline with anti-virus / MIME signature validation
  - [x] Checklist verification and deficiency rejection flow

- [x] **Step 3: Define Business Rules & Validation Matrix (`business-rules.md`)**
  - [x] Thai National ID 13-digit checksum validation & Juristic 13-digit Tax ID validation
  - [x] File extension and size constraints (PDF, JPG, PNG; max 10MB per file)
  - [x] Mandatory document checklist per agent type (Individual vs Juristic)

---

## Planning Questions for Unit 3 Functional Design

Please answer the following questions to help guide the intake and document handling specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Application Number Generation Pattern
สำหรับการสร้างรหัสเลขที่คำขอ (Application Number) ต้องการใช้รูปแบบใด?

A) Format `APP-YYYYMMDD-XXXX` (เช่น `APP-20260829-0001` โดยอิงตามวันที่สร้างและ Sequence Number รายวัน 4 หลัก) *(Recommended ตามมาตรฐานระบบประกัน)*

B) Format `APP-BRANCH-YYYYMM-XXXX` (เช่น `APP-5Q-202608-0001` โดยระบุรหัสสาขาและ Sequence รายเดือน)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Attachment Storage Target Provider
สำหรับไฟล์เอกสารแนบ (เช่น สำเนาบัตร ปชช., ใบอนุญาตตัวแทน, ทะเบียนพาณิชย์, สลิปเงินเดือนผู้ค้ำ) ในขั้นตอนนี้ต้องการใช้ Storage Adapter ใด?

A) Local Disk Storage / Network Share Storage Provider พร้อม Local Directory Partitioning (`storage/attachments/{year}/{month}/{appId}/`) ในช่วง Dev และเตรียม Interface `IFileStorageService` เพื่อรองรับ Azure Blob / AWS S3 ในอนาคต *(Recommended)*

B) Database BLOB Storage (เก็บ Binary ในตาราง `ApplicationAttachments` ของ SQL Server โดยตรง)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Thai National ID 13-Digit Checksum Algorithm
สำหรับการตรวจสอบความถูกต้องของเลขบัตรประชาชน 13 หลัก (National ID) ในขั้นตอนบันทึกคำขอ ต้องการบังคับใช้กฎ Checksum Algorithm หรือไม่?

A) Strict Checksum Validation: บังคับใช้ Modulo 11 Checksum Algorithm สำหรับบุคคลธรรมดา และตรวจสอบความยาว 13 หลักสำหรับนิติบุคคล *(Recommended สำหรับความถูกต้องของข้อมูล)*

B) Format-only Validation: ตรวจสอบเฉพาะความยาวตัวเลข 13 หลัก (`^\d{13}$`) โดยไม่คำนวณ Checksum

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
