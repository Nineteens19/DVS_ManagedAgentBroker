# System Requirements Specification (SRS) - Agent & Broker Management System

## 1. Intent Analysis Summary
- **User Request**: `/aidlc /Users/nineteen/DVS/managedAgentBroker/SRS , /Users/nineteen/DVS/managedAgentBroker/detail` with specified stack (.NET Core, Next.js, MS SQL Server, EAS workflow integration, AD/SSO auth).
- **Request Type**: New Project (Greenfield system design and implementation based on enterprise SRS, BPMN/Draw.io flows, ISO QP-CM-004, and business rules).
- **Initial Scope Estimate**: System-wide (Full-stack web application encompassing multi-branch agent onboarding, compliance verification, multi-department approval workflow, electronic signing via EAS, external system synchronization, and SLA/audit dashboards).
- **Initial Complexity Estimate**: Complex (Involves multi-role state machine, strict compliance checks, automated suspension logic, external core system synchronizations, and enterprise security/resiliency standards).
- **Requirements Depth**: Comprehensive

---

## 2. Business Overview & Objectives
The **Agent & Broker Management System (ระบบบริหารจัดการตัวแทนนายหน้า)** transforms the legacy manual, paper-based agent/broker onboarding process into a fully digitized, compliant, and automated enterprise system.

### Key Objectives:
1. **Digitize Agent Application & Contracting**: Replace physical paper forms (`F-CM-035` and `F-CM-018`) and postal mail transfer with a digital portal and automated document processing.
2. **Eliminate Compliance & Fraud Risks**: Enforce automated Anti-Money Laundering (AMLO / สำนักงาน ปปง.) and Office of Insurance Commission (OIC / สำนักงาน คปภ.) blacklist and license checks prior to agent code activation.
3. **Automate Core System Provisioning**: Automatically generate Agent/Source codes and configure Unit Executive (UE) and commission structures across Deves Mastermanagement, AS400, APAR, SAP, and PCS/PCSDIS upon approval.
4. **End-to-End SLA & Document Tracking**: Provide real-time dashboards for branch offices, head office business units, premium department, and legal department.
5. **Contract Lifecycle & Auto-Suspension**: Track physical hard-copy contract return within regulatory timelines (30-day temporary suspension, 90-day permanent termination) complying with ISO27001 and audit standards.
6. **EAS Internal Approval Integration**: Seamlessly integrate with the organization's existing internal electronic approval system (**EAS**) for authorized management signatures.

---

### 2.1 System Terminology & Glossary (ตารางถอดรหัสคำศัพท์และตัวย่อภาษาไทย)
เพื่อให้ทุกส่วนงานมีความเข้าใจตรงกันและลดความสับสนจากคำศัพท์ภาษาอังกฤษ/ตัวย่อ ระบบได้กำหนดนิยามภาษาไทยที่เป็นมาตรฐานดังนี้:

