# Domain Entities & Intake Contracts — Unit 3: Application Intake & Document Management

This document defines the intake request contracts, command payloads, attachment validation models, and document checklist items.

---

## 1. Application Intake Commands & DTOs

### 1.1 `CreateDraftApplicationCommand`
- `AgentType`: `Individual` | `Juristic`
- `BranchCode`: string (max 20)
- `BranchName`: string (max 150)
- `ProposedCreditLimit`: decimal (> 0)
- `Profile`: `AgentProfileDto`
- `Guarantor`: `GuarantorDto?` (Mandatory if Individual and proposed credit > 0)
- `MotorPaymentTermDays`: int (15 | 30 | 31)
- `NonMotorPaymentTermDays`: int (30 | 45 | 60)

### 1.2 `AgentProfileDto`
- `TitleTh`, `FirstNameTh`, `LastNameTh`, `FirstNameEn`, `LastNameEn`
- `NationalIdOrTaxId`: 13 digits (Validated via Modulo 11 Checksum for Individuals)
- `LicenseNumber`: 10 digits
- `PhoneNumber`: 10 digits (`08x`, `09x`, `06x`)
- `Email`: Valid email format
- `Address`: Full address string
- `BankName`, `BankAccountNumber`, `BankAccountName`

### 1.3 `GuarantorDto`
- `TitleTh`, `FirstNameTh`, `LastNameTh`
- `NationalId`: 13 digits (Modulo 11 validated)
- `Relationship`: string
- `EmployerName`, `Position`, `MonthlySalary`, `ContactPhone`

---

## 2. File Attachment Contract

### 2.1 `UploadAttachmentCommand`
- `ApplicationId`: Guid
- `DocumentType`: `ID_CARD_COPY`, `AGENT_LICENSE_COPY`, `COMMERCIAL_REGISTRATION`, `GUARANTOR_ID_CARD`, `SALARY_SLIP`, `COLLATERAL_DEED`
- `FileName`: Original file name (e.g. `id_card.pdf`)
- `ContentType`: `application/pdf`, `image/jpeg`, `image/png`
- `FileStream` / `Bytes`: Raw stream
- `Sha256Checksum`: Cryptographic digest for file integrity
