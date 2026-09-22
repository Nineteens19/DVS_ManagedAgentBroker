# System Components — Agent & Broker Management System

This document specifies the high-level functional components, their responsibilities, and boundary interfaces structured according to Clean Architecture principles.

---

## 1. Architectural Layers Overview

```
+-------------------------------------------------------------------------+
|                  Presentation Layer (Web API & Next.js)                 |
|  - API Controllers, Next.js Pages, React Components, Auth Middleware    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        Application Service Layer                        |
|  - Application Intake, Compliance Orchestrator, EAS Workflow,           |
|    100% Automated Provisioning Engine, SLA Suspension Watcher           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           Core Domain Layer                             |
|  - Entities: Application, Agent, Guarantor, Collateral, ComplianceCheck |
|  - Value Objects, Domain Events, State Machine Invariants, Interfaces   |
+-------------------------------------------------------------------------+
                                    ^
                                    |
+-------------------------------------------------------------------------+
|                       Infrastructure Service Layer                      |
|  - EF Core SQL Server DbContext, External API Adapters (AS400, SAP,     |
|    APAR, PCSDIS, AMLO, OIC, EAS), Encrypted Storage, Background Daemon |
+-------------------------------------------------------------------------+
```

---

## 2. Core Domain Components (`Domain`)

### 2.1 `AgentApplicationAggregate`
- **Purpose**: Encapsulates the entire lifecycle and state invariants of an agent/broker onboarding request (F-CM-035 & F-CM-018).
- **Responsibilities**:
  - Enforce status transitions: `DRAFT` $\rightarrow$ `SUBMITTED_BRANCH` $\rightarrow$ `REVIEW_HO_BU` $\rightarrow$ `PENDING_EAS_APPROVAL` $\rightarrow$ `REVIEW_PREMIUM` $\rightarrow$ `CORE_AUTO_PROVISIONING` $\rightarrow$ `ACTIVE_TEMPORARY` $\rightarrow$ `REVIEW_LEGAL_ORIGINAL` $\rightarrow$ `ACTIVE_PERMANENT` / `SUSPENDED_30D` / `TERMINATED_90D` / `REJECTED`.
  - Validate credit limits, credit terms (Motor 15/30/31d, Non-Motor $\le$ 45d), guarantor salary ratios, and required document attachments.
  - Track provisional selling rights validity and defect checklists.

### 2.2 `ComplianceScreeningEntity`
- **Purpose**: Records AMLO (ปปง.) and OIC (คปภ.) screening results.
- **Responsibilities**:
  - Maintain sanction check status, PEP flags, and license validity timestamps.
  - Store OIC color rating (`GREEN`, `YELLOW`, `ORANGE`, `RED`) with evidence reference.

### 2.3 `CoreProvisioningTransactionEntity`
- **Purpose**: Tracks idempotent provisioning status across core enterprise systems.
- **Responsibilities**:
  - Record execution status, correlation ID, retry counts, and payloads for AS400, APAR, SAP, and PCSDIS.
  - Prevent duplicate provisioning runs via idempotency keys.

### 2.4 `PhysicalContractRecordEntity`
- **Purpose**: Manages the physical hard-copy document lifecycle, SLA defect timers, and ISO 27001 archive records.
- **Responsibilities**:
  - Track physical document movement: Branch $\rightarrow$ Head Office $\rightarrow$ Legal Dept $\rightarrow$ Archive.
  - Maintain 30-day SLA defect countdown timer and 90-day expiration timer.
  - Trigger automatic submission suspension flag upon timer expiry.

---

## 3. Application Services (`Application`)

### 3.1 `ApplicationIntakeService`
- **Purpose**: Handles intake, drafting, validation, and attachment linking for Forms F-CM-035 and F-CM-018.
- **Responsibilities**:
  - Generate unique application tracking numbers (`APP-YYYYMMDD-XXXX`).
  - Validate inputs and persist draft/submitted applications.
  - Process structured reject checklists and return requests to branches.

### 3.2 `ComplianceOrchestratorService`
- **Purpose**: Orchestrates automated background screening with AMLO and OIC APIs.
- **Responsibilities**:
  - Send applicant and guarantor data to `IAmloApiClient` and `IOicApiClient`.
  - Evaluate risk tiers and route high-risk profiles for Division Director approval.

### 3.3 `EasApprovalService`
- **Purpose**: Integrates with the internal EAS (Electronic Approval System) for executive signatures.
- **Responsibilities**:
  - Compile summary bundle and dispatch approval requests to EAS REST API.
  - Process inbound EAS webhook callbacks, verify digital signature metadata, and transition workflow state.