| ตัวย่อ / ศัพท์อังกฤษ | ความหมายภาษาไทย (เข้าใจง่าย) | คำอธิบายและบริบทการใช้งานในระบบ |
|---|---|---|
| **AMLO** | **สำนักงาน ปปง.** (ป้องกันและปราบปรามการฟอกเงิน) | การตรวจคัดกรองรายชื่อบุคคลที่ถูกกำหนด (Sanctions List) และบุคคลที่มีสถานภาพทางการเมือง (PEP) ก่อนเปิดรหัสตัวแทน |
| **OIC** | **สำนักงาน คปภ.** (กำกับและส่งเสริมการประกอบธุรกิจประกันภัย) | การตรวจสอบความถูกต้องของใบอนุญาตตัวแทน/นายหน้า และตรวจสอบประวัติการถูกเพิกถอนใบอนุญาต (Blacklist) |
| **PEP** | **บุคคลที่มีสถานภาพทางการเมือง** (Politically Exposed Persons) | ผู้ดำรงตำแหน่งทางการเมืองหรือครอบครัว หากตรวจพบจะต้องเสนอให้ผู้บริหารระดับสูง (MD) พิจารณาอนุมัติเป็นกรณีพิเศษ |
| **SLA** | **กำหนดเวลาดำเนินการตามเกณฑ์** (ระยะเวลาผ่อนผัน 30 วัน) | ระยะเวลากำหนดส่งสัญญาฉบับจริง (F-CM-018) เข้าคลังเอกสารภายใน 30 วัน หากเกินระบบจะระงับการขายอัตโนมัติ |
| **Branch BU** | **ฝ่ายธุรกิจสาขา** (สาขาผู้ยื่นคำขอ) | เจ้าหน้าที่สาขาที่ทำหน้าที่กรอกใบสมัคร (F-CM-035), อัปโหลดเอกสารประกอบ และจัดส่งสัญญาฉบับจริง |
| **HO BU** | **ฝ่ายธุรกิจสำนักงานใหญ่ (สนญ.)** | เจ้าหน้าที่สำนักงานใหญ่ที่ตรวจรับเอกสาร, ตรวจ ปปง./คปภ., และส่งต่อผู้บริหาร |
| **Premium Dept** | **ฝ่ายบริหารจัดการเบี้ยประกันภัย** | ฝ่ายที่ตรวจสอบวงเงินสินเชื่อ, ตรวจสอบหลักทรัพย์ค้ำประกัน, และส่งคำสั่งเปิดรหัสเข้าระบบหลัก |
| **Legal Dept** | **สำนักนิติกรรม (ฝ่ายกฎหมาย)** | ฝ่ายที่ตรวจสอบความสมบูรณ์ทางนิติกรรม, ตรวจรับสัญญาฉบับจริง (F-CM-018), ลงทะเบียนกล่องจัดเก็บ และปลดล็อกเปิดขายถาวร |
| **Approver MD** | **กรรมการผู้จัดการ / ผู้มีอำนาจลงนาม** | ผู้บริหารระดับสูงที่ลงนามพิจารณาอนุมัติคำขอเปิดตัวแทนผ่านระบบอิเล็กทรอนิกส์ |
| **Core Provisioning** | **การเปิดรหัสและเชื่อมโยงระบบหลักอัตโนมัติ** | การสร้างรหัสตัวแทน (Agent Code) และรหัสช่องทาง (Source Code) ในระบบ Deves Master และเชื่อมต่อไปยัง AS400, APAR, SAP, PCSDIS แบบ 100% Zero-Touch |
| **Active Temporary** | **เปิดขายชั่วคราว (ผ่อนผันส่งสัญญา 30 วัน)** | สถานะที่ตัวแทนได้รับรหัสและสามารถเริ่มส่งงานขายได้ทันที โดยอยู่ระหว่างรอจัดส่งเอกสารสัญญาตัวจริงภายใน 30 วัน |
| **Active Permanent** | **เปิดขายถาวร (จัดเก็บสัญญาครบถ้วน)** | สถานะที่ฝ่ายกฎหมายได้รับและจัดเก็บเอกสารสัญญาฉบับจริงลงกล่องเรียบร้อยแล้ว สิ้นสุดการนับเวลาผ่อนผัน |
| **Suspended (30D)** | **ระงับการขายชั่วคราว (เกินกำหนด 30 วัน)** | สถานะที่ระบบ Daemon ระงับสิทธิ์การส่งงานขายในระบบหลักอัตโนมัติ เนื่องจากไม่ส่งสัญญาฉบับจริงภายใน 30 วัน |
| **Terminated (90D)** | **เพิกถอนรหัสถาวร (เกินกำหนด 90 วัน)** | สถานะที่ระบบเพิกถอนรหัสตัวแทนอย่างถาวร หลังถูกระงับสิทธิ์เกิน 90 วัน |
| **UE (Unit Executive)** | **สายงานบริหารตัวแทน (Unit Executive)** | รหัสสังกัดและโครงสร้างสายงานการบริหารตัวแทนในระบบ PCSDIS |
| **AS400 / Core** | **ระบบงานหลักประกันภัย (Core Insurance)** | ระบบหลักที่ใช้ออกกรมธรรม์และบันทึกสิทธิ์การขายของตัวแทน |
| **APAR / SAP** | **ระบบบัญชีลูกหนี้-เจ้าหนี้ และการเงิน** | ระบบบันทึกบัญชีเจ้าหนี้ตัวแทนเพื่อการจ่ายเงินผลประโยชน์และค่าคอมมิชชั่น |
| **PCS / PCSDIS** | **ระบบโครงสร้างค่าคอมมิชชั่น** | ระบบจัดการโครงสร้างอัตราผลประโยชน์และค่าตอบแทนตัวแทน |


