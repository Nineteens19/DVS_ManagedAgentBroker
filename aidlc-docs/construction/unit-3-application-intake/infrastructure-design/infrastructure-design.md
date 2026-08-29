# Infrastructure Design — Unit 3: Application Intake & Document Management

This document specifies the storage directory layout, configuration schemas, and file indexing for Unit 3.

---

## 1. Storage Directory Layout

```
storage/
  └── attachments/
       └── {yyyy}/                (e.g., 2026)
            └── {MM}/             (e.g., 08)
                 └── {appId}/     (e.g., 4b1c2b53-4876-47b2-8419-482a510fb130)
                      ├── {attachmentId_1}.dat
                      └── {attachmentId_2}.dat
```

---

## 2. Storage Configuration Schema (`appsettings.json`)

```json
{
  "Storage": {
    "BasePath": "storage/attachments",
    "MaxFileSizeBytes": 10485760,
    "AllowedExtensions": [ ".pdf", ".jpg", ".jpeg", ".png" ],
    "AllowedMimeTypes": [ "application/pdf", "image/jpeg", "image/png" ]
  }
}
```

---

## 3. Database Indexes for Intake & Attachments

- `IX_AgentApplications_ApplicationNumber`: Unique Clustered/Non-Clustered index for fast lookup and optimistic sequence uniqueness.
- `IX_AgentApplications_BranchCode_Status`: Composite index for branch scoping and dashboard queries.
- `IX_ApplicationAttachments_ApplicationId_IsDeleted`: Index for fetching active attachments by application.
