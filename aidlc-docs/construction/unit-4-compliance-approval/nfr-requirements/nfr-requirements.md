# NFR Requirements — Unit 4: Compliance Screening & Native Approval Engine

This document defines performance latency, security, resilience, and auditability requirements for compliance checks and executive approval workflows.

---

## 1. Performance & Latency Requirements

| Metric | Target | Maximum Threshold | Enforcement Mechanism |
|---|---|---|---|
| AMLO & OIC Screening Latency | $< 2.0\text{ s}$ | $5.0\text{ s}$ timeout | `HttpClient` Timeout + Polly Resilience Pipeline |
| Executive Decision API | $< 300\text{ ms}$ | $1.0\text{ s}$ | Direct DB transaction + async event dispatch |
| Email Notification Latency | Background async | $< 10.0\text{ s}$ delivery | `Task.Run` / `IHostedService` async firing |

---

## 2. Security & Role Authorization Requirements

- **Executive Authority**: Only authenticated principals with `ROLE_APPROVER_MD` can submit approval decisions on applications.
- **Audit Logging**: Every approval or rejection decision must record the exact user ID, role, client IP address, UTC timestamp, and decision notes.
- **PII Compliance**: When dispatching emails, full National ID and bank account details must be masked (e.g. `1-1004-XXXXX-XX-X`).

---

## 3. Resiliency & Fault Tolerance Requirements

- **AMLO / OIC HTTP Resilience**:
  - Timeout: 5.0 seconds.
  - Polly Retry Policy: 3 attempts with exponential backoff ($1\text{s}, 2\text{s}, 4\text{s}$) with jitter on transient HTTP 5xx or network drops.
- **Email Dispatch Fault Isolation**:
  - SMTP connection drops or mail server failures must NOT fail or roll back the core approval database transaction.
  - All email errors are logged with warning/error severity for administrative diagnosis.
