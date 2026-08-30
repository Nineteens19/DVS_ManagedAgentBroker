# NFR Requirements — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document details the non-functional requirements for automated multi-system provisioning, external adapters, and the background SLA monitoring daemon.

---

## 1. Multi-System Provisioning Resilience Requirements

| Area | Specification | Target |
|---|---|---|
| **API Timeout** | Maximum duration for external core system calls (Deves Master, AS400, APAR, SAP, PCSDIS) | 10 seconds |
| **Retry Policy** | Polly Exponential Backoff with Jitter for transient HTTP / socket errors | 3 attempts (2s, 4s, 8s) |
| **Idempotency** | Every sync request contains a unique idempotent transaction key | Zero duplicate provisioning |
| **Isolation** | Subordinate sync failure is recorded in `CoreSyncTransaction` without blocking application state recovery | Fault containment |

---

## 2. Background SLA Daemon Performance & Concurrency Requirements

| Area | Specification | Target |
|---|---|---|
| **Worker Interval** | Configurable execution period via `PeriodicTimer` | Default 60 minutes |
| **Concurrency Guard** | `SemaphoreSlim(1, 1)` to prevent overlapping job runs | Strict mutual exclusion |
| **Batch Chunking** | Processes eligible applications in batches | 100 applications per chunk |
| **Resource Isolation** | Each execution tick operates inside a distinct `IServiceScope` | Zero memory leak |

---

## 3. Security & Audit Requirements

| Area | Specification | Target |
|---|---|---|
| **ISO 27001 Compliance** | 100% automated system provisioning without manual IT database intervention | Zero manual IT tasks |
| **Audit Logging** | Complete audit trail for code generation, sync attempts, SLA warnings, auto-suspensions, and terminations | Serilog structured logs |
