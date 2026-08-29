# Functional Design Plan — Unit 4: Compliance Screening & Native Approval Engine

## Purpose
This plan specifies the functional domain design, business logic pipelines, compliance screening adapters (AMLO / OIC), native internal executive approval workflows, and SMTP email notification dispatchers for **Unit 4: Compliance Screening & Native Approval Engine**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Domain Entities & Intake Models (`domain-entities.md`)**
  - [x] Compliance Screening Command & Result DTOs (`AmloScreeningResult`, `OicScreeningResult`)
  - [x] Approval Decision Command & History DTOs (`ExecutiveApprovalDecisionCommand`, `ApprovalAuditDto`)
  - [x] Email Notification Message Models (`EmailNotificationMessage`)

- [x] **Step 2: Define Business Logic Workflows (`business-logic-model.md`)**
  - [x] AMLO & OIC automated screening pipeline upon branch submission
  - [x] Native Executive Approval state progression & routing
  - [x] SMTP Email notification trigger events and template rendering

- [x] **Step 3: Define Business Rules & Validation (`business-rules.md`)**
  - [x] AMLO Designated & OIC Red hard-stop rejection rule (`BR-COMPLIANCE-01`, `BR-COMPLIANCE-02`)
  - [x] PEP / OIC Orange escalated approval gating (`RequiresDirectorApproval`)
  - [x] Executive decision idempotency and role authorization checks

---

## Planning Questions for Unit 4 Functional Design

Please answer the following questions to help guide the compliance and approval design. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Compliance Screening Integration Pattern (AMLO & OIC)
สำหรับการตรวจสอบ AMLO (รายชื่อบุคคลที่ถูกกำหนด/PEP) และ OIC (Blacklist คปภ.) ในสภาพแวดล้อมระบบ ต้องการออกแบบ Adapter อย่างไร?

A) Simulated Sandbox Adapter + Configurable API Client: พัฒนา Adapter ที่รองรับ Mock Data สำหรับ National ID ทดสอบ (เช่น รหัสที่ขึ้นต้นด้วย `999` ให้ผลเป็น Designated, `888` ให้ผลเป็น PEP) พร้อมโครงสร้าง HTTP REST Client สำหรับเชื่อมต่อ Service ภายนอก *(Recommended)*

B) Pure Static Mock Adapter

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Email Notification Engine Strategy
สำหรับการส่งแจ้งเตือน Approval ทางอีเมล ต้องการกำหนด Delivery Pipeline อย่างไร?

A) `IEmailNotificationService` with SMTP client & In-Memory / File-based logging for Dev/Test environments *(Recommended)*

B) Background Queue with Outbox Pattern

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Executive Approval Delegation / Multiple Approvers
ในกรณีที่ผู้มีอำนาจอนุมัติ (MD / Executive) ไม่อยู่ ต้องการรองรับการอนุมัติอย่างไร?

A) Single-tier Executive Approval with Role-based Access (`ROLE_APPROVER_MD`) โดยผู้ใช้ทุกคนที่ถือสิทธิ์นี้สามารถพิจารณาอนุมัติ/ปฏิเสธได้ *(Recommended ตาม Scope)*

B) Multi-level Hierarchical Approval Matrix (Branch Manager $\rightarrow$ Head of BU $\rightarrow$ MD)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