---

## 3. Stakeholder Roles & User Personas
| Role Code | Role Name (TH) | Primary Responsibilities |
|---|---|---|
| `ROLE_BRANCH_BU` | ฝ่ายธุรกิจสาขา (BU สาขา) | กรอกข้อมูลใบสมัคร, สแกนและอัปโหลดเอกสารประกอบ, สร้างเลขที่คำขอ/สัญญา, ติดตามสถานะ, จัดส่งเอกสารฉบับจริง |
| `ROLE_HO_BU` | ฝ่ายธุรกิจ สนญ. (BU สนญ.) | ตรวจสอบความครบถ้วนของเอกสาร, ตรวจสอบรายชื่อ ปปง./คปภ., เสนอผู้บริหารฝ่ายพิจารณา, จัดทำเรื่องส่งต่อ |
| `ROLE_PREMIUM_DEPT` | ฝ่ายบริหารจัดการเบี้ยประกันภัย | ตรวจสอบวงเงินเครดิต (Credit Line) กับหลักทรัพย์ค้ำประกัน, ตรวจสอบเงินเดือนผู้ค้ำประกัน, จัดการค่าคอมมิชชั่น/UE ใน PCSDIS |
| `ROLE_LEGAL_DEPT` | สำนักนิติกรรม | ตรวจสอบความถูกต้องทางกฎหมายของเอกสารชุดสัญญา F-CM-018, รับเอกสารฉบับจริง, ตรวจสอบรายปี (Auditor), สั่งแก้ไข/ระงับรหัส |
| `ROLE_APPROVER_MD` | ผู้มีอำนาจลงนาม / ผู้บริหาร (MD, รอง ผอ., ผอ., ผช.กจก.) | ลงนามอนุมัติคำขอเปิดตัวแทนและชุดสัญญาผ่านระบบ EAS / E-Approval |
| `ROLE_IT_ADMIN` | ฝ่ายพัฒนาระบบ / ผู้ดูแลระบบ (IT Administrator) | กำหนดสิทธิ์, ดูแลความมั่นคงปลอดภัยระบบ, เฝ้าระวังระบบงานและ SLA Daemon, บริหารจัดการ Exception และการเชื่อมต่อ Auto-Sync อัตโนมัติระหว่างระบบ |

---

## 4. Functional Requirements (FR)

### Module 1: Agent & Broker Application Intake (F-CM-035)
- **FR-1.1 Application Form Entry**: Support digital entry of Agent/Broker details (Individual / Corporate), Tax ID, Identification Card, Address, Bank Account, Branch Code, Handler Code, Credit Limit, and Credit Term (Motor 15/30/31 days, Non-Motor <= 45 days).
- **FR-1.2 Guarantor & Collateral Entry**: Record guarantor information, employment, monthly income validation against credit limit, and collateral asset details.
- **FR-1.3 Document Upload & Attachment Management**: Multi-file attachment upload for ID card, broker license, bank book, collateral certificate, and consent forms with file validation and virus scanning.
- **FR-1.4 Application & Contract Numbering**: Automatic unique application tracking ID and standardized enterprise contract number format: `BU-{YYYY}-{Running 5 digits}` (e.g., `BU-2026-00001`). Support linking to `PreviousContractRef` when cloning/re-applying.
- **FR-1.5 Mandatory Schema Validation for 100% Automated Deves Mastermanagement Intake**:
  - Frontend and Backend enforce strict schema validation ensuring 100% data completeness required by **Deves Mastermanagement** before any application can be submitted.
  - Required fields include: Full Thai & English Names, Citizen ID Checksum (Modulo 11) / Corporate Tax ID, Complete Registered & Mailing Addresses with Postal Code, Bank Account & Branch for Commission Payout, Valid OIC License Number & Expiry Date, Branch/Handler Code, Approved Credit Limit & Terms, Guarantor Income/Workplace, Collateral Valuation (`Collateral >= Credit Limit`), and Attached AMLO/OIC Screening Evidence.
  - System prohibits submission if any Deves Master mandatory field is missing, ensuring zero-defect data that enables **100% automated, touchless provisioning without human IT re-keying**.

