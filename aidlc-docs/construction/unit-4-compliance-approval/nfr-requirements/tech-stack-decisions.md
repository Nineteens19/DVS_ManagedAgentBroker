# Technology Stack Decisions — Unit 4: Compliance Screening & Native Approval Engine

This document details the selected libraries, frameworks, and patterns for compliance screening, approval processing, and email dispatching.

---

## 1. Compliance Screening Adapter (`Polly`)

- **Library**: `Polly.Core` / `Microsoft.Extensions.Http.Resilience` (v8.0)
- **Pattern**: Simulated Sandbox HTTP Client + Polly Resilience Pipeline.
- **Features**: Configurable retry handler, circuit breaker on repeated 500 responses, fallback response handling.

---

## 2. Email Notification Engine (`MailKit` / `System.Net.Mail`)

- **Abstraction**: `IEmailNotificationService`
- **Implementation**:
  - `SmtpEmailNotificationService`: Production/Staging SMTP client connecting to enterprise mail gateway.
  - `InMemoryEmailNotificationService`: Test/Development logger capturing sent messages for verification without requiring external mail servers.
- **Template Engine**: Semantic string interpolation / HTML template generator with Thai typography and corporate branding.

---

## 3. Executive Approval State Machine

- **Domain Model**: Native aggregate methods on `AgentApplication` (`ApproveByExecutive`, `RejectByExecutive`).
- **Data Protection**: AES-256-GCM encrypted PII attributes preserved across all approval state transitions.
