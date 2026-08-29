# Infrastructure Design Plan — Unit 4: Compliance Screening & Native Approval Engine

## Purpose
This plan details the infrastructure configurations, email delivery services, Docker test containers, database index optimizations, and deployment specifications for **Unit 4: Compliance Screening & Native Approval Engine**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Infrastructure Architecture (`infrastructure-design.md`)**
  - [x] Appsettings schema for `EmailSettings` and `ComplianceScreeningSettings`
  - [x] Database index optimizations for `ComplianceRecords` and approval status queries
  - [x] Smtp test server configuration (Mailpit/MailHog container in `docker-compose.yml`)

- [x] **Step 2: Define Deployment Architecture (`deployment-architecture.md`)**
  - [x] Environment variable mapping for SMTP secrets (`EMAIL_SMTP_PASSWORD`, `EMAIL_SMTP_HOST`)
  - [x] Network security and egress rules for external compliance API integration

---

## Planning Questions for Unit 4 Infrastructure Design

Please answer the following questions to help guide the infrastructure and deployment specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Local Development & CI Email Delivery Mode
สำหรับการทดสอบและพัฒนาในระดับ Local / CI ต้องการกำหนดค่าเริ่มต้นของการส่งอีเมลอย่างไร?

A) Default `UseInMemoryFallback = true` ใน `appsettings.Development.json` (ส่งแบบ In-Memory และบันทึก Log) พร้อมออปชันเปิดใช้งาน Mailpit ใน Docker Compose สำหรับทดสอบดูหน้าจอ Email HTML *(Recommended)*

B) บังคับต่อเชื่อม Real External SMTP Server เสมอ

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Mailpit Container Integration in Docker Compose
ต้องการเพิ่ม Mailpit Container (Port 1025 for SMTP, Port 8025 for Web UI) ใน `docker-compose.yml` สำหรับใช้ดูและทดสอบอีเมลแจ้งเตือนการอนุมัติแบบ Visual ในสภาพแวดล้อม Local หรือไม่?

A) ใช่ เพิ่ม Mailpit Container ใน `docker-compose.yml` *(Recommended)*

B) ไม่ต้อง ใช้ In-Memory / File Logging อย่างเดียว

X) Other (please describe after [Answer]: tag below)

[Answer]:  A

---
