# Unit of Work Story Map — Agent & Broker Management System

This document maps all user stories and functional requirements to the corresponding Units of Work.

---

## 1. Traceability Matrix: Stories to Units of Work

| Epic & Story ID | Story Title | Assigned Unit of Work | Traceability & Enforced Standards |
|---|---|---|---|
| **US-1.1** | Create & Draft Agent Application (F-CM-035) | **Unit 3**: Intake & Documents | `FR-1.1`, `FR-1.2`, `FR-1.4` \| `SECURITY-05`, `PBT-02` |
| **US-1.2** | Upload & Manage Supporting Attachments (F-CM-018) | **Unit 3**: Intake & Documents | `FR-1.3` \| `SECURITY-01`, `SECURITY-05` |
| **US-2.1** | Automated AMLO (ปปง.) Screening | **Unit 4**: Compliance & EAS | `FR-2.1` \| `NFR-RES-02`, `SECURITY-03` |
| **US-2.2** | Automated OIC (คปภ.) Blacklist & License Screening | **Unit 4**: Compliance & EAS | `FR-2.2` \| `PBT-01` (Rating Invariant) |
| **US-3.1** | Head Office Review & Reject Checklist | **Unit 3**: Intake & Documents | `FR-3.1`, `FR-3.3` \| `SECURITY-05` |
| **US-3.2** | EAS Digital Signing & Executive Approval | **Unit 4**: Compliance & EAS | `FR-3.4` \| `SECURITY-01` (E-Signature Webhook) |
| **US-4.1** | 100% Automated Multi-System Core Provisioning | **Unit 5**: Provisioning & SLA Daemon | `FR-3.2`, `FR-4.1`, `FR-4.2`, `FR-4.3` \| `NFR-RES-03`, ISO27001 |
| **US-5.1** | Physical Hard-Copy Receipt & SLA Verification | **Unit 5**: Provisioning & SLA Daemon | `FR-5.1`, `FR-5.2` \| ISO27001 Audit Archive |
| **US-5.2** | Automated Policy Submission Blocking (Auto-Suspend) | **Unit 5**: Provisioning & SLA Daemon | `FR-5.2`, `FR-5.3` \| `PBT-05` (30d/90d Invariants) |
| **US-6.1** | Real-Time Operational & SLA Dashboard | **Unit 6**: Next.js Web Portal | `FR-6.1` \| `SECURITY-04`, `SECURITY-01` |
| **US-6.2** | Monthly Credit Committee Report Export | **Unit 6**: Next.js Web Portal | `FR-6.2` \| Report Generation Engine |

---

## 2. Cross-Cutting Foundation Coverage
- **Unit 1 (Core Domain & EF Core DB Schema)**: Provides data structures, state machine entities, database tables, and indexes for all Epics 1–6.
- **Unit 2 (Authentication & RBAC)**: Enforces security authentication, role permissions, and session protection across all APIs and frontend pages (`NFR-SEC-01` to `NFR-SEC-04`).

---

## 3. Story Coverage Summary
- **Total User Stories**: 10
- **Stories Assigned**: 10 (100% Coverage)
- **Unassigned Stories**: 0
