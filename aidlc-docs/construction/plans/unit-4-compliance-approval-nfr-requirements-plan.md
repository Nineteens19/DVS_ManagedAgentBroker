# NFR Requirements Plan — Unit 4: Compliance Screening & Native Approval Engine

## Purpose
This plan outlines the non-functional performance requirements, screening latency thresholds, HTTP resilience policies, and email notification reliability constraints for **Unit 4: Compliance Screening & Native Approval Engine**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define NFR Requirements (`nfr-requirements.md`)**
  - [x] AMLO & OIC Screening latency thresholds (< 3 seconds target, 5s timeout)
  - [x] Executive decision response time (< 500ms)
  - [x] Non-blocking asynchronous email notification dispatch
  - [x] Audit trail durability for approval decisions and compliance checks

- [x] **Step 2: Define Technology Stack Decisions (`tech-stack-decisions.md`)**
  - [x] `Polly` resilience pipelines (Retry with exponential backoff + Circuit Breaker for compliance endpoints)
  - [x] `MailKit` / `System.Net.Mail` SMTP client abstraction for email delivery
  - [x] Structured Serilog audit events for executive approvals

---

## Planning Questions for Unit 4 NFR Requirements

Please answer the following questions to help guide the security and resilience specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Compliance API Timeout & Polly Resilience Policy
สำหรับการเรียก API ตรวจสอบ AMLO และ OIC ต้องการกำหนด Timeout และ Resilience Policy อย่างไร?

A) 5-second Timeout + Polly 3-Attempt Exponential Backoff with Jitter *(Recommended)*

B) 10-second Timeout without Retry

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Email Notification Fault Tolerance Strategy
หากระบบ SMTP Server ภายนอกขัดข้องชั่วคราวระหว่างการอนุมัติใบสมัคร ต้องการให้ระบบจัดการอย่างไร?

A) Non-blocking Async Dispatch with Error Logging: ส่งอีเมลแบบ Asynchronous และบันทึก Error Log โดยไม่ทำให้ Transaction การอนุมัติ (State Change) ถูก Rollback หรือ Fail *(Recommended)*

B) Blocking Synchronous Dispatch: หากส่งอีเมลไม่ผ่าน ให้ Rollback สถานะการอนุมัติ

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
