# NFR Requirements — Unit 3: Application Intake & Document Management

This document defines non-functional security constraints, anti-malware magic byte filters, file integrity checks, and streaming performance metrics.

---

## 1. Binary Magic Byte Validation Specification

All uploaded attachments must pass header byte inspection before being stored:
- **PDF Documents**: File must begin with ASCII bytes `%PDF-` (`0x25, 0x50, 0x44, 0x46, 0x2D`)
- **JPEG Images**: File must begin with `0xFF, 0xD8, 0xFF`
- **PNG Images**: File must begin with `0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A`

If header bytes do not match the expected signature for the declared MIME type, reject with `400 Bad Request` (`FILE_SIGNATURE_MISMATCH`).

---

## 2. Integrity & Performance Constraints

- **File Size Upper Bound**: 10,485,760 bytes (10 MB).
- **Streaming Pipeline**: Use `Stream.CopyToAsync` directly to the storage target. SHA-256 hash is calculated on the fly during the copy stream.
- **Storage Path Anonymization**: Physical files are stored using random GUIDs (`{attachmentId}.dat`) rather than user-supplied filenames to prevent Path Traversal attacks.
- **Audit Tracking**: Log all attachment operations with `UserId`, `ApplicationId`, `DocumentType`, and `Sha256Checksum`.
