# NFR Design Plan — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

## Purpose
This plan details the technical architecture, service component designs, resilience adapters, and background worker lifecycle patterns for **Unit 5: Automated Provisioning & Background SLA Suspension Daemon**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define NFR Design Patterns (`nfr-design-patterns.md`)**
  - [x] Deves Master API integration adapter and simulated test sandbox pattern
  - [x] Asynchronous multi-system provisioning orchestrator pattern (`CoreProvisioningService`)
  - [x] Decoupled SLA monitoring engine (`ISlaMonitoringService`) and hosted worker (`SlaMonitoringBackgroundService`) pattern
  - [x] Physical contract archiving transaction boundary pattern

- [x] **Step 2: Define Logical Components (`logical-components.md`)**
  - [x] `IDevesMasterApiClient` & `DevesMasterApiClient` (Simulated Sandbox + REST Client)
  - [x] `ICoreProvisioningService` & `CoreProvisioningService` (orchestrates AS400, APAR, SAP, PCSDIS sync)
  - [x] `ISlaMonitoringService` & `SlaMonitoringService` (evaluates D-7/D-3 warnings, 30-day auto-suspension, 90-day auto-termination)
  - [x] `SlaMonitoringBackgroundService` (`BackgroundService` with `PeriodicTimer` and DI scope factory)
  - [x] `IHardCopyArchiveService` & `HardCopyArchiveService` (legal hard-copy verification)
  - [x] DI registrations in `DependencyInjection.cs`

---

## Planning Questions for Unit 5 NFR Design

Please answer the following questions to help guide the component and interface architecture. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Deves Master & Core System Adapter Architecture
ต้องการออกแบบ Interface และ Adapter สำหรับเชื่อมต่อ Deves Master และระบบ Core 4 ระบบอย่างไร?

A) **Unified Orchestrator + Specialized Adapters with Test Sandbox Support**:
   - `IDevesMasterApiClient`: เชื่อมต่อระบบ Deves Master สร้าง `AgentCode` (เช่น `AG20260001` / `BR20260001`) และ `SourceCode` (เช่น `SRC-B01-0001`) พร้อม Sandbox Mode สำหรับ Dev/Test
   - `ICoreProvisioningService`: Orchestrator ยิง Sync 4 ระบบ (AS400, APAR, SAP, PCSDIS) บันทึก `CoreSyncTransaction` และเปิดขายชั่วคราว (`ActiveTemporary`) ทันทีเมื่อสำเร็จครบ 4 ระบบ *(Recommended)*

B) รวมทุกระบบเข้าไว้ใน Service เดียวแบบ Monolithic

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: SLA Monitoring Engine & Background HostedService Decoupling
ต้องการแยก Service Logic สำหรับการตรวจสอบ SLA ออกจาก HostedService Loop เพื่อให้ง่ายต่อการเขียน Unit/Integration Test อย่างไร?

A) **Decoupled Architecture**:
   - `ISlaMonitoringService`: ทำหน้าที่เป็น Scoped Service ที่มี method `ExecuteSlaSweepAsync()` ค้นหาใบสมัคร, ส่งอีเมลเตือน D-7/D-3, ปรับสถานะ `Suspended30D`, `Terminated90D`
   - `SlaMonitoringBackgroundService`: ทำหน้าที่เป็น `BackgroundService` ควบคุม `PeriodicTimer` และสร้าง `IServiceScope` เพื่อเรียก `ISlaMonitoringService.ExecuteSlaSweepAsync()` ในแต่ละ tick *(Recommended)*

B) เขียน Business Logic ทั้งหมดรวมอยู่ใน `ExecuteAsync` ของ `BackgroundService` โดยตรง

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
