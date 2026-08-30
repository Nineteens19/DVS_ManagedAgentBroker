# Infrastructure Design Plan — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

## Purpose
This plan details the infrastructure configurations, database indexing strategies, environment secrets, and deployment topologies for **Unit 5: Automated Provisioning & Background SLA Suspension Daemon**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Infrastructure Architecture (`infrastructure-design.md`)**
  - [x] `ProvisioningSettings` in `appsettings.json` and production environment overrides
  - [x] Database index optimizations for SLA timer sweeps (`Sla30DayDeadline`, `Sla90DayDeadline`, `Status`) and `CoreSyncTransactions`
  - [x] Background worker health check and diagnostic logging

- [x] **Step 2: Define Deployment Architecture (`deployment-architecture.md`)**
  - [x] API endpoints and secret injection for Deves Master, AS400, APAR, SAP, PCSDIS
  - [x] HostedService lifecycle in containerized environments (Kubernetes / Docker)

---

## Planning Questions for Unit 5 Infrastructure Design

Please answer the following questions to help guide the infrastructure specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Local Dev & Testing Sandbox Mode
สำหรับการพัฒนาและรัน Test ในเครื่อง Local และ CI Pipeline ต้องการกำหนดค่าเริ่มต้นของ External Core Adapters อย่างไร?

A) Default `UseSandboxSimulators = true` ใน `appsettings.Development.json` (จำลองการตอบสนองสำเร็จทันทีของ Deves Master, AS400, APAR, SAP, PCSDIS พร้อมสร้าง Mock Transactions) โดยเปลี่ยนเป็น `false` เฉพาะใน Staging/Prod เพื่อต่อเชื่อมระบบจริง *(Recommended)*

B) บังคับต่อเชื่อม Mock Server ภายนอกผ่าน HTTP ตลอดเวลา

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Database Indexing for High-Performance SLA Sweeps
เพื่อรองรับการสแกนใบสมัครจำนวนมากใน Background Daemon โดยไม่ทำให้ Table Lock ต้องการสร้าง Index อย่างไร?

A) **Optimized Composite Filtered Indexes**:
   - `IX_AgentApplications_Status_Sla30Day` บน `(Status, Sla30DayDeadline)`
   - `IX_AgentApplications_Status_Sla90Day` บน `(Status, Sla90DayDeadline)`
   - `IX_CoreSyncTransactions_ApplicationId_TargetSystem` สำหรับตรวจสอบประวัติการ sync *(Recommended)*

B) ใช้ Basic Table Scan ปกติ

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
