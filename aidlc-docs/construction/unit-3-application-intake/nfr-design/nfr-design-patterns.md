# NFR Design Patterns — Unit 3: Application Intake & Document Management

This document outlines the concurrency control patterns, streaming I/O pipeline, and validation architecture for Unit 3.

---

## 1. Concurrent Application Number Generation Pattern

```
[Generate Number Request]
        |
        v
[Query Count Today + 1] -> Format: $"APP-{today:yyyyMMdd}-{seq:D4}"
        |
        v
[Try SaveChangesAsync]
        |
        +---> [Success] ---> Return ApplicationNumber
        |
        +---> [DbUpdateException (Unique Constraint on IX_AgentApplications_ApplicationNumber)]
                    |
                    +---> [Retry with Next Sequence (Max 3 Attempts)]
```

---

## 2. Streaming File Upload & Cryptographic Digest Pattern

```
[HTTP Request Multipart Stream]
        |
        v
[Read First 8 Bytes] ---> [IFileSignatureValidator.Validate(magicBytes, contentType)]
        | (Pass)
        v
[Open FileStream on Storage: storage/attachments/{year}/{month}/{appId}/{fileId}.dat]
        |
        v
[IncrementalHash (SHA-256) + Stream.CopyToAsync]
        |
        v
[Finalize SHA-256 Checksum] ---> [Save ApplicationAttachment Record in Db]
```

---

## 3. Thai National ID Modulo 11 Invariant Pattern

The validation algorithm is encapsulated into a reusable validator:
- Rule: 13 numeric characters where $\sum_{i=1}^{12} D_i \times (14 - i) \pmod{11}$ produces check digit matching $D_{13}$.
- Property-based testing ensures no false positives or false negatives across generated valid and invalid IDs.
