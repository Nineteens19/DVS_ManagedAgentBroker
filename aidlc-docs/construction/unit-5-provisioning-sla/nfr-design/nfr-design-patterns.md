# NFR Design Patterns — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document details the architectural and resilience design patterns for automated multi-system provisioning, Deves Master integration, and the SLA monitoring daemon.

---

## 1. Deves Master & Core System Provisioning Architecture

```
[Application in ReviewPremium]
             |
             v
[CoreProvisioningService] (Orchestrator)
             |
             +---> Step 1: Call [IDevesMasterApiClient.GenerateCodesAsync]
             |             (Returns AgentCode, SourceCode, UnitExecutiveCode)
             |
             +---> Step 2: Parallel Dispatch to Core Adapters
             |     |
             |     +---> [IAS400SyncAdapter.SyncAgentAsync]
             |     +---> [IAparSyncAdapter.SyncAccountAsync]
             |     +---> [ISapSyncAdapter.SyncVendorAsync]
             |     +---> [IPcsdisSyncAdapter.SyncUserRightsAsync]
             |
             +---> Step 3: Transaction Boundary & State Transition
                   |
                   +---> Save 4 CoreSyncTransaction records (IdempotencyKey, Status, Timestamp)
                   +---> If all 4 successful:
                   |     application.ActivateProvisionalSelling(agentCode, sourceCode, unitExecutiveCode)
                   |     (Status = ActiveTemporary, Sla30DayDeadline = Now+30d, Sla90DayDeadline = Now+90d)
                   +---> Dispatch Confirmation Email to Branch & Agent
```

---

## 2. Decoupled SLA Monitoring Daemon Architecture

```
[SlaMonitoringBackgroundService] (HostedService / Singleton)
             |
             | (Controls PeriodicTimer - Default: 60 min)
             v
     [IServiceScopeFactory.CreateScope()]
             |
             v
     [ISlaMonitoringService.ExecuteSlaSweepAsync()] (Scoped Engine)
             |
             +---> 1. Find Applications in 'ActiveTemporary':
             |     - D-7 or D-3 before Sla30DayDeadline: Send warning email
             |     - Now >= Sla30DayDeadline AND Not Archived:
             |       * application.TriggerAutoSuspension("30-Day SLA breach")
             |       * Status = Suspended30D
             |       * Send suspension notification email
             |
             +---> 2. Find Applications in 'Suspended30D':
             |     - Now >= Sla90DayDeadline AND Not Archived:
             |       * application.TriggerAutoTermination("90-Day SLA expiration")
             |       * Status = Terminated90D
             |       * Send permanent termination email
             |
             +---> 3. Return SlaDaemonExecutionReport & Record Serilog Audit
```

---

## 3. Physical Contract Archive Transaction Pattern

```
[Legal Auditor with ROLE_AUDITOR_LEGAL]
             |
             v
[IHardCopyArchiveService.ArchiveContractAsync(appId, boxNumber, notes)]
             |
             +---> Validate application exists & not terminated
             +---> application.VerifyAndArchiveHardCopy(boxNumber, auditorUserId)
             +---> Status = ActivePermanent (Clears suspension if any)
             +---> SaveChangesAsync & Dispatch Permanent Activation Email
```
