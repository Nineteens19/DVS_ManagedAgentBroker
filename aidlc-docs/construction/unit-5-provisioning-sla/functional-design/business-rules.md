# Business Rules — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document defines the business rules governing multi-system automated provisioning, Deves Master code integration, SLA background monitoring, and hard-copy contract archiving.

---

## 1. Automated Provisioning Rules

| Rule ID | Name | Description | Severity |
|---|---|---|---|
| `BR-PROV-01` | **Prerequisite Status** | Provisioning can only be triggered when application status is `ReviewPremium`. | Hard Stop |
| `BR-PROV-02` | **Deves Master Code Generation** | `AgentCode` and `SourceCode` must be generated from Deves Master API prior to syncing subordinate core systems. | Hard Stop |
| `BR-PROV-03` | **100% IT Automation** | All 4 subordinate systems (AS400, APAR, SAP, PCSDIS) must be provisioned automatically via background sync pipelines with 0 manual IT operational tickets (ISO 27001). | Mandatory |
| `BR-PROV-04` | **System Idempotency** | Each `CoreSyncTransaction` must include a unique `IdempotencyKey` based on `{ApplicationNumber}-{System}-{Attempt}`. | Mandatory |
| `BR-PROV-05` | **Provisional Activation Gate** | Status transitions to `ActiveTemporary` ONLY after all 4 sync transactions succeed. | Hard Stop |

---

## 2. SLA Timers & Background Suspension Rules

| Rule ID | Name | Description | Severity |
|---|---|---|---|
| `BR-SLA-01` | **Provisional Timer Inception** | When status becomes `ActiveTemporary`, `Sla30DayDeadline` is set to `Date + 30 days` and `Sla90DayDeadline` is set to `Date + 90 days`. | Automated |
| `BR-SLA-02` | **30-Day Auto-Suspension** | If `DateTime.UtcNow >= Sla30DayDeadline` and `PhysicalContractRecord.Status != Archived`, daemon automatically transitions status to `Suspended30D` and blocks policy submission in PCSDIS. | Automated |
| `BR-SLA-03` | **90-Day Auto-Termination** | If `DateTime.UtcNow >= Sla90DayDeadline` and `PhysicalContractRecord.Status != Archived`, daemon automatically transitions status to `Terminated90D` and permanent deactivation is triggered. | Automated |
| `BR-SLA-04` | **Early Warning Notifications** | Automated email warnings are dispatched at `D-7` and `D-3` before 30-day deadline. | Automated |

---

## 3. Physical Contract Archive Rules

| Rule ID | Name | Description | Severity |
|---|---|---|---|
| `BR-ARCH-01` | **Auditor Role Gate** | Only users with `ROLE_AUDITOR_LEGAL` or `ROLE_ADMIN` may execute physical contract archiving. | Hard Stop |
| `BR-ARCH-02` | **Mandatory Archive Box Number** | `ArchiveBoxNumber` is strictly required before archiving (e.g. `BOX-YYYY-BR-XXXX`). | Validation |
| `BR-ARCH-03` | **Permanent Rights Restoration** | Archiving a valid physical contract for an application in `ActiveTemporary` or `Suspended30D` immediately transitions status to `ActivePermanent` and clears suspension flags. | Automated |
