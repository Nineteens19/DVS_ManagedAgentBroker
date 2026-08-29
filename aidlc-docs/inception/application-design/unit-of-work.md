# Units of Work Definitions — Agent & Broker Management System

This document specifies the decomposition of the system into 6 discrete, testable Units of Work for construction, along with the Greenfield codebase directory structure.

---

## 1. Greenfield Codebase Organization (Monorepo)

```text
/Users/nineteen/DVS/managedAgentBroker/
├── .agents/                                # AI-DLC Agent Rules & Skills
├── .aidlc-rule-details/                    # AI-DLC Rule Specifications
├── aidlc-docs/                             # AI-DLC Lifecycle Documentation & Audit Trail
│   ├── inception/
│   │   ├── plans/
│   │   ├── requirements/
│   │   ├── user-stories/
│   │   └── application-design/
│   ├── construction/
│   │   ├── plans/
│   │   ├── unit-1-core-domain/
│   │   ├── unit-2-auth-rbac/
│   │   ├── unit-3-intake-documents/
│   │   ├── unit-4-compliance-eas/
│   │   ├── unit-5-provisioning-sla/
│   │   ├── unit-6-nextjs-portal/
│   │   └── build-and-test/
│   ├── aidlc-state.md
│   └── audit.md
├── src/                                    # Application Source Code
│   ├── backend/                            # ASP.NET Core 8 Web API Solution (.NET 8 C#)
│   │   ├── ManagedAgentBroker.Domain/      # Domain Entities, Value Objects, Invariants, Events
│   │   ├── ManagedAgentBroker.Application/ # Commands, Queries, Services, DTOs, Validators
│   │   ├── ManagedAgentBroker.Infrastructure/# EF Core, SQL Server, External Clients, Background Worker
│   │   └── ManagedAgentBroker.Api/         # REST Controllers, Middlewares, Program.cs
│   └── frontend/                           # Next.js 14+ Enterprise Web Portal (TypeScript / React)
│       ├── app/                            # App Router Pages & Layouts
│       ├── components/                     # Reusable Enterprise UI Components
│       ├── hooks/                          # Custom React Hooks
│       ├── lib/                            # API Clients, Types, Constants, Utilities
│       └── styles/                         # Tailwind CSS & Design System
└── tests/                                  # Comprehensive Test Suites
    ├── backend/                            # xUnit, FluentAssertions, FsCheck/Bogus (PBT)
    └── frontend/                           # Playwright E2E & Jest Component Tests
```

---

## 2. Units of Work Specifications

### Unit 1: Core Domain, Database Schema & EF Core Infrastructure
- **Scope**: Core domain model, state transitions, business invariants, and database persistence.
- **Key Deliverables**:
  - `Domain`: `AgentApplicationAggregate`, `GuarantorEntity`, `CollateralEntity`, `ComplianceCheckEntity`, `CoreSyncTransactionEntity`, `PhysicalContractRecordEntity`.
  - `Infrastructure`: `ApplicationDbContext`, EF Core Fluent Configurations, SQL Server 2022 Schema Migrations, Repository implementations, and Initial Seed Data.
  - `Testing`: Unit tests for domain entity validations and property-based tests for state transition invariants (`PBT-01`).

### Unit 2: Authentication, RBAC & Organization Directory Service
- **Scope**: Active Directory / LDAP / OAuth2 OIDC Single Sign-On (SSO) integration and role-based permissions matrix.
- **Key Deliverables**:
  - `Application/Infrastructure`: `IAuthService`, JWT Bearer authentication handler, AD SSO token validator, RBAC permission authorization attributes, and user management.
  - `Roles Supported`: `ROLE_BRANCH_BU`, `ROLE_HO_BU`, `ROLE_PREMIUM_DEPT`, `ROLE_LEGAL_DEPT`, `ROLE_APPROVER_MD`, `ROLE_IT_ADMIN`.
  - `Testing`: Security Baseline authorization tests (`SECURITY-01`, `SECURITY-05`), session timeout, and failed login lockout tests.

### Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)
- **Scope**: Digital intake form entry, validation, attachment management, and reject checklist processing.
- **Key Deliverables**:
  - `Application`: `IApplicationIntakeService`, `CreateApplicationDraftCommand`, `UploadAttachmentCommand`, `RejectChecklistCommand`, FluentValidation rules.
  - `Infrastructure`: `EncryptedStorageService` (AES-256 local/blob encrypted storage, MIME & antivirus filter).
  - `Api`: `/api/v1/applications` (CRUD, attachments, submit, reject endpoints).
  - `Testing`: Input validation tests (`SECURITY-05`), round-trip DTO serialization tests (`PBT-02`), attachment upload tests.

### Unit 4: Compliance Screening & EAS Electronic Signature Engine
- **Scope**: Automated AMLO (ปปง.) & OIC (คปภ.) screening plus EAS executive approval integration.
- **Key Deliverables**:
  - `Application`: `IComplianceOrchestratorService`, `IEasApprovalService`.
  - `Infrastructure`: `IAmloApiClient` (Designated persons & PEP check), `IOicApiClient` (License validity & Color rating), `IEasApiClient` (Approval package dispatch & webhook verification with HMAC SHA-256).
  - `Api`: `/api/v1/compliance`, `/api/v1/eas/webhook` endpoint.
  - `Testing`: Resiliency circuit breaker tests (`NFR-RES-02`), Webhook HMAC signature verification tests, and OIC rating invariants.

### Unit 5: Automated Provisioning & Background SLA Suspension Daemon
- **Scope**: 100% automated multi-system core provisioning (AS400, APAR, SAP, PCSDIS UE/Commissions) and automated 30-day/90-day SLA policy submission suspension daemon.
- **Key Deliverables**:
  - `Application`: `IAutomatedCoreProvisioningService`, `ISlaSuspensionDaemonService`.
  - `Infrastructure`: `IAs400ApiClient`, `IAparApiClient`, `ISapApiClient`, `IPcsdisApiClient`, `SlaComplianceBackgroundWorker` (`BackgroundService`).
  - `Logic`: Automated Agent/Source creation, provisional selling activation (`ACTIVE_TEMPORARY`), automated policy submission blocking (`SUSPENDED_30D`), and automated permanent termination (`TERMINATED_90D`).
  - `Testing`: Idempotent retry tests (`NFR-RES-03`), 30-day/90-day timer boundary property tests (`PBT-05`), and zero-manual-IT compliance verification.

### Unit 6: Next.js Enterprise Web Portal & Operational Dashboards
- **Scope**: Full multi-role web portal, interactive intake forms, reject checklist modal, SLA countdown cards, and Credit Committee reports.
- **Key Deliverables**:
  - `Web Portal`: Role-tailored dashboards for Branch BU, HO BU, Premium Dept, Legal Dept, Executive Approver, and IT Admin.
  - `Components`: Application intake wizard, PDF/Image attachment previewer, EAS approval status badge, real-time SLA countdown widget, and Credit Committee Export (Excel/PDF).
  - `Testing`: Playwright E2E journey tests, accessibility, and HTTP security headers verification (`SECURITY-04`).
