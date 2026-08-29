# Code Generation Plan — Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)

## Purpose
This plan specifies the implementation steps for Unit 3, covering Thai National ID Modulo 11 validation, optimistic application number generation, streaming file storage with binary magic byte inspection, application intake service, and comprehensive unit / property-based test suites.

---

## Execution Checklist

- [ ] **Step 1: Domain Validation Utilities & Intake DTOs**
  - [ ] Implement `ThaiNationalIdValidator.cs` (Modulo 11 Checksum logic)
  - [ ] Implement Intake Commands & DTOs (`CreateDraftApplicationCommand`, `UpdateDraftApplicationCommand`, `UploadAttachmentCommand`, `AgentApplicationDto`, `AttachmentDto`)

- [ ] **Step 2: Core Infrastructure Services**
  - [ ] Implement `IFileSignatureValidator` & `FileSignatureValidator` (Magic byte inspection for PDF `%PDF-`, JPEG `FF D8 FF`, PNG `89 50 4E 47`)
  - [ ] Implement `IFileStorageService` & `LocalDiskFileStorageService` (Partitioned storage `{yyyy}/{MM}/{appId}` + SHA-256 stream calculation)
  - [ ] Implement `IApplicationNumberGenerator` & `ApplicationNumberGenerator` (`APP-YYYYMMDD-XXXX` daily sequence with optimistic collision retry)

- [ ] **Step 3: Application Intake Service**
  - [ ] Implement `IApplicationIntakeService` & `ApplicationIntakeService` (Draft creation, profile updates, attachment management, branch submission validation, deficiency resubmission)
  - [ ] Register Unit 3 dependencies in `DependencyInjection.cs`

- [ ] **Step 4: Unit & Property-Based Test Suites**
  - [ ] Create `ThaiNationalIdValidatorPbtTests.cs` (`PBT-04` Modulo 11 property-based tests)
  - [ ] Create `FileSignatureValidatorTests.cs` (Magic byte validation & spoofing rejection)
  - [ ] Create `ApplicationNumberGeneratorTests.cs` (Sequence formatting & daily reset)
  - [ ] Create `ApplicationIntakeServiceTests.cs` (Full intake lifecycle verification)

- [ ] **Step 5: Test Execution & Verification**
  - [ ] Execute `dotnet test` to ensure all tests pass (Unit 1, Unit 2, Unit 3).

---

## Proposed File Changes

### 1. `ManagedAgentBroker.Domain`
- [NEW] `Common/ThaiNationalIdValidator.cs`
- [NEW] `DTOs/ApplicationIntakeDtos.cs`

### 2. `ManagedAgentBroker.Infrastructure`
- [NEW] `Services/IFileSignatureValidator.cs` & `Services/FileSignatureValidator.cs`
- [NEW] `Services/IFileStorageService.cs` & `Services/LocalDiskFileStorageService.cs`
- [NEW] `Services/IApplicationNumberGenerator.cs` & `Services/ApplicationNumberGenerator.cs`
- [NEW] `Services/IApplicationIntakeService.cs` & `Services/ApplicationIntakeService.cs`
- [MODIFY] `DependencyInjection.cs`

### 3. `ManagedAgentBroker.Infrastructure.Tests`
- [NEW] `ThaiNationalIdValidatorPbtTests.cs`
- [NEW] `FileSignatureValidatorTests.cs`
- [NEW] `ApplicationNumberGeneratorTests.cs`
- [NEW] `ApplicationIntakeServiceTests.cs`
