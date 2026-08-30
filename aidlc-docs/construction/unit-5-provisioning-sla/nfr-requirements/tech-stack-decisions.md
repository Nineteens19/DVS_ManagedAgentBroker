# Tech Stack Decisions — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document records the technology stack selections for automated multi-system provisioning and background SLA monitoring.

---

## 1. Technology Selection Matrix

| Component | Selected Technology | Rationale |
|---|---|---|
| **Background Daemon** | `Microsoft.Extensions.Hosting.BackgroundService` with `PeriodicTimer` | Native .NET 8 asynchronous hosted service with cancellation token support and low memory overhead |
| **Resilience Pipeline** | Polly (Timeout + Exponential Backoff with Jitter) | Standardized retry mechanism across Deves Master, AS400, APAR, SAP, PCSDIS |
| **Concurrency Locking** | `SemaphoreSlim(1, 1)` | Thread-safe, async-compatible mutual exclusion preventing concurrent daemon sweeps |
| **Dependency Lifetime** | `IServiceScopeFactory` scoped resolution | Ensures `ApplicationDbContext` is properly disposed after each daemon tick |
| **Email Delivery** | `IEmailNotificationService` (Unit 4 engine) | Dispatches automated SLA warnings, suspension alerts, and termination notices |
