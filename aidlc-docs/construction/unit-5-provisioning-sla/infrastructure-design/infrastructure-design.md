# Infrastructure Design — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document defines the configuration schemas, database index optimizations, and background hosted worker setup for Unit 5.

---

## 1. AppSettings Configuration Schema

### `appsettings.json`
```json
{
  "ProvisioningSettings": {
    "DevesMasterEndpoint": "https://master.deves.co.th/api",
    "As400Endpoint": "https://as400.internal.corp/api",
    "AparEndpoint": "https://apar.internal.corp/api",
    "SapEndpoint": "https://sap.internal.corp/api",
    "PcsdisEndpoint": "https://pcsdis.internal.corp/api",
    "UseSandboxSimulators": true,
    "SlaDaemonIntervalMinutes": 60
  }
}
```

### `appsettings.Production.json`
```json
{
  "ProvisioningSettings": {
    "DevesMasterEndpoint": "https://master.deves.co.th/api/v1",
    "As400Endpoint": "https://as400.prod.internal.corp/api/v1",
    "AparEndpoint": "https://apar.prod.internal.corp/api/v1",
    "SapEndpoint": "https://sap.prod.internal.corp/api/v1",
    "PcsdisEndpoint": "https://pcsdis.prod.internal.corp/api/v1",
    "UseSandboxSimulators": false,
    "SlaDaemonIntervalMinutes": 60
  }
}
```

---

## 2. Database Indexes for High-Performance SLA Queries

To ensure background sweeps execute with zero table locking:
- `IX_AgentApplications_Status_Sla30Day`: Filtered composite index on `(Status, Sla30DayDeadline)`
- `IX_AgentApplications_Status_Sla90Day`: Filtered composite index on `(Status, Sla90DayDeadline)`
- `IX_CoreSyncTransactions_ApplicationId_TargetSystem`: Index on `(ApplicationId, TargetSystem)` with include `(Status, CompletedAt)`
- `IX_PhysicalContractRecords_ApplicationId_Status`: Index on `(ApplicationId, Status)`
