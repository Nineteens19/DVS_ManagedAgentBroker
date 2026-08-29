# Business Rules & Permissions Matrix — Unit 2: Authentication, RBAC & Organization Service

This document defines authorization rules, the permission matrix, security lockout thresholds, and segregation of duties.

---

## 1. Role-Permissions Matrix

| Feature / Action | `ROLE_BRANCH_BU` | `ROLE_HO_BU` | `ROLE_PREMIUM_DEPT` | `ROLE_LEGAL_DEPT` | `ROLE_APPROVER_MD` | `ROLE_IT_ADMIN` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Create Application Draft (F-CM-035/018)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload Attachments** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Submit Application to HO** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Review & Reject Checklist** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Run AMLO / OIC Compliance Screening** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Forward to Executive Approval** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Executive E-Approval (MD/Division)** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Review Premium & Credit Limit** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Trigger Auto Provisioning** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Verify Hard Copy Contract & Box Archive** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Manage Users & Branch Directory** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View Audit Trail Logs** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 2. Security & Lockout Rules

- **BR-AUTH-01 (Failed Login Lockout)**: If a user enters invalid credentials 5 consecutive times, the account is temporarily locked for 15 minutes (`LockoutEndUtc = UtcNow.AddMinutes(15)`).
- **BR-AUTH-02 (Password Complexity)**: Local passwords must have at least 8 characters, containing at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.
- **BR-AUTH-03 (Token Expiration)**:
  - Access Token lifetime: strictly 15 minutes (`900` seconds).
  - Refresh Token lifetime: 7 days (`604,800` seconds).
- **BR-AUTH-04 (Segregation of Duties)**:
  - The creator of an application (`CreatedBy == currentUser.UserId`) cannot act as the Head Office Reviewer (`ROLE_HO_BU`) or Approver (`ROLE_APPROVER_MD`) for the same application.
