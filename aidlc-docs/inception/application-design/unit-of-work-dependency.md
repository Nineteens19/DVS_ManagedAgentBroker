# Unit of Work Dependencies & Execution Order — Agent & Broker Management System

This document specifies the dependency matrix, critical path, and sequential construction order across all 6 Units of Work.

---

## 1. Unit Dependency Matrix

| Unit | Depends On (Prerequisites) | Required By | Critical Path Priority |
|---|---|---|---|
| **Unit 1: Core Domain & EF Core Schema** | None (Base Foundation) | Units 2, 3, 4, 5, 6 | **P1 (Highest - Blocking Foundation)** |
| **Unit 2: Authentication & RBAC** | Unit 1 | Units 3, 4, 5, 6 | **P2 (High - Security & Identity)** |
| **Unit 3: Intake & Document Service** | Units 1, 2 | Units 4, 5, 6 | **P3 (High - Application Data Entry)** |
| **Unit 4: Compliance & EAS Signature** | Units 1, 2, 3 | Units 5, 6 | **P4 (Medium - External Approval)** |
| **Unit 5: Auto-Provisioning & SLA Daemon** | Units 1, 2, 3, 4 | Unit 6 | **P5 (Medium - Background & Core)** |
| **Unit 6: Next.js Enterprise Web Portal** | Units 1, 2, 3, 4, 5 | End-to-End System | **P6 (Final Integration & UI)** |

---

## 2. Dependency Graph

```mermaid
flowchart TD
    U1["Unit 1: Core Domain & EF Core DB Schema"]
    U2["Unit 2: Authentication & RBAC Service"]
    U3["Unit 3: Application Intake & Document Service"]
    U4["Unit 4: Compliance Screening & EAS Integration"]
    U5["Unit 5: 100% Automated Provisioning & SLA Daemon"]
    U6["Unit 6: Next.js Enterprise Web Portal & Dashboards"]
    BT["Build and Test (Final Integrated Verification)"]

    U1 --> U2
    U2 --> U3
    U3 --> U4
    U4 --> U5
    U5 --> U6
    U6 --> BT

    style U1 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U2 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U3 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U4 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U5 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U6 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style BT fill:#2196F3,stroke:#0D47A1,stroke-width:3px,color:#fff

    linkStyle default stroke:#333,stroke-width:2px
```

### Text Alternative
```
Sequential Construction Sequence:
1. Unit 1: Core Domain & EF Core Schema (Foundation)
2. Unit 2: Authentication & RBAC (Security Layer)
3. Unit 3: Application Intake & Document Service (Intake Layer)
4. Unit 4: Compliance Screening & EAS Engine (External Review Layer)
5. Unit 5: 100% Automated Provisioning & SLA Auto-Suspension Daemon (Core Automation)
6. Unit 6: Next.js Enterprise Web Portal & Operational Dashboards (User Experience)
7. Final Stage: Build and Test across all units
```

---

## 3. Per-Unit Construction Checkpoints
Each unit will execute through the full Construction lifecycle:
1. **Functional Design**: Domain schemas, DTOs, endpoint signatures, reject checklists.
2. **NFR Requirements**: Security baseline, resiliency, and property-based test invariants.
3. **NFR Design**: Logging, circuit breakers, encryption, and error handling.
4. **Infrastructure Design**: EF Core mapping, BackgroundService configuration, and API routes.
5. **Code Generation**: Part 1 (Planning) + Part 2 (Generation) for implementation and test code.
