# Business Logic Model & State Invariants — Unit 1: Core Domain

This document specifies the domain state machine, transition guards, and business logic invariants.

---

## 1. Application State Transition Progression Matrix

```
[Draft]
   | (SubmitBranch)
   v
[SubmittedBranch]
   | (AssignToHOReviewer)
   v
[ReviewHeadOffice] --------(RejectToChecklist)--------> [ReturnedForCorrection]
   | (CompliancePassed & Forward)                              | (BranchFixAndResubmit)
   v                                                           +---> [SubmittedBranch]
[PendingEasApproval] ------(EasExecutiveRejected)-----> [EasRejected]
   | (EasExecutiveApproved Callback)
   v
[ReviewPremium] -----------(CreditRejected)-----------> [ReturnedForCorrection]
   | (ApproveCreditAndTriggerProvisioning)
   v
[CoreAutoProvisioning]
   | (All 4 Core Systems Provisioned: AS400, APAR, SAP, PCSDIS)
   v
[ActiveTemporary] <--- (เปิดขายชั่วคราว / Provisional Selling Active)
   |
   +---> (Legal Receives & Approves Hard-Copy within 30d) ---> [ActivePermanent] (เปิดขายถาวร)
   |
   +---> (SLA Breached > 30d without Valid Hard-Copy) --------> [Suspended30D] (ระงับการส่งงาน Auto)
            |
            +---> (Defect Resolved & Original Approved) ------> [ActivePermanent]
            |
            +---> (SLA Breached > 90d without Resolution) ----> [Terminated90D] (ปิดรหัสถาวร Auto)
```

---

## 2. Transition Guard Invariants (Enforced in Domain Aggregate)

| Current State | Target State | Trigger Method | Mandatory Pre-Condition Guards (Invariants) |
|---|---|---|---|
| `Draft` | `SubmittedBranch` | `SubmitByBranch()` | Profile complete, Thai ID valid format (13 digits), all required documents attached (`ID_CARD`, `BOOK_BANK`, `BROKER_LICENSE`). |
| `SubmittedBranch` / `ReviewHeadOffice` | `PendingEasApproval` | `ForwardToEas()` | AMLO status must be `Passed` or (`FlaggedPep` with Director approval); OIC status must be `Green`/`Yellow` or (`Orange` with Director approval). Neither can be `Rejected`. |
| `PendingEasApproval` | `ReviewPremium` | `ProcessEasApproval()` | Valid HMAC SHA-256 webhook payload, positive executive decision, and valid digital signature hash. |
| `ReviewPremium` | `CoreAutoProvisioning` | `ApproveCreditLine()` | Approved Credit Limit $> 0$, Credit Terms valid (Motor $\in \{15, 30, 31\}$, Non-Motor $\le 45$), Guarantor salary meets minimum coverage ratio. |
| `CoreAutoProvisioning` | `ActiveTemporary` | `CompleteProvisioning()` | All 4 subsystems (AS400, APAR, SAP, PCSDIS) successfully provisioned. Sets `ProvisionalSellingActivatedAt = Now`, `Sla30DayDeadline = Now + 30 Days`, `Sla90DayDeadline = Now + 90 Days`. |
| `ActiveTemporary` / `Suspended30D` | `ActivePermanent` | `VerifyAndArchiveHardCopy()` | Hard-copy receipt confirmed by Legal, wet signatures verified, archive box number assigned. Clears all suspension flags and timers. |
| `ActiveTemporary` | `Suspended30D` | `TriggerAutoSuspension()` | `Now > Sla30DayDeadline` AND `HardCopyReceivedDate == null`. Blocks selling rights in AS400 and PCSDIS. |
| `Suspended30D` | `Terminated90D` | `TriggerAutoTermination()` | `Now > Sla90DayDeadline` AND `HardCopyReceivedDate == null`. Permanently terminates agent codes across all core systems. |

---

## 3. Domain Invariant Violation Handling
- Any attempt to execute an illegal state transition throws a domain exception `InvalidStateTransitionException(CurrentStatus, TargetStatus)`.
- Aggregate methods encapsulate all property mutations; setters are strictly private.