### Module 2: Compliance & Risk Screening (ปปง. & คปภ.)
- **FR-2.1 AMLO Screening (ปปง.)**: Automated check against Designated Persons List and High-Risk PEP lists.
  - *Designated Person Match*: Immediate rejection alert, screen capture attachment, report generation for executive and AMLO office.
  - *High-Risk Person Match*: Flag for Division Director approval consideration.
- **FR-2.2 OIC Blacklist & License Screening (คปภ.)**: Real-time license validity check and disciplinary status classification:
  - *Red Status*: Immediate rejection alert to agent.
  - *Orange Status*: Route to Division Director for risk evaluation.
  - *Yellow Status*: Flag caution for onboarding with contract bundle.
  - *Green Status*: Pass compliance check.

### Module 3: Multi-Stage Workflow & Approval Engine
- **FR-3.1 Stage Progression State Machine**:
  - `DRAFT` → `SUBMITTED_BRANCH` → `REVIEW_HO_BU` → `PENDING_APPROVAL` → `REVIEW_PREMIUM` → `AUTO_PROVISIONING_DEVES_MASTER` (ระบบส่งเปิดรหัสอัตโนมัติ 100%) → `ACTIVE_TEMPORARY` (เปิดขายชั่วคราวอัตโนมัติทันที) → `REVIEW_LEGAL_ORIGINAL` → `ACTIVE_PERMANENT` (เปิดขายถาวร) / `SUSPENDED_30D` (ระงับการส่งงาน Auto) / `TERMINATED_90D` (ระงับถาวร) / `REJECTED`.
- **FR-3.2 Provisional Selling Rights (เปิดขายชั่วคราวอัตโนมัติ 100%)**:
  - Immediately upon Executive and Premium approval, the system **automatically triggers the integration payload to Deves Mastermanagement** to generate the Agent Code and Source Code(s).
  - Upon receiving the generated codes, the system automatically transitions the status to `ACTIVE_TEMPORARY`, granting provisional selling permissions immediately without human manual intervention, and initiating the 30/90 calendar-day SLA tracking window.
- **FR-3.3 Dual Reject/Correction Workflow**:
  - *In-Place Amendment*: The rejecting department (HO BU, Premium, or Legal) re-opens the application directly into `RETURNED_FOR_CORRECTION` with granular checklist remarks, allowing the branch to upload corrected files under the existing contract number.
  - *Re-submission with History*: If fully rejected/canceled, support cloning into a new application while retaining `PreviousContractRef` to preserve historical continuity.
- **FR-3.4 Native Approval & Microsoft Approvals Integration**:
  - Provide direct one-click executive approval and digital signature on the Web Portal.
  - Integrate with Microsoft Approvals (Power Automate / Teams / Outlook Adaptive Cards) to match executive workflow habits.
