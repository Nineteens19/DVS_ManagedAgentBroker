# Business Rules — Unit 4: Compliance Screening & Native Approval Engine

This document defines compliance gating, executive authority, and notification delivery rules.

---

## 1. Compliance Gating Rules

| Rule ID | Name | Condition | Enforcement Action |
|---|---|---|---|
| `BR-COMPLIANCE-01` | AMLO Designated Sanction Stop | Applicant National ID matches AMLO Designated list (`AmloStatus.RejectedDesignated`) | Application is permanently blocked from forwarding. Must reject application immediately. |
| `BR-COMPLIANCE-02` | OIC Blacklist Red Stop | Applicant is Blacklisted by OIC / License revoked (`OicStatus.Red`) | Application is permanently blocked from forwarding. |
| `BR-COMPLIANCE-03` | PEP / Orange Escalated Approval | AMLO matches PEP or OIC status is Orange (License expiring) | Set `RequiresDirectorApproval = true`. Cannot be approved by lower-level delegators. |

---

## 2. Executive Approval Rules

| Rule ID | Name | Condition | Enforcement Action |
|---|---|---|---|
| `BR-APPROVAL-01` | Role Authority | Only users with role `ROLE_APPROVER_MD` can execute approval decisions | Non-MD callers receive `403 Forbidden`. |
| `BR-APPROVAL-02` | State Precondition | Application must be in `PendingExecutiveApproval` status | Callers attempting decision on other statuses receive `InvalidStateTransitionException`. |
| `BR-APPROVAL-03` | Immutable Decision Audit | Every approval/rejection decision writes an immutable domain event and audit log | Record `DecidedBy`, `DecidedAt`, `DecisionNotes`, and status diff. |
