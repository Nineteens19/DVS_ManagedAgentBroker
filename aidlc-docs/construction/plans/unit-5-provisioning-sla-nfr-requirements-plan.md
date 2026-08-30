# NFR Requirements Plan — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

## Purpose
This plan defines the non-functional requirements (NFRs) for **Unit 5**, covering API resiliency, circuit breakers, idempotency locks, background worker scheduling, and security boundaries for multi-system provisioning and the SLA suspension daemon.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define NFR Requirements (`nfr-requirements.md`)**
  - [x] Provisioning timeout, retry policies, and circuit breaker specifications (AS400, APAR, SAP, PCSDIS, Deves Master)
  - [x] HostedService execution reliability, cron/timer error handling, and thread safety
  - [x] Idempotency enforcement and transaction boundary integrity
  - [x] Audit logging and ISO 27001 operational compliance

- [x] **Step 2: Define Tech Stack Decisions (`tech-stack-decisions.md`)**
  - [x] Selection of background worker technology (`Microsoft.Extensions.Hosting.BackgroundService` with `PeriodicTimer`)
  - [x] Polly resilience pipelines for core system adapters
  - [x] Concurrency and execution locking strategy for the SLA daemon

---

## Planning Questions for Unit 5 NFR Requirements

Please answer the following questions to help guide the non-functional specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Core System Provisioning Resilience & Retry Policy
การเชื่อมต่อ API ไปยังระบบ Deves Master, AS400, APAR, SAP, PCSDIS ต้องการกำหนดนโยบาย Timeout และ Retry อย่างไร?

A) **Polly Resilience Pipeline**:
   - HTTP Request Timeout: 10 วินาทีต่อ request
   - Polly Exponential Backoff Retry with Jitter: 3 ครั้ง (2s, 4s, 8s) สำหรับ Transient HTTP errors (5xx, 408, Network drop)
   - บันทึกสถานะ Error Message ใน `CoreSyncTransaction` หากครบ Retry แล้วยังไม่สำเร็จเพื่อรอ Manual/Automated Re-trigger *(Recommended)*

B) Simple Single Attempt: Timeout 5 วินาที ไม่มีการ Retry อัตโนมัติ

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Background SLA Daemon Architecture
การรันตัวตรวจสอบ SLA ในระดับ Backend ต้องการใช้เทคโนโลยีใดในการควบคุม Background Lifecycle?

A) **ASP.NET Core `BackgroundService` with `PeriodicTimer` & Scoped Factory**:
   - ใช้งาน .NET 8 `BackgroundService` ควบคุมรอบการทำงานด้วย `PeriodicTimer` (ค่าเริ่มต้นทุก 60 นาที, ปรับแต่งได้ใน `appsettings.json`)
   - สร้าง Scoped `IServiceProvider` ในแต่ละรอบการตรวจสอบเพื่อป้องกัน Memory Leak และ DbContext Concurrency conflict *(Recommended)*

B) External Cron Trigger ผ่าน HTTP Webhook Endpoint จาก Cloud Scheduler

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: SLA Daemon Concurrency & Batch Processing Lock
เพื่อป้องกันไม่ให้รอบการทำงานของ SLA Daemon ซ้อนทับกันเมื่อมีข้อมูลปริมาณมาก ต้องการจัดการ Concurrency อย่างไร?

A) **SemaphoreSlim Execution Lock + Transactional Batch Chunking**:
   - ใช้ `SemaphoreSlim(1, 1)` ใน HostedService เพื่อรับประกันว่าจะมีเพียงรอบเดียวที่รันในแต่ละช่วงเวลา
   - ประมวลผลใบสมัครเป็น Batch ละ 100 รายการพร้อมบันทึก Audit Report หลังจบรอบ *(Recommended)*

B) ประมวลผลพร้อมกันแบบ Unconstrained Parallel Task

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
