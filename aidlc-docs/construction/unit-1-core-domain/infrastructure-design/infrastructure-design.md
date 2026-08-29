# Infrastructure Design — Unit 1: Core Domain & DB Schema

This document specifies the database provisioning, collation, connection string configuration, and migration management for Unit 1.

---

## 1. Database Specifications (MS SQL Server 2022)

- **Database Engine**: Microsoft SQL Server 2022 (Linux Container / Windows Server)
- **Database Name**: `ManagedAgentBrokerDb`
- **Default Schema**: `dbo`
- **Collation**: `Thai_100_CI_AI_SC_UTF8` (Full support for Thai language case/accent insensitivity and UTF-8 storage)
- **Connection String Schema**:
```text
Server=localhost,1433;Database=ManagedAgentBrokerDb;User Id=sa;Password=<SecurePassword>;TrustServerCertificate=True;MultipleActiveResultSets=True;Encrypt=True;Max Pool Size=100;Connection Timeout=30;
```

---

## 2. Table Schemas & Relational Mapping

| Table Name | Primary Key | Foreign Keys / Relations | Indexes |
|---|---|---|---|
| `AgentApplications` | `Id` (UniqueIdentifier) | None (Root) | `IX_AgentApplications_AppNumber` (Unique), `IX_Status`, `IX_BranchCode`, `IX_Sla30DayDeadline` |
| `AgentProfiles` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (1:1) | `IX_AgentProfiles_NationalIdOrTaxId` |
| `Guarantors` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (0..1:1) | `IX_Guarantors_ApplicationId` |
| `Collaterals` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (0..1:1) | `IX_Collaterals_ApplicationId` |
| `ComplianceRecords` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (1:1) | `IX_ComplianceRecords_ApplicationId` |
| `PhysicalContractRecords` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (1:1) | `IX_PhysicalContractRecords_ApplicationId` |
| `CoreSyncTransactions` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (1:N) | `IX_CoreSyncTransactions_AppId_System` |
| `ApplicationAttachments` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (1:N) | `IX_ApplicationAttachments_AppId` |
| `RejectChecklistItems` | `Id` (UniqueIdentifier) | `ApplicationId` $\rightarrow$ `AgentApplications.Id` (1:N) | `IX_RejectChecklistItems_AppId` |

---

## 3. Migration & Seeding Execution Strategy

### 3.1 Development Environment
- In `Development` environment mode, Web API invokes `await dbContext.Database.MigrateAsync(ct)` on startup.
- `DatabaseSeeder` populates initial organization branches, mock users/roles, and credit term rules.

### 3.2 Production / Staging Environment (CI/CD Pipeline)
- Schema migrations are bundled into idempotent SQL scripts via CLI:
```bash
dotnet ef migrations script --idempotent --output ./migrations/release-v1.sql --context ApplicationDbContext
```
- DBA / DevOps pipeline executes the script with transactional safety before deploying the Web API binaries.