- **FR-3.5 Action-to-Flow Impact Matrix & Cascade State Invariants**:
  - Every action executed by any stakeholder or automated daemon directly changes the state machine and impacts downstream processes:
    - **Approve Action**: Moves application forward to the next department's queue. When Premium approves, automatically triggers 100% automated Deves Master provisioning (`FR-4.1`). When Legal approves physical documents, automatically transitions to `ACTIVE_PERMANENT` and clears SLA timers.
    - **Reject Action**: Immediately terminates the workflow into terminal state `REJECTED`, blocks further routing to downstream departments, forbids code generation, and logs reason/evidence. If an application is rejected after provisional selling, system automatically triggers immediate code locking/termination in Deves Master & AS400.
    - **Return for Correction Action (`RETURNED_FOR_CORRECTION`)**: Halts forward progression, records department checklist remarks, and routes back to the Branch requester. Application cannot advance to subsequent stages until branch resubmits.
    - **SLA Breach Actions (Auto-Suspend & Auto-Terminate)**: Timers calculated from `ACTIVE_TEMPORARY` date. At Day 30 without physical contract verification, daemon automatically locks selling rights in Deves Master/AS400; at Day 90, daemon automatically permanently terminates the codes.
    - **State Transition Guard Invariant**: Strict sequence enforcement. No stage skipping is permitted (e.g., Branch cannot bypass HO BU, no provisioning can occur without prior MD and Premium approval).

### Module 4: 100% Automated Deves Mastermanagement Provisioning & Core Integration
- **FR-4.1 100% Automated Deves Mastermanagement Provisioning**:
  - Model strict 1:N hierarchy: **1 Agent Entity can hold Multiple Source Codes** (e.g. branch channels, specific products).
  - Immediately upon approval by the Premium Department, the backend automatically transforms the 100% validated application payload and calls the **Deves Mastermanagement API / Service Layer** to open the Agent Code and Source Code(s).
  - Zero manual data re-entry: fully automated system-to-system orchestration without requiring IT staff to manually key in data.
  - The generated Agent Code, Source Code, and UE Code are automatically captured, mapped, and persisted back to the application record.
- **FR-4.2 Automated Multi-System Synchronization (AS400, APAR, SAP, PCS/PCSDIS)**:
  - Automatically cascade and synchronize the newly provisioned Agent/Source codes across downstream systems:
    - **AS400**: Activate agent selling authority and policy issuance capability.
    - **APAR / SAP**: Create accounting ledger account and vendor master for commission payout.
    - **PCS / PCSDIS**: Synchronize Unit Executive (UE) reporting tree and commission schedule.
- **FR-4.3 Resilient Retry, Idempotency & IT Exception Handling**:
  - All provisioning calls execute via asynchronous background job queues with exponential backoff retry and circuit breaker protection.
  - Operations are strictly idempotent to prevent duplicate agent/source code creation.
  - IT Administrators are provided with an **Exception & Audit Dashboard** solely to monitor sync health, view delivery logs, or manually trigger a retry if an external service encounters network downtime.

### Module 5: SLA Document Tracking & Automated Hierarchy Suspension
- **FR-5.1 Hard-Copy Lifecycle & SLA Timers**:
  - Track physical contract document package movement from Branch -> Head Office -> Premium -> Legal Dept -> Physical Archive.
  - SLA timer runs on **Calendar Days** starting from `ACTIVE_TEMPORARY` activation date.
- **FR-5.2 Tiered Selling Suspension on SLA Breach (30-Day Auto Suspend / ระงับการส่งงาน Auto)**:
  - *Agent-Level Suspension*: If primary contract SLA (30 calendar days) breaches, system triggers cascading suspension of the Agent Code in AS400, automatically suspending ALL Source codes underneath.
  - *Source-Specific Suspension*: If a specific branch/product condition fails, locks only that particular Agent/Source pair.
- **FR-5.3 Automated Permanent Termination (90-Day Auto Terminate)**:
  - If contract remains uncorrected or unreceived past **90 calendar days**, the system **automatically revokes and permanently terminates the Agent/Source codes** across AS400 and PCS.
- **FR-5.4 Physical Archive & Strict Recipient Audit Logging**:
  - Record permanent archiving of physical contract packages.
  - Mandatorily record **recipient audit log** (User ID, Name, Department, Timestamp, IP) at every hand-off stage (Branch -> HO -> Premium -> Legal).

### Module 6: Executive Reporting & SLA Dashboards
- **FR-6.1 Real-Time Workflow Dashboard**: Role-based operational dashboards displaying pending queues, SLA countdowns, rejection rates, and bottlenecks.
- **FR-6.2 Monthly Credit Committee Report**: Automated export of monthly onboarding reports, credit lines granted, pending contracts, and suspension statuses.

---

