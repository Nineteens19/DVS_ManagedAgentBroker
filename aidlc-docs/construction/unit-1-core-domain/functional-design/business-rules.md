# Business Rules & Calculation Specifications — Unit 1: Core Domain

This document defines the formal business rules, credit calculations, regulatory screening criteria, and timer rules.

---

## 1. Credit Line & Terms Business Rules (BR-CREDIT)

### BR-CREDIT-01: Credit Limit Thresholds
- Minimum Credit Limit: 10,000 THB
- Maximum Standard Credit Limit without Executive Special Approval: 500,000 THB
- Credit Limits $> 500,000$ THB strictly require MD approval flag in EAS.

### BR-CREDIT-02: Credit Term Limits
- **Motor Products**: Allowed terms are strictly `15`, `30`, or `31` days. Any other value is rejected.
- **Non-Motor Products**: Allowed term is $\le 45$ days (maximum 45 days).

### BR-CREDIT-03: Guarantor Salary & Collateral Coverage Ratio
- If Collateral Type is `GuarantorOnly`:
  - Guarantor Monthly Salary must be $\ge 20\%$ of the requested credit limit for individual agents, OR minimum 20,000 THB/month.
- If Collateral Type is `CashDeposit` or `BankGuarantee`:
  - Appraised value must be $\ge 100\%$ of the requested credit line.

---

## 2. Compliance & Screening Evaluation Rules (BR-COMPLIANCE)

### BR-COMPLIANCE-01: AMLO (ปปง.) Screening Matrix
| AMLO Check Result | Designation Status | System Action | Workflow Routing |
|---|---|---|---|
| **Clean / No Match** | `Passed` | Automatically proceeds to OIC check | Standard path |
| **PEP / High-Risk Match** | `FlaggedPep` | Attaches evidence; flags for special review | Requires Division Director Approval |
| **Designated Sanction Match** | `RejectedDesignated` | Immediately blocks application; generates alert | Immediate Rejection |

### BR-COMPLIANCE-02: OIC (คปภ.) Blacklist & License Rating Matrix
| OIC Rating | License Status | Meaning | Action / Routing |
|---|---|---|---|
| **GREEN** | Active & Clean | Normal valid broker license | Automatic Pass |
| **YELLOW** | Active with Caution | Minor disciplinary history | Automatic Pass with Caution Flag |
| **ORANGE** | Under Investigation | Pending disciplinary review | Requires Division Director Sign-off |
| **RED** | Revoked / Suspended / Blacklisted | Barred from selling insurance | Immediate Rejection |

---

## 3. SLA Timer & Auto-Suspension Rules (BR-SLA)

### BR-SLA-01: Provisional Selling SLA Window
- `ProvisionalSellingActivatedAt` is set when all 4 core systems confirm successful provisioning.
- `Sla30DayDeadline = ProvisionalSellingActivatedAt.Date.AddDays(30)`
- `Sla90DayDeadline = ProvisionalSellingActivatedAt.Date.AddDays(90)`

### BR-SLA-02: Automated 30-Day Policy Submission Suspension
- When `CurrentDate > Sla30DayDeadline` AND `Status == ApplicationStatus.ActiveTemporary`:
  - System executes `TriggerAutoSuspension()`:
    1. Update status to `Suspended30D`.
    2. Invoke `IAs400ApiClient` and `IPcsdisApiClient` to disable selling/submission permissions.
    3. Generate high-priority notification to Branch and Premium Debt Collection.

### BR-SLA-03: Automated 90-Day Permanent Termination
- When `CurrentDate > Sla90DayDeadline` AND `Status == ApplicationStatus.Suspended30D`:
  - System executes `TriggerAutoTermination()`:
    1. Update status to `Terminated90D`.
    2. Revoke and permanently close Agent/Source code in all core subsystems.
