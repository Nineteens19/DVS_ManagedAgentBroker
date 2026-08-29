# Requirements Verification Questions

Please answer the following questions to help clarify the requirements for the **Agent & Broker Management System (ระบบบริหารจัดการตัวแทนนายหน้า)**. Fill in the letter choice after each `[Answer]:` tag.

---

## Question 1: Technology Stack & Development Approach
เอกสารระบุทั้งแนวคิด Microsoft Power Apps/Automate และเว็บแอปพลิเคชันระบบสารสนเทศ คุณต้องการให้พัฒนาระบบในรูปแบบใด?

A) Modern Full-Stack Web Application (Frontend: React/Vite/TypeScript + Backend: Node.js/Express หรือ Python FastAPI พร้อม REST API และ PostgreSQL)

B) Python-based Full-Stack Web Application (Frontend: React/HTML5 + Backend: Python FastAPI/Flask)

C) Microsoft Power Apps & Power Automate low-code architecture

D) Microservices Architecture (Containerized Services + API Gateway)

X) Other (please describe after [Answer]: tag below)

[Answer]: dotnetcore and nextjs ms sql server 

---

## Question 2: Database & Document Storage
ระบบมีการจัดเก็บข้อมูลตัวแทน, สถานะการอนุมัติ, แบบฟอร์ม F-CM-035, F-CM-018 และไฟล์สแกนเอกสารแนบ ต้องการใช้ระบบฐานข้อมูลและที่เก็บไฟล์แบบใด?

A) Relational Database (PostgreSQL / MySQL) + Object Storage (S3 / GCS / Local File Storage) สำหรับไฟล์แนบ

B) Microsoft SQL Server / Azure SQL + Blob Storage

C) Enterprise Database (Oracle / DB2) + Enterprise ECM

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3: Core External System Integrations
ระบบ To-Be มีการสร้าง Agent/Source อัตโนมัติใน AS400, APAR, SAP, PCS/PCSDIS และตรวจสอบ ปปง./คปภ. สำหรับระยะพัฒนานี้ ต้องการให้จัดการการเชื่อมต่อภายนอกอย่างไร?

A) สร้าง Modular Service Layer พร้อม Mock & Simulation APIs สำหรับระบบภายนอกทั้งหมด (AS400, APAR, SAP, PCS, AMLO, OIC) พร้อมโครงสร้างที่สลับเป็น Real Endpoints ได้ทันที

B) กำหนด Interface/Connector สำหรับเชื่อมต่อกับระบบจริง (ต้องระบุ API specification เพิ่มเติม)

C) พัฒนาเฉพาะระบบบริหารจัดการภายในและ Workflow Dashboard โดยบันทึก Transaction รอนำส่งข้อมูล

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4: User Authentication & Authorization (RBAC)
ระบบมีหลายบทบาท เช่น สาขา (BU สาขา), สนญ. (BU สนญ.), ฝ่ายเบี้ยฯ, สำนักนิติกรรม, และผู้บริหารลงนาม (MD / ผู้อำนวยการฝ่าย) ต้องการให้จัดการระบบยืนยันตัวตนอย่างไร?

A) JWT-based Authentication พร้อม Role-Based Access Control (RBAC) และ Role Permission Matrix ภายในระบบ

B) Active Directory / LDAP / Single Sign-On (SSO) Integration (OAuth2 / OIDC)

C) Simple Session-based Authentication พร้อม Role Management

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5: Document Signature & Approval Workflow
ขั้นตอนการอนุมัติสัญญาและแบบฟอร์มขอเปิดรหัส (F-CM-035, F-CM-018) ต้องการให้รองรับกระบวนการลงนามแบบใด?

A) Digital/Electronic Signature Workflow ภายในระบบ (ลงนามอิเล็กทรอนิกส์ + แนบ e-Signature + Audit Timestamp) ควบคู่กับการติดตามการรับ-ส่งเอกสารฉบับจริง (Hard Copy Tracking)

B) Electronic Approval Workflow (คลิกปุ่มอนุมัติ/ตีกลับตามลำดับขั้นพร้อมบันทึกประวัติ) และส่งเอกสารจริงเพื่อลงนามภายนอก

C) บูรณาการร่วมกับระบบ E-Signature ภายนอก (เช่น DocuSign, Adobe Sign)

X) Other (please describe after [Answer]: tag below)

[Answer]: A แต่เรามีระบบบขออนุมัติลงนามเอกสารภายในอยู่แล้วชื่อ EAS 

---

## Question 6: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7: Resiliency Extensions
Should the resiliency baseline be applied to this project?

**What this extension is:** Enabling it applies a set of **directional, design-time best practices** for building resilient systems, derived from the **AWS Well-Architected Framework (Reliability Pillar)** and resilience-review guidance. It steers requirements, design, and code toward fault tolerance, high availability, observability, and recoverability.

**What this extension is NOT:** Enabling it does **not** make your workload production-ready, nor does it certify or guarantee any availability, RTO, or RPO target.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads, as an informed starting point that you can validate and harden before go-live)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