## 5. Non-Functional Requirements (NFR)

### Security Requirements (Enforcing Security Baseline & NFR-001..009)
- **NFR-SEC-01 (NFR 001/009)**: Strict Authentication & RBAC. Users cannot access endpoints or pages without authenticated session and authorized role.
- **NFR-SEC-02 (NFR 004)**: Active Directory / LDAP / OAuth2 OIDC Integration for Enterprise SSO.
- **NFR-SEC-03 (NFR 005)**: Account Lockout after 3 failed login attempts with security event logging.
- **NFR-SEC-04 (NFR 002/006)**: Last login tracking (IP, Timestamp) and complete masking/exclusion of passwords, keys, and tokens from logs, sessions, and cookies.
- **NFR-SEC-05 (SECURITY-01)**: Encryption at rest (AES-256 for database and object storage) and encryption in transit (TLS 1.3/1.2 enforced on all APIs and database connections).
- **NFR-SEC-06 (SECURITY-04)**: Strict HTTP security headers (`CSP`, `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`).
- **NFR-SEC-07 (SECURITY-05)**: Parameterized SQL queries via EF Core and strict schema validation for all API inputs.

### Resiliency & Reliability Requirements (Enforcing Resiliency Baseline)
- **NFR-RES-01 (RESILIENCY-01/02)**: Workload Criticality:
  - Workflow API & Agent Intake: Critical (99.9% availability target, RTO < 1 hour, RPO < 15 minutes).
  - External Sync & Notification Dispatcher: High (RTO < 2 hours, RPO < 1 hour).
- **NFR-RES-02 (RESILIENCY-06)**: Resilient integration with circuit breaker, timeout limits, and exponential backoff retry for external systems (AS400, SAP, EAS, AMLO).
- **NFR-RES-03 (RESILIENCY-07)**: Idempotent API endpoints and message consumers to prevent duplicate Agent code provisioning.
- **NFR-RES-04 (RESILIENCY-10)**: Health check endpoints (`/health/live`, `/health/ready`) and centralized structured logging (JSON format with RequestId, TraceId, and Timestamp).

### Testing & Verification Requirements (Enforcing Property-Based Testing)
- **NFR-TEST-01 (PBT-01/02)**: Property-based testing for state transitions (valid state transitions, invalid transition rejection invariant).
- **NFR-TEST-02 (PBT-03)**: Round-trip serialization testing for F-CM-035/F-CM-018 DTOs and database models.
- **NFR-TEST-03 (PBT-05)**: Boundary value testing for credit limit, commission percentages, and timer day calculations (30d, 90d).

---

## 6. Target Technology Architecture
- **Frontend**: Next.js 14+ (React, TypeScript, Tailwind CSS / Modern enterprise UI design system)
- **Backend API**: ASP.NET Core 8 Web API (.NET Core C#)
- **ORM & Data Access**: Entity Framework Core (EF Core) with LINQ
- **Database**: Microsoft SQL Server (MS SQL Server 2022 / Azure SQL)
- **Authentication**: ASP.NET Core Authentication + OpenID Connect / Active Directory integration
- **External Integration Services**: Modular HTTP Client Services with Mock/Simulation fallback mode for AS400, APAR, SAP, PCSDIS, AMLO, OIC, and EAS.
- **Testing Frameworks**: xUnit, FluentAssertions, FsCheck / Bogus (for Property-Based Testing), and Jest/Playwright for Frontend.

---

## 7. Compliance & Extension Verification Matrix
| Extension / Standard | Status | Applicable Stages & Key Controls |
|---|---|---|
| **Security Baseline** | COMPLIANT | Enforced across API design, auth, encryption, input validation, and headers |
| **Resiliency Baseline** | COMPLIANT | Enforced across state machine idempotency, circuit breakers, health checks, and retry policies |
| **Property-Based Testing** | COMPLIANT | Applied to workflow transitions, data serialization, and financial/timer boundary logic |
| **ISO 27001 / Internal Audit** | COMPLIANT | Segregation of duties, comprehensive audit trails, and automatic hard-copy timer enforcement |
