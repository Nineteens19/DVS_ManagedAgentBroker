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
2. **Eliminate Compliance & Fraud Risks**: Enforce automated Anti-Money Laundering (AMLO / ปปง.) and Office of Insurance Commission (OIC / คปภ.) blacklist and license checks prior to agent code activation.
3. **Automate Core System Provisioning**: Automatically generate Agent/Source codes and configure Unit Executive (UE) and commission structures across AS400, APAR, SAP, and PCS/PCSDIS upon approval.
4. **End-to-End SLA & Document Tracking**: Provide real-time dashboards for branch offices, head office business units, premium department, and legal department.
5. **Contract Lifecycle & Auto-Suspension**: Track physical hard-copy contract return within regulatory timelines (30-day temporary suspension, 90-day permanent termination) complying with ISO27001 and audit standards.
6. **EAS Internal Approval Integration**: Seamlessly integrate with the organization's existing internal electronic approval system (**EAS**) for authorized management signatures.

---

## 3. Stakeholder Roles & User Personas
| Role Code | Role Name (TH) | Primary Responsibilities |
|---|---|---|
| `ROLE_BRANCH_BU` | ฝ่ายธุรกิจสาขา (BU สาขา) | กรอกข้อมูลใบสมัคร, สแกนและอัปโหลดเอกสารประกอบ, สร้างเลขที่คำขอ/สัญญา, ติดตามสถานะ, จัดส่งเอกสารฉบับจริง |
| `ROLE_HO_BU` | ฝ่ายธุรกิจ สนญ. (BU สนญ.) | ตรวจสอบความครบถ้วนของเอกสาร, ตรวจสอบรายชื่อ ปปง./คปภ., เสนอผู้บริหารฝ่ายพิจารณา, จัดทำเรื่องส่งต่อ |
| `ROLE_PREMIUM_DEPT` | ฝ่ายบริหารจัดการเบี้ยประกันภัย | ตรวจสอบวงเงินเครดิต (Credit Line) กับหลักทรัพย์ค้ำประกัน, ตรวจสอบเงินเดือนผู้ค้ำประกัน, จัดการค่าคอมมิชชั่น/UE ใน PCSDIS |
| `ROLE_LEGAL_DEPT` | สำนักนิติกรรม | ตรวจสอบความถูกต้องทางกฎหมายของเอกสารชุดสัญญา F-CM-018, รับเอกสารฉบับจริง, ตรวจสอบรายปี (Auditor), สั่งแก้ไข/ระงับรหัส |
| `ROLE_APPROVER_MD` | ผู้มีอำนาจลงนาม / ผู้บริหาร (MD, รอง ผอ., ผอ., ผช.กจก.) | ลงนามอนุมัติคำขอเปิดตัวแทนและชุดสัญญาผ่านระบบ EAS / E-Approval |
| `ROLE_IT_ADMIN` | ฝ่ายพัฒนาระบบ / ผู้ดูแลระบบ | บริหารจัดการระบบ, กำหนดสิทธิ์, ตรวจสอบ Audit Log และ System Health, ดูแล Job Auto-Sync |

---

## 4. Functional Requirements (FR)

### Module 1: Agent & Broker Application Intake (F-CM-035)
- **FR-1.1 Application Form Entry**: Support digital entry of Agent/Broker details (Individual / Corporate), Tax ID, Identification Card, Address, Bank Account, Branch Code, Handler Code, Credit Limit, and Credit Term (Motor 15/30/31 days, Non-Motor <= 45 days).
- **FR-1.2 Guarantor & Collateral Entry**: Record guarantor information, employment, monthly income validation against credit limit, and collateral asset details.
- **FR-1.3 Document Upload & Attachment Management**: Multi-file attachment upload for ID card, broker license, bank book, collateral certificate, and consent forms with file validation and virus scanning.
- **FR-1.4 Application Numbering & Auto-Drafting**: Automatic unique application tracking ID (`APP-YYYYMMDD-XXXX`) and contract number generation.

### Module 2: Compliance & Risk Screening (ปปง. & คปภ.)
- **FR-2.1 AMLO Screening (ปปง.)**: Automated check against Designated Persons List and High-Risk PEP lists.
  - *Designated Person Match*: Immediate rejection alert, screen capture attachment, report generation for executive and AMLO office.
  - *High-Risk Person Match*: Flag for Division Director approval consideration.
