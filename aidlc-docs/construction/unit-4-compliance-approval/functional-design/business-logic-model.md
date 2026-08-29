# Business Logic Model — Unit 4: Compliance Screening & Native Approval Engine

This document outlines the workflow lifecycles for AMLO/OIC screening, executive decision gates, and email notification dispatchers.

---

## 1. Compliance Screening Pipeline

```
[Branch Submits Application (SubmittedBranch)]
                     |
                     v
       [Execute Compliance Screening]
        /                          \
       v                            v
 [AMLO Screening]            [OIC Check]
 (Designated / PEP / Clear)   (Red / Orange / Green)
       \                            /
        v                          v
       [Save ComplianceRecord in DB]
                     |
                     +---> Match Designated or Red ---> [Stop: Cannot Forward]
                     |
                     +---> Match PEP or Orange ---> [Flag RequiresDirectorApproval = true]
                     |
                     +---> Clear & Green ---> [Eligible for Standard Forwarding]
```

---

## 2. Executive Approval Workflow Pipeline

```
[Head Office Forwards to MD (PendingExecutiveApproval)]
                     |
                     +---> [Dispatch Email to MD: "Application {AppNumber} Awaiting Approval"]
                     |
                     v
            [MD Reviews Application]
           /                        \
          v                          v
   [MD Approves]              [MD Rejects]
          |                          |
          v                          v
[Status -> ReviewPremium]   [Status -> ExecutiveRejected]
          |                          |
          +---> [Dispatch Email:     +---> [Dispatch Email:
                 "Application Approved        "Application Rejected
                  by Executive"]               by Executive"]
```

---

## 3. Email Notification Template Pipeline

- **Approval Pending**: Sent to users with `ROLE_APPROVER_MD` containing applicant summary, requested credit limit, and direct link to review.
- **Approved / Rejected**: Sent to Branch BU (`ROLE_BRANCH_BU`) and Premium Dept (`ROLE_PREMIUM_DEPT`) with decision notes and next steps.
