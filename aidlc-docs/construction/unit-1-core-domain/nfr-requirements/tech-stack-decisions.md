# Tech Stack & Architectural Decisions — Unit 1: Core Domain & DB Schema

This document details the framework, libraries, and design patterns adopted for Unit 1.

---

## 1. Core Framework & NuGet Dependencies

| Component / Layer | Technology & Version | Purpose & Description |
|---|---|---|
| **Runtime & SDK** | .NET 8.0 (C# 12) | High-performance, cross-platform enterprise runtime. |
| **ORM / Data Access** | `Microsoft.EntityFrameworkCore.SqlServer` (v8.0.x) | MS SQL Server database provider with migrations and change tracking. |
| **Relational Database** | Microsoft SQL Server 2022 | Enterprise database engine with compatibility level 160. |
| **Domain Events** | `MediatR` (v12.x) | In-process messaging for decoupled domain event dispatching. |
| **Validation** | `FluentValidation` (v11.x) | Strongly-typed business validation rules and error builders. |
| **Cryptography** | `System.Security.Cryptography` (AES-256-GCM) | Application-level envelope encryption for PII database columns. |
| **Unit Testing** | `xUnit` (v2.6.x) + `FluentAssertions` (v6.12.x) | Modern assertion and test runner framework. |
| **Property-Based Testing** | `FsCheck.Xunit` (v2.16.x) / `Bogus` (v35.x) | Automated generative invariant testing for state machines and encryption. |

---

## 2. Architectural Design Patterns

### 2.1 Domain-Driven Design (DDD) & Clean Architecture
- **Entities & Aggregates**: `AgentApplication` controls all child collections (`Profile`, `Guarantor`, `Collateral`, `ComplianceRecord`, `SyncTransactions`, `PhysicalContractRecord`).
- **Encapsulation**: Private setters on all aggregate properties, modified strictly through intention-revealing domain methods (`SubmitByBranch()`, `ApproveCreditLine()`, `TriggerAutoSuspension()`).
- **Persistence Ignorance**: Domain layer contains zero references to Entity Framework Core or SQL Server assemblies.

### 2.2 EF Core Infrastructure Patterns
- **Entity Configurations**: Explicit `IEntityTypeConfiguration<T>` classes for clean separation of DB mappings (table names, column types, lengths, indexes).
- **Interceptors**: `AuditSaveChangesInterceptor` automatically populates `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` on every `SaveChangesAsync()` call.
- **Global Query Filters**: Automatically applies `e.IsDeleted == false` across all entity queries.
- **Value Converters**: Custom `Aes256EncryptionConverter` encrypts/decrypts PII columns seamlessly.