- **FR-2.2 OIC Blacklist & License Screening (คปภ.)**: Real-time license validity check and disciplinary status classification:
  - *Red Status*: Immediate rejection alert to agent.
  - *Orange Status*: Route to Division Director for risk evaluation.
  - *Yellow Status*: Flag caution for onboarding with contract bundle.
  - *Green Status*: Pass compliance check.

### Module 3: Multi-Stage Workflow & EAS Approval Engine
- **FR-3.1 Stage Progression State Machine**:
  - `DRAFT` → `SUBMITTED_BRANCH` → `REVIEW_HO_BU` → `PENDING_EAS_APPROVAL` → `REVIEW_PREMIUM` → `CORE_AUTO_PROVISIONING` → `ACTIVE_TEMPORARY` (เปิดขายชั่วคราว) → `REVIEW_LEGAL_ORIGINAL` → `ACTIVE_PERMANENT` (เปิดขายถาวร) / `SUSPENDED_30D` (ระงับการส่งงาน Auto) / `TERMINATED_90D` (ระงับถาวร) / `REJECTED`.
- **FR-3.2 Provisional Selling Rights (เปิดขายชั่วคราว)**:
  - Immediately upon EAS and Premium approval, the system grants provisional selling permissions (`ACTIVE_TEMPORARY`), allowing the agent to commence policy sales during the SLA window.
- **FR-3.3 Reject Checklist & Correction Workflow**:
  - Support standardized multi-item checklist for rejection (e.g. Incomplete ID, Expired License, Mismatched Guarantor Salary, Illegible Signature).
  - Return application with granular remarks to previous stage with notification.
- **FR-3.4 EAS (Electronic Approval System) Integration**:
  - Export approval request bundle (F-CM-035 summary + attachments) to EAS API for MD / Executive digital signature.
  - Receive webhook/callback on approval/rejection status update with signed artifact timestamp.

### Module 4: 100% Automated Core System Provisioning (Zero Manual IT Intervention)
- **FR-4.1 100% Automated Multi-System Provisioning**: Replace legacy manual IT tasks with fully automated event-driven background flows that create and configure Agent/Source across:
  - **AS400 Core System**: Automated agent code generation & status activation.
  - **APAR**: Automated Accounts Payable/Receivable ledger mapping.
  - **SAP Financials**: Automated business partner / vendor creation.
  - **PCS / PCSDIS**: Automated node setup, Unit Executive (UE) assignment, and commission rate schedule.
- **FR-4.2 ISO 27001 Compliant Segregation of Duties**: IT officers no longer perform operational data entry in production; all system accounts and provisioning are executed via machine-to-machine authenticated APIs.
- **FR-4.3 Provisioning Transaction Log & Idempotent Retry**: Resilient transaction orchestration with idempotent retry and fallback alerts if any core subsystem is temporarily unavailable.

### Module 5: SLA Document Tracking & Automated Selling Suspension (Auto Suspend)
- **FR-5.1 Hard-Copy Lifecycle & SLA Timers**:
  - Track physical contract document package movement from Branch -> Head Office -> Legal Dept -> Physical Archive.
  - Enforce clear SLA tracking for hard-copy submission and defect correction.
- **FR-5.2 Automated Selling Suspension on SLA Breach (30-Day Auto Suspend / ระงับการส่งงาน Auto)**:
  - If physical contracts or defect corrections are not completed within the **30-Day SLA**, the system **automatically triggers immediate suspension of policy submission rights (ระงับการส่งงาน Auto)** across AS400 and PCS without requiring human action.
  - Automatically notifies Premium Dept and Branch BU of suspension and initiates debt/commission containment.
- **FR-5.3 Automated Permanent Termination (90-Day Auto Terminate)**:
  - If contract remains uncorrected or unreceived past **90 days**, the system **automatically revokes and permanently terminates the Agent/Source code** across all core systems.
- **FR-5.4 Annual Audit Archive & Compliance**: Archive verified contracts with metadata for annual ISO27001 and external auditor inspection.

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
