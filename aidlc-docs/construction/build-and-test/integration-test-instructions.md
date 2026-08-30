# Integration Test Instructions — Insurance Agent & Broker Management System

## Purpose
Validate end-to-end integration workflows across database persistence, background services, multi-system core sync, email notifications, and frontend API interactions.

---

## Key Integration Scenarios

### Scenario 1: Intake $\rightarrow$ Magic Byte Verification $\rightarrow$ Database Storage
- **Description**: Verify file upload stream validates magic byte header (PDF `%PDF`, JPEG `FFD8FF`, PNG `89504E47`), persists binary to disk, and records metadata in `Attachments` table with SHA-256 integrity hash.
- **Verification**: `FileStorageServiceTests` and `ApplicationIntakeServiceTests`.

### Scenario 2: Head Office Review $\rightarrow$ AMLO/OIC Screening $\rightarrow$ Executive E-Approval
- **Description**: Verify AMLO screening identifies PEP/Sanctions, triggers notification email to Executive Approver, and records decision in audit trail without third-party EAS dependency.
- **Verification**: `ComplianceScreeningServiceTests`, `NativeExecutiveApprovalServiceTests`, and `SmtpEmailNotificationServiceTests`.

### Scenario 3: Executive Approval $\rightarrow$ 100% Automated Multi-System Provisioning
- **Description**: Verify approval triggers sequential automated provisioning across AS400, APAR, SAP, and PCSDIS, records transaction IDs, assigns `AgentCode` / `SourceCode`, and starts 30-day SLA countdown in `ActiveTemporary` status.
- **Verification**: `DevesMasterProvisioningServiceTests` and `CoreSystemSyncOrchestratorTests`.

### Scenario 4: Background SLA Daemon $\rightarrow$ Auto-Suspension & Termination
- **Description**: Verify `SlaSuspensionBackgroundDaemon` evaluates `Sla30DayDeadline`, transitions non-compliant applications to `Suspended30D`, and terminates expired applications at 90 days.
- **Verification**: `SlaSuspensionBackgroundDaemonTests` and `SlaCountdownTests`.

### Scenario 5: Legal Hard-Copy Archive $\rightarrow$ ActivePermanent Upgrade
- **Description**: Verify legal auditor box number assignment upgrades application status to `ActivePermanent` and clears suspension counters.
- **Verification**: `LegalContractArchiveServiceTests`.

---

## Running Integration Verification
```bash
# Run all automated integration and domain tests
dotnet test --filter "Category=Integration" || dotnet test
```
