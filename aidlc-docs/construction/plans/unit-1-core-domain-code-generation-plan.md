# Code Generation Plan — Unit 1: Core Domain & DB Schema

## Purpose
This plan outlines the code generation steps for **Unit 1: Core Domain, Database Schema & EF Core Infrastructure**, delivering production-grade C# code, database schema configurations, AES-256-GCM encryption, ISO 27001 audit interceptors, and automated test suites.

---

## Code Location
- **Backend Source Code**: `/Users/nineteen/DVS/managedAgentBroker/src/backend/`
  - `ManagedAgentBroker.Domain/`
  - `ManagedAgentBroker.Infrastructure/`
- **Backend Test Code**: `/Users/nineteen/DVS/managedAgentBroker/tests/backend/`
  - `ManagedAgentBroker.Domain.Tests/`
  - `ManagedAgentBroker.Infrastructure.Tests/`
- **Docker & Compose**: `/Users/nineteen/DVS/managedAgentBroker/docker-compose.yml`

---

## Execution Checklist (Part 2: Generation)

- [x] **Step 1: Project & Solution Structure Setup**
  - [x] Create `ManagedAgentBroker.sln`
  - [x] Create `src/backend/ManagedAgentBroker.Domain/ManagedAgentBroker.Domain.csproj` (.NET 8)
  - [x] Create `src/backend/ManagedAgentBroker.Infrastructure/ManagedAgentBroker.Infrastructure.csproj` (.NET 8 with EF Core & SQL Server)
  - [x] Create `docker-compose.yml` for MS SQL Server 2022

- [x] **Step 2: Core Domain Abstractions & Events**
  - [x] `BaseEntity.cs`, `AggregateRoot.cs`, `IDomainEvent.cs`
  - [x] Domain event definitions (`ApplicationStatusChangedEvent.cs`, `ProvisionalSellingActivatedEvent.cs`, `AgentAutoSuspendedEvent.cs`, `AgentAutoTerminatedEvent.cs`)

- [x] **Step 3: Domain Enums & Value Types**
  - [x] `ApplicationStatus.cs` (Draft, SubmittedBranch, ReviewHeadOffice, PendingEasApproval, ReviewPremium, CoreAutoProvisioning, ActiveTemporary, ReviewLegalOriginal, ActivePermanent, Suspended30D, Terminated90D, ReturnedForCorrection)
  - [x] `AgentType.cs`, `CollateralType.cs`, `AmloStatus.cs`, `OicStatus.cs`, `TargetSystem.cs`, `SyncStatus.cs`, `PhysicalContractStatus.cs`

- [x] **Step 4: Domain Entities & Aggregate Invariants**
  - [x] `AgentApplication.cs` (Root aggregate with transition guard methods, credit term validation, provisional selling activation, and SLA timer evaluation)
  - [x] `AgentProfile.cs`, `Guarantor.cs`, `Collateral.cs`
  - [x] `ComplianceRecord.cs` (AMLO & OIC checks and Director approval flags)
  - [x] `PhysicalContractRecord.cs` (Legal receipt, defect notice, 30d/90d SLA tracking)
  - [x] `CoreSyncTransaction.cs` (AS400, APAR, SAP, PCSDIS provisioning audit records)
  - [x] `ApplicationAttachment.cs`, `RejectChecklistItem.cs`
  - [x] Domain exceptions (`InvalidStateTransitionException.cs`, `DomainRuleValidationException.cs`)

- [x] **Step 5: Cryptography & Security Infrastructure (SECURITY-BASE)**
  - [x] `IDataProtectionProvider.cs` & `Aes256GcmDataProtectionProvider.cs` (AES-256-GCM envelope encryption)
  - [x] `IKeyVaultProvider.cs` & `ConfigurationKeyVaultProvider.cs`
  - [x] `Aes256GcmValueConverter.cs` (EF Core value converter for PII encryption at rest)

- [x] **Step 6: Entity Framework Core Persistence & Configurations**
  - [x] `IApplicationDbContext.cs` & `ApplicationDbContext.cs`
  - [x] Fluent API entity configurations with index mappings and `RowVersion` concurrency tokens
  - [x] Global query filters for soft-delete isolation (`e.IsDeleted == false`)
  - [x] `AuditSaveChangesInterceptor.cs` (ISO 27001 automated audit tracking)

- [x] **Step 7: Database Seeding & Initial Master Data**
  - [x] `DatabaseSeeder.cs` (Branch data, default credit terms, and initial seed fixtures)

- [x] **Step 8: Unit Testing & Property-Based Invariant Verification**
  - [x] Create `tests/backend/ManagedAgentBroker.Domain.Tests/ManagedAgentBroker.Domain.Tests.csproj`
  - [x] Create `tests/backend/ManagedAgentBroker.Infrastructure.Tests/ManagedAgentBroker.Infrastructure.Tests.csproj`
  - [x] State transition unit tests (`AgentApplicationStateTests.cs`)
  - [x] Property-based testing for state machines (`AgentApplicationPbtTests.cs` — `PBT-01`)
  - [x] Round-trip AES-256-GCM encryption tests (`AesEncryptionPbtTests.cs` — `PBT-02`)
  - [x] Verify test suite execution via `dotnet test`

---