### 3.4 `AutomatedCoreProvisioningService`
- **Purpose**: Executes 100% automated background multi-system provisioning (zero manual IT tasks).
- **Responsibilities**:
  - Transform 100% complete intake payload and call `IDevesMasterApiClient.ProvisionAgentAndSourceAsync` to create Agent Code and Source Code(s) in Deves Master.
  - Coordinate cascading downstream sync to `IAs400ApiClient`, `IAparApiClient`, `ISapApiClient`, and `IPcsdisApiClient`.
  - Configure Unit Executive (UE), node bindings, and commission percentage schedules.
  - Grant provisional selling permissions (`ACTIVE_TEMPORARY`) upon successful provisioning and start the 30/90-day SLA timer.

### 3.5 `SlaSuspensionDaemonService`
- **Purpose**: Background worker daemon that monitors SLA deadlines and executes tiered automated selling suspensions.
- **Responsibilities**:
  - Scan active temporary applications daily for SLA breaches (> 30 days without hard copy / uncorrected defects).
  - Automatically call `IDevesMasterApiClient` and `IAs400ApiClient` to execute tiered suspensions:
    - Agent-level: locks agent code and cascades suspension to all linked sources.
    - Source-level: locks specific branch/source channel while leaving other sources active.
  - Automatically call core APIs to set status to `TERMINATED_PERMANENT` for expired contracts (> 90 days).

### 3.6 `DashboardAndReportingService`
- **Purpose**: Serves aggregated metrics, SLA countdown feeds, and monthly Credit Committee exports.
- **Responsibilities**:
  - Provide role-filtered KPI summaries (Pending HO, Pending EAS, Active Temporary, Suspended).
  - Generate monthly Credit Committee reports in Excel and PDF formats.

---

## 4. Infrastructure & Integration Adapters (`Infrastructure`)

| Component / Adapter | Interface Contract | Target System / Protocol | Description |
|---|---|---|---|
| `DevesMasterApiClient` | `IDevesMasterApiClient` | Deves Master Core (REST/JSON) | 100% Automated Provisioning: creates Agent Code, Source Code(s), and registers UE. |
| `As400ApiClient` | `IAs400ApiClient` | AS400 Core API (REST/JSON) | Synchronizes agent master, sets temporary/permanent selling rights, and triggers auto-suspension. |
| `SapApiClient` | `ISapApiClient` | SAP Financials API (REST/OData) | Creates and maintains Business Partner / Vendor accounting entities. |
| `AparApiClient` | `IAparApiClient` | APAR Accounts API (REST/JSON) | Configures Accounts Payable and Receivable ledgers. |
| `PcsdisApiClient` | `IPcsdisApiClient` | PCS / PCSDIS API (REST/JSON) | Sets up policy nodes, Unit Executive (UE) mappings, and commission percentage schedules. |
| `EasApiClient` | `IEasApiClient` | EAS E-Approval API (REST/JSON + Webhooks) | Submits approval packets to internal EAS and receives digital signature webhooks. |
| `AmloApiClient` | `IAmloApiClient` | AMLO Sanction API (REST/JSON) | Screens against Designated Persons and PEP databases. |
| `OicApiClient` | `IOicApiClient` | OIC Blacklist API (REST/JSON) | Verifies broker license validity and retrieves disciplinary color ratings. |
| `EncryptedStorageService` | `IStorageService` | Azure Blob / S3 / Local Secure Storage | AES-256 encrypted file storage with antivirus and MIME validation. |

---

## 5. Presentation Layer (`Web API` & `Frontend`)

### 5.1 ASP.NET Core 8 Web API (`ManagedAgentBroker.Api`)
- REST API Controllers (`/api/v1/applications`, `/api/v1/compliance`, `/api/v1/eas`, `/api/v1/provisioning`, `/api/v1/sla`, `/api/v1/dashboard`).
- Middleware: JWT/OAuth2 Authentication, RBAC Authorization filters, Structured JSON Logging, Security Headers, Global Exception Handling.

### 5.2 Next.js 14+ Enterprise Web Portal (`ManagedAgentBroker.Web`)
- Role-based portal for Branch BU, HO BU, Premium Dept, Legal Dept, Executive Approver, and IT Admin.
- Key modules: Application Intake Form, Document Scanner/Uploader, Interactive Reject Checklist Modal, EAS Approval Status Tracker, SLA Countdown Dashboard, and Credit Committee Reporting Studio.
