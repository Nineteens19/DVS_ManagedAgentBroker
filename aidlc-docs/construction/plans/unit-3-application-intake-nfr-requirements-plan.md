# NFR Requirements Plan — Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)

## Purpose
This plan outlines the non-functional requirements, file integrity validations, security guards, and performance constraints for **Unit 3: Application Intake & Document Management Service**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define NFR Requirements (`nfr-requirements.md`)**
  - [x] Binary Magic Byte Inspection for MIME type validation (preventing file extension spoofing)
  - [x] SHA-256 Checksum computation for end-to-end file integrity verification
  - [x] Storage quota constraints and upload rate limits
  - [x] Audit trail logging for all document operations (Upload, Download, Soft-delete)

- [x] **Step 2: Define Technology Stack Decisions (`tech-stack-decisions.md`)**
  - [x] Streaming I/O file processing (`System.IO.Pipelines` / async streams) to avoid high memory spikes
  - [x] FluentValidation rules integration for intake command payloads

---

## Planning Questions for Unit 3 NFR Requirements

Please answer the following questions to help guide the security and performance specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Binary Magic Byte File Validation (Anti-Spoofing)
สำหรับการป้องกันการอัปโหลดไฟล์ไม่พึงประสงค์ (File Upload Spoofing / Malware masquerading as PDF/Image) ต้องการให้ระบบตรวจสอบ Signature Magic Bytes อย่างไร?

A) Strict Magic Byte Validation: ตรวจสอบ Header Bytes ของไฟล์จริง (`%PDF` = `25 50 44 46`, `JPEG` = `FF D8 FF`, `PNG` = `89 50 4E 47`) ร่วมกับ File Extension และ Content-Type Header *(Recommended สำหรับ ISO 27001 Security Baseline)*

B) Extension-only Validation: ตรวจสอบเฉพาะนามสกุลไฟล์ (`.pdf`, `.jpg`, `.jpeg`, `.png`)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Memory Optimization on File Streaming
สำหรับการรับไฟล์อัปโหลดขนาดสูงสุด 10MB ต้องการใช้เทคนิคการประมวลผลอย่างไร?

A) Direct Async Stream Copy: สตรีมไฟล์โดยตรงจาก HTTP Request ไปยัง File Storage โดยไม่โหลดไฟล์ทั้งก้อนเข้า Memory (ลด Garbage Collection Pressure) *(Recommended)*

B) In-Memory Byte Array: โหลดไฟล์เป็น `byte[]` ในหน่วยความจำก่อนบันทึก

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
