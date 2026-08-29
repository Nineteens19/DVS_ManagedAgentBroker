# Application Design Plan

## Purpose
This plan outlines the methodology and execution steps to design the high-level components, services, and communication architecture for the **Agent & Broker Management System**.

---

## Execution Checklist

- [x] **Step 1: Define System Components (`components.md`)**
  - [x] Domain Layer Components (Agent, Application, Guarantor, Collateral, ComplianceCheck, ContractRecord)
  - [x] Application Layer Service Interfaces (IApplicationService, IComplianceService, IEasService, IProvisioningService, ISlaWatcherService)
  - [x] Infrastructure Layer Connectors (As400Adapter, SapAdapter, AparAdapter, PcsdisAdapter, AmloAdapter, OicAdapter, EasAdapter)
  - [x] Presentation Layer Components (ASP.NET Core Web API Controllers, Next.js UI Modules)

- [x] **Step 2: Define Component Methods & Contracts (`component-methods.md`)**
  - [x] Intake & Validation Method Signatures (CreateApplication, UploadAttachment, ValidateGuarantorSalary)
  - [x] Compliance & Screening Signatures (RunAmloCheck, RunOicCheck, EvaluateRiskScore)
  - [x] Approval & EAS Signatures (SubmitToEas, HandleEasWebhookCallback, IssueRejectChecklist)
  - [x] 100% Automated Provisioning Signatures (ProvisionAllCoreSystems, SetupPcsdisNodeAndUe, SyncAparSap)
  - [x] SLA & Auto-Suspension Signatures (CheckSlaBreaches, AutoSuspendSellingRights, AutoTerminateExpired)

- [x] **Step 3: Define Service Orchestration (`services.md`)**
  - [x] Application Intake & Review Orchestrator
  - [x] EAS Executive Signature Integration Flow
  - [x] Core Multi-System Provisioning Event Pipeline (Idempotent execution with retry queue)
  - [x] SLA Watcher Background Daemon (30-day auto-suspend & 90-day auto-terminate scheduler)

- [x] **Step 4: Map Component Dependencies & Communication Patterns (`component-dependency.md`)**
  - [x] Dependency Injection matrix across Domain, Application, Infrastructure, and API
  - [x] Component communication sequences and event data flows (Mermaid diagrams)

- [x] **Step 5: Consolidate Unified Architecture Document (`application-design.md`)**
  - [x] Combine all design models into a master architecture specification.

---

## Planning Questions for Application Design

Please answer the following questions to help finalize architectural patterns. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Backend Architecture Structure (.NET Core)
คุณต้องการให้จัดโครงสร้างโค้ด Backend (.NET Core 8 Web API) ในรูปแบบใด?

A) Clean Architecture / Onion Architecture (แบ่งแยก Domain, Application/CQRS, Infrastructure, และ Web API อย่างชัดเจน)

B) Modular Layered Architecture (แบ่งแยกเป็น Layers: Controllers, Services, Repositories, Entities)

C) Vertical Slice Architecture (จัดกลุ่มโค้ดตาม Feature/Use Case แต่ละโมดูล)

X) Other (please describe after [Answer]: tag below)

[Answer]:  A

---

### Question 2: Background Worker & Scheduler Strategy (SLA Timers & Core Auto-Provisioning)
สำหรับงาน Background Flow (การสร้างรหัสใน AS400/SAP อัตโนมัติ และ Daemon ตรวจสอบ SLA 30 วัน/90 วัน เพื่อระงับการส่งงาน Auto) ต้องการใช้กลไกใด?

A) ASP.NET Core Hosted Background Service (`BackgroundService` / `IHostedService` + Channel/Queue สำหรับประมวลผลงานแบบ Asynchronous และ Timer)

B) Quartz.NET / Hangfire Embedded Scheduler (มี Dashboard ควบคุมคิวงานและ Retry policies)

C) Cloud Task / Message Queue (Azure Service Bus / RabbitMQ)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: External System Integration & Mocking Architecture
เพื่อรองรับการทำงานในสภาพแวดล้อม Development / Staging โดยที่ระบบภายนอก (AS400, SAP, APAR, PCSDIS, AMLO, OIC, EAS) อาจยังไม่มี Sandbox พร้อมทดสอบ ต้องการให้ออกแบบ Adapter อย่างไร?

A) Ports & Adapters (Interface-Driven) พร้อม Feature Flag/Configuration (`UseMockServices: true/false`) ให้สามารถสลับระหว่าง Realistic In-Memory Simulation และ Real HTTP/REST/SOAP Client ได้โดยไม่ต้องแก้โค้ด

B) Mock Service Handlers แยกผ่าน External Mock Server (เช่น WireMock / Mock Server Container)

C) พัฒนาเฉพาะ Real Connector เชื่อมต่อกับ Configured Endpoints โดยตรง

X) Other (please describe after [Answer]: tag below)

[Answer]: ทุกระบบรอบข้างต้อง Provide api ให้ใช้

---
