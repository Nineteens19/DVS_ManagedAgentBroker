# Functional Design Plan — Unit 6: Next.js Enterprise Web Portal & Operational Dashboards

## Purpose
This plan details the functional specifications for **Unit 6: Next.js Enterprise Web Portal & Operational Dashboards**, covering persona-based operational consoles, application intake wizard, compliance & executive approval workflows, 100% automated provisioning monitor, legal contract archiving, and SLA tracker dashboards.

---

## Execution Checklist (Part 1: Planning)

- [ ] **Step 1: Define Frontend UI Models & Page Specs (`domain-entities.md`)**
  - [ ] Persona views (Branch Officer, HO Reviewer, MD Executive, Premium Reviewer, Legal Auditor, Admin)
  - [ ] Multi-step application intake wizard state models
  - [ ] Dashboard metrics, SLA countdown badges, and status indicator components

- [ ] **Step 2: Define UI User Journeys & State Transitions (`business-logic-model.md`)**
  - [ ] Branch Intake Journey: Draft creation, live Modulo 11 check, document drag & drop, submission
  - [ ] Head Office Journey: Review queue, deficiency rejection checklist, compliance screening
  - [ ] Executive Approval Journey: One-click approval/rejection with PEP/Orange warning modal
  - [ ] Premium Review & Provisioning Journey: Credit limit approval & live core sync progress
  - [ ] Legal Archive Journey: Physical contract box number assignment & ActivePermanent upgrade
  - [ ] SLA Dashboard Journey: Active temporary countdown, 30-day suspension, 90-day termination tracking

- [ ] **Step 3: Define UI Business Rules & Client Validations (`business-rules.md`)**
  - [ ] Form validation rules (Thai National ID, credit limit thresholds, file type filters)
  - [ ] Role-based menu and button visibility matrices
  - [ ] Confirmation modals and feedback banners

---

## Planning Questions for Unit 6 Functional Design

Please answer the following questions to help guide the frontend functional design. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: UI Dashboard Layout & Persona Switcher Strategy
สำหรับหน้าจอ Web Portal เพื่อความสะดวกในการสาธิตและทดสอบทั้ง 6 Persona (Branch Officer, HO Reviewer, MD Approver, Premium Reviewer, Legal Auditor, Admin) ต้องการโครงสร้าง Navigation อย่างไร?

A) **Unified Enterprise Portal with Quick Persona Switcher Bar**:
   - ออกแบบหน้าจอแบบ Modern Enterprise Dark/Light Glassmorphism พร้อมแถบ "Quick Persona Switcher" ด้านบนที่สามารถสลับบทบาทผู้ใช้งานทั้ง 6 Personas ได้ทันทีในคลิกเดียวสำหรับการ Demo และ Testing
   - แต่ละ Persona จะเห็น Sidebar Menu, Worklist Queue, และสิทธิ์การกดปุ่มที่ตรงตาม RBAC ของตนเองอย่างแม่นยำ *(Recommended)*

B) บังคับให้ต้อง Logout แล้วพิมพ์ Username/Password เข้าสู่ระบบใหม่ทุกครั้งที่มีการเปลี่ยนบทบาท

X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 2: Application Intake Wizard Step Breakdown
หน้าจอการกรอกใบสมัครตัวแทน/โบรกเกอร์ (Application Intake Wizard) ต้องการแบ่งขั้นตอนอย่างไร?

A) **4-Step Modern Interactive Wizard**:
   - **Step 1: ข้อมูลผู้สมัคร (Applicant Profile)**: เลือกประเภทบุคคลธรรมดา/นิติบุคคล, คำนำหน้า, ชื่อ-นามสกุล, เลขบัตร ปชช. / Tax ID (พร้อมระบบตรวจสอบ Modulo 11 แบบ Real-time), ที่อยู่, บัญชีธนาคาร
   - **Step 2: ข้อมูลผู้ค้ำประกันและหลักประกัน (Guarantor & Collateral)**: ข้อมูลผู้ค้ำ, เอกสารสิทธิ์ที่ดิน, วงเงินสินเชื่อที่ขอ, เทอมการชำระเบี้ย (Motor 15/30/31 วัน, Non-Motor สูงสุด 45 วัน)
   - **Step 3: อัปโหลดเอกสารแนบ (Document Upload)**: Drag & Drop ไฟล์ PDF/JPG/PNG พร้อมระบบตรวจสอบ Magic Byte Header
   - **Step 4: ตรวจสอบและยื่นใบสมัคร (Review & Submit)**: แสดงข้อมูลสรุปทั้งหมด, รายการตรวจสอบก่อนส่ง, บันทึกร่าง (Save Draft) หรือส่งใบสมัคร (Submit) *(Recommended)*

B) Single Long Form: กรอกทุกอย่างรวมอยู่ในหน้าเดียว

X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 3: Backend API Connectivity & Standalone Preview Mode
สำหรับการรัน Frontend Next.js ต้องการรูปแบบการเชื่อมต่อ Backend อย่างไร?

A) **Hybrid Dual-Mode Client**:
   - เชื่อมต่อ REST API ของ ASP.NET Core Backend เมื่อ Backend รันอยู่
   - พร้อมมี In-Memory Local Demo Data Engine ในตัว เพื่อให้สามารถรันและพรีวิว Web UI ได้อย่างสมบูรณ์แบบทั้ง 6 Personas แม้ในระหว่างพัฒนา *(Recommended)*

B) บังคับต่อเชื่อม Live Backend API เท่านั้น

X) Other (please describe after [Answer]: tag below)

[Answer]: 

---
