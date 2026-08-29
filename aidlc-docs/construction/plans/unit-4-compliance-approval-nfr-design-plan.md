# NFR Design Plan — Unit 4: Compliance Screening & Native Approval Engine

## Purpose
This plan details the technical patterns, architectural contracts, resilience pipelines, and logical component structures for **Unit 4: Compliance Screening & Native Approval Engine**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Technical Patterns & Resilience Architecture (`nfr-design-patterns.md`)**
  - [x] Polly HTTP resilience pipeline configuration for AMLO/OIC screening
  - [x] Non-blocking fire-and-forget / task-managed email notification dispatcher
  - [x] Concurrency and transactional boundary management for approval state transitions

- [x] **Step 2: Define Service Contracts & Logical Components (`logical-components.md`)**
  - [x] `IComplianceScreeningService` & `ComplianceScreeningService`
  - [x] `IApprovalWorkflowService` & `ApprovalWorkflowService`
  - [x] `IEmailNotificationService`, `SmtpEmailNotificationService` & `InMemoryEmailNotificationService`
  - [x] Service registration in `DependencyInjection.cs`

---

## Planning Questions for Unit 4 NFR Design

Please answer the following questions to help guide the service interfaces and component design. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Compliance Screening Service Interface & Multi-Source Aggregation
สำหรับการตรวจสอบ AMLO และ OIC ต้องการออกแบบ Service Interface อย่างไร?

A) Unified `IComplianceScreeningService` ที่รวบรวมทั้ง AMLO Screening และ OIC Check ไว้ใน Method เดียว `CheckComplianceAsync(Guid applicationId, string nationalIdOrTaxId, CancellationToken ct)` พร้อมสร้าง `ComplianceRecord` บันทึกลงฐานข้อมูล *(Recommended)*

B) แยกเป็น 2 Interfaces อิสระ (`IAmloScreeningService` และ `IOicScreeningService`)

X) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

### Question 2: Email Notification Configuration Section Schema
สำหรับการตั้งค่า SMTP และระบบแจ้งเตือน ต้องการกำหนด Configuration Schema ใน `appsettings.json` อย่างไร?

A) Section `EmailSettings` (`SmtpHost`, `SmtpPort`, `SenderEmail`, `SenderName`, `Username`, `Password`, `EnableSsl`, `UseInMemoryFallback`) *(Recommended)*

B) Plain Environment Variables without Configuration Section

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
