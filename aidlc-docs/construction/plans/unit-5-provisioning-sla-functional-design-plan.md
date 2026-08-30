# Functional Design Plan — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

## Purpose
This plan details the functional specifications for **Unit 5**, covering 100% automated multi-system core provisioning (AS400, APAR, SAP, PCSDIS), agent code/source code generation, provisional selling activation (`ActiveTemporary`), background SLA monitoring daemon (30-day auto-suspension & 90-day auto-termination), and Legal hard-copy archiving (`ActivePermanent`).

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Domain Entities & DTOs (`domain-entities.md`)**
  - [x] Provisioning commands, sync payloads, and core system transaction models
  - [x] SLA daemon status models and execution reports
  - [x] Legal contract archive commands and audit records

- [x] **Step 2: Define Business Logic Model (`business-logic-model.md`)**
  - [x] 100% automated multi-system provisioning workflow without manual IT tasks
  - [x] Agent code & source code allocation algorithms
  - [x] Provisional selling rights activation lifecycle
  - [x] SLA daemon evaluation and status transitions (`Suspended30D`, `Terminated90D`)
  - [x] Hard-copy receipt and permanent rights activation (`ActivePermanent`)

- [x] **Step 3: Define Business Rules (`business-rules.md`)**
  - [x] Provisioning prerequisites and transactional idempotency rules
  - [x] 30-day suspension SLA rules and policy submission blocking
  - [x] 90-day permanent termination SLA rules
  - [x] Archive box number and legal document verification rules

---

## Planning Questions for Unit 5 Functional Design

Please answer the following questions to help guide the functional design. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Core Systems Provisioning Execution Strategy
เมื่อใบสมัครผ่านการอนุมัติ (`ReviewPremium`) ระบบจะดำเนินการส่งข้อมูลไปยังระบบ Core 4 ระบบ (AS400, APAR, SAP, PCSDIS) อย่างไร?

A) **Automated Multi-System Provisioner with Individual System Idempotency**: ส่งข้อมูลแบบ Asynchronous Pipeline บันทึก `CoreSyncTransaction` แยกแต่ละระบบ พร้อม Retry อัตโนมัติ หากสำเร็จครบ 4 ระบบจึงเปิดขายชั่วคราว (`ActiveTemporary`) ทันทีแบบ 100% Automated ไร้งาน manual ของ IT *(Recommended)*

B) Sequential Single-Transaction: ส่งทีละระบบแบบ Blocking ถ้าล้มเหลวระบบใดระบบหนึ่งให้ Rollback ทั้งหมด

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Agent Code & Source Code Format Rules
ต้องการกำหนดรูปแบบรหัสตัวแทน (Agent Code) และรหัสต้นสังกัด (Source Code) สำหรับตัวแทนบุคคลธรรมดาและนิติบุคคลอย่างไร?

A) **Standard Enterprise Format**:
   - บุคคลธรรมดา: Agent Code `AG{YYYY}{5-digit seq}` (e.g. `AG202600001`), Source Code `SRC-{BranchCode}-{4-digit seq}`
   - นิติบุคคล / โบรกเกอร์: Agent Code `BR{YYYY}{5-digit seq}` (e.g. `BR202600001`), Source Code `SRC-{BranchCode}-{4-digit seq}` *(Recommended)*

B) ใช้เลขที่ใบอนุญาต คปภ. (License Number) เป็น Agent Code โดยตรง

X) Other (please describe after [Answer]: tag below)

[Answer]: Agentcode Source จะทำ API ไปเชื่อมกัยระบบ deves master เพื่อสร้างเราจะได้เลขกลับมา 

---

### Question 3: SLA Daemon Execution Interval & Warning Alerts
ตัว Background Daemon สำหรับตรวจสอบ SLA (30 วันระงับการส่งงาน / 90 วันปิดรหัสถาวร) ต้องการให้ทำงานด้วยความถี่เท่าใด และมีการส่ง Notification แจ้งเตือนล่วงหน้าหรือไม่?

A) **Daily Cron / Hourly Worker with Early Warning Notifications**:
   - รันตรวจสอบทุก 1 ชั่วโมง (หรือตั้งเวลา Daily Cron)
   - ส่ง Notification เตือนล่วงหน้าเมื่อเหลือ 7 วัน และ 3 วันก่อนครบกำหนด SLA 30 วัน
   - หากเกิน 30 วัน: ปรับสถานะเป็น `Suspended30D` อัตโนมัติ + ส่งอีเมลแจ้งเตือน
   - หากเกิน 90 วัน: ปรับสถานะเป็น `Terminated90D` อัตโนมัติ + ส่งอีเมลแจ้งเตือน *(Recommended)*

B) รันตรวจสอบเฉพาะตอนเที่ยงคืนของทุกวัน (Daily at Midnight) โดยไม่มีการส่งอีเมลเตือนล่วงหน้า

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
