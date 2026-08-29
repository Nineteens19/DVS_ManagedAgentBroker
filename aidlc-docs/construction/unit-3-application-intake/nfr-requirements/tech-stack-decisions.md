# Technology Stack Decisions — Unit 3: Application Intake & Document Management

This document details the libraries, framework features, and abstractions selected for Unit 3.

---

## 1. Stack Components & Architectural Roles

| Component / Layer | Technology | Purpose |
|---|---|---|
| Command Validation | `FluentValidation` (v11.x) | Declarative validation for National ID checksum, telephone formats, and mandatory fields |
| File Storage Provider | `IFileStorageService` + `LocalDiskFileStorageService` | Abstract file storage engine supporting local disk during development and cloud blob in production |
| Stream Integrity | `System.Security.Cryptography.IncrementalHash` | Streaming calculation of SHA-256 without in-memory buffering |
| MIME & Signature Inspector | `IFileSignatureValidator` | Binary magic byte validation for PDF and image formats |

---

## 2. Abstraction Strategy

- The core intake domain depends only on `IFileStorageService`.
- Physical storage path resolution is decoupled from domain logic.
