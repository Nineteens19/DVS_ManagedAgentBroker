# Unit Test Execution — Insurance Agent & Broker Management System

## Overview
The unit test suite validates domain invariants, AES-256-GCM encryption converters, Thai National ID Modulo 11 validation, PBKDF2 password hashing, JWT authorization policies, AMLO/OIC screening, SLA suspension state machine, and Property-Based Testing (PBT-01 through PBT-06).

---

## 1. Execute All Unit Tests
```bash
# Run all unit tests across Domain and Infrastructure test assemblies
dotnet test
```

## 2. Execute Specific Test Assemblies
```bash
# Run Domain unit tests
dotnet test tests/backend/ManagedAgentBroker.Domain.Tests

# Run Infrastructure unit tests
dotnet test tests/backend/ManagedAgentBroker.Infrastructure.Tests
```

## 3. Review Test Results & Coverage
- **Total Test Cases**: 65
- **Passed**: 65
- **Failed**: 0
- **Skipped**: 0
- **Duration**: ~11 seconds
- **Key Test Categories**:
  - `Domain Invariants`: Thai ID Modulo 11, Credit term constraints (Motor 15/30/31D, Non-motor <= 45D), State machine lifecycle transitions.
  - `Security Baseline`: AES-256-GCM column encryption, PBKDF2 hashing, HS256 JWT claims validation.
  - `Property-Based Testing (PBT)`:
    - PBT-01: Modulo 11 check digit verification under pseudo-random variations.
    - PBT-02: AES-256-GCM encryption/decryption round-trip invariance across 50 random national IDs.
    - PBT-03: Motor payment terms restricted to `{15, 30, 31}`.
    - PBT-04: Non-motor payment terms bounded to $[1, 45]$.
    - PBT-05: AMLO/OIC screening classification invariance.
    - PBT-06: SLA suspension daemon deadline state transitions.
