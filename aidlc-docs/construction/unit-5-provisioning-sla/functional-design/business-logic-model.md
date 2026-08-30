# Business Logic Model — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document details the multi-system provisioning workflow, Deves Master code integration, SLA background daemon lifecycle, and physical contract archiving.

---

## 1. 100% Automated Multi-System Provisioning Workflow

```
Application in [ReviewPremium]
       |
       v (User: Premium Reviewer approves credit limit)
[ApproveCreditAndTriggerProvisioning(creditLimit, commission%)]
       |
       +---> Status = CoreAutoProvisioning
       |
       v
[Deves Master API Integration Client]
       |
       +---> Calls Deves Master API with (AgentType, BranchCode, NationalId)
       +---> Receives AgentCode (e.g. AG20260001 / BR20260001) & SourceCode (e.g. SRC-B01-0001)
       |
       v
[Parallel Multi-System Sync Pipeline]
       +---> System 1: AS400 Core Insurance (Agent Profile, Credit Limit, Motor Term)
       +---> System 2: APAR Accounting (Commission Account, Payment Terms)
       +---> System 3: SAP ERP (Vendor Code, GL Mapping)
       +---> System 4: PCSDIS Portal (Web Login, Policy Issuing Rights)
       |
       v (All 4 transactions complete with SyncStatus.Success)
[Activate Provisional Selling Rights]
       |
       +---> Status = ActiveTemporary
       +---> ProvisionalSellingActivatedAt = UtcNow
       +---> Sla30DayDeadline = UtcNow + 30 Days (Policy Submission SLA)
       +---> Sla90DayDeadline = UtcNow + 90 Days (Termination SLA)
       +---> Dispatches Confirmation Email to Branch & Agent
```

---

## 2. SLA Background Daemon Monitoring Lifecycle

```
[Hourly / Daily Hosted SLA Daemon]
       |
       v
[Scan 1: Applications in 'ActiveTemporary']
       |
       +---> Remaining Days == 7 or 3: Dispatch Early Warning Email
       |
       +---> DateTime.UtcNow >= Sla30DayDeadline AND PhysicalContract not archived:
             |
             +---> Call application.TriggerAutoSuspension("30-Day SLA breach: Missing original hard-copy documents")
             +---> Status = Suspended30D
             +---> PCSDIS Policy Issuing Rights Blocked (Provisional rights revoked)
             +---> Dispatches Suspension Alert Email to Branch & Agent
       |
       v
[Scan 2: Applications in 'Suspended30D']
       |
       +---> DateTime.UtcNow >= Sla90DayDeadline AND PhysicalContract not archived:
             |
             +---> Call application.TriggerAutoTermination("90-Day SLA expiration: Document non-compliance")
             +---> Status = Terminated90D
             +---> AgentCode Decommissioned in AS400, SAP, APAR, PCSDIS
             +---> Dispatches Permanent Termination Alert Email
```

---

## 3. Physical Contract Receipt & Legal Archiving Lifecycle

```
Physical Documents Delivered to Legal Dept
       |
       v (Legal Auditor verifies hard-copy signatures and collateral)
[ArchivePhysicalContractAsync(applicationId, "BOX-2026-HQ-042", notes)]
       |
       +---> PhysicalContractRecord.Status = Archived
       +---> PhysicalContractRecord.ArchiveBoxNumber = "BOX-2026-HQ-042"
       +---> PhysicalContractRecord.ReceivedAtLegalAt = UtcNow
       |
       +---> application.VerifyAndArchiveHardCopy("BOX-2026-HQ-042", auditorUserId)
       +---> Status = ActivePermanent
       +---> Clears any active suspensions
       +---> Dispatches Permanent Activation Email
```
