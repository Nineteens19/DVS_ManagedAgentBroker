# Business Logic Model — Unit 3: Application Intake & Document Management

This document defines the intake lifecycle workflows, attachment storage pipeline, and deficiency rejection/resubmission flows.

---

## 1. Application Number Generation Pipeline

```
[CreateDraftApplicationCommand]
        |
        v
[ApplicationNumberGenerator]
        |
        +---> Query DB: `AgentApplications.Where(a => a.CreatedAt.Date == Today).Count()`
        |
        +---> Generate: $"APP-{DateTime.UtcNow:yyyyMMdd}-{sequence:D4}"
              (e.g., APP-20260829-0001)
```

---

## 2. File Attachment Storage Pipeline

```
[Upload File Stream]
        |
        +---> [Validation Filter]: Size <= 10MB, Extension in [.pdf, .jpg, .jpeg, .png]
        |
        +---> [Integrity Hash]: Compute SHA-256 Checksum
        |
        +---> [Storage Path Partitioning]: `storage/attachments/{yyyy}/{MM}/{appId}/{fileId}.ext`
        |
        +---> [Persistence]: Save `ApplicationAttachment` metadata to database
```

---

## 3. Deficiency Rejection & Resubmission Workflow (F-CM-018)

- When HO BU reviewers identify missing or unclear documents:
  - Add items to `RejectChecklistItems` table with `Remarks` (e.g. "สำเนาบัตรประชาชนหมดอายุ").
  - Application transitions to `RETURNED_FOR_CORRECTION` (`REJECT_DEFICIENT_ATTACHMENT`).
- Branch User receives email notification and views required corrections:
  - Uploads corrected documents.
  - Resolves checklist items (`IsResolved = true`).
  - Calls `ResubmitApplicationCommand` $\rightarrow$ transitions back to `SUBMITTED_HO_REVIEW`.
