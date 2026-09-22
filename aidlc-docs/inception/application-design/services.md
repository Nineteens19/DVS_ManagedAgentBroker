# Service Orchestration & Pipelines — Agent & Broker Management System

This document specifies the service orchestration patterns, transaction lifecycles, and background event flows.

---

## 1. End-to-End Onboarding Service Orchestration

```
+----------------------------------------------------------------------------------------------------+
|                                    1. Application Intake Pipeline                                  |
| Branch BU Drafts (F-CM-035/018) -> Upload Attachments -> Input Validation -> Submit to Head Office |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                2. Automated Compliance Screening Pipeline                          |
| AMLO API (Sanctions/PEP) + OIC API (License Validity & Blacklist Rating: Green/Yellow/Orange/Red)  |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                             3. EAS Executive Approval & Signature Pipeline                         |
| Head Office Reviews -> Dispatches to EAS -> MD/Director E-Signs -> EAS Webhook Callback Received   |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                         4. 100% Automated Multi-System Provisioning Pipeline                       |
| Premium Dept Approves Credit Line -> Event Dispatched to Background Worker:                        |
|   -> Deves Master Core: Agent/Source Code & UE Created via 100% Validated Intake Payload          |
|   -> AS400 Core: Agent/Source Policy Issuance Selling Rights Activated                            |
|   -> APAR: Ledger Configured                                                                       |
|   -> SAP: Business Partner Financial Entity Created                                                |
|   -> PCSDIS: Node Created, Unit Executive (UE) Assigned, Commission Schedule Set                  |
| -> Application Promoted to "ACTIVE_TEMPORARY" (Provisional Selling Active)                         |
| -> 30-Day SLA Countdown Started on Calendar Days for Physical Contract Delivery                    |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                       5. SLA Contract Verification & Auto-Suspension Pipeline                      |
| Legal Dept inspects physical hard-copy:                                                            |
|   - If Received & Valid within 30d -> Promoted to "ACTIVE_PERMANENT" (Permanent Selling Rights)    |
|   - If Defect Found -> Defect Notice Issued (30-Day SLA Correction Countdown)                      |
|   - If SLA Breached (>30d) -> Tiered Auto-Suspension (Agent cascades all sources / Source specific) |
|   - If SLA Breached (>90d) -> Auto-Termination Daemon sets "TERMINATED_PERMANENT" across all cores|
+----------------------------------------------------------------------------------------------------+
```

---

## 2. 100% Automated Core Multi-System Provisioning Pipeline

### Resilient Event Orchestration
1. **Trigger**: When the application status transitions to `REVIEW_PREMIUM` and the Premium Officer confirms credit limits and collateral, an `AgentProvisioningRequestedEvent` is published to an in-process Channel/Queue.
2. **Execution Flow**:
   - `Step 1`: Call `IDevesMasterApiClient.ProvisionAgentAndSourceAsync` $\rightarrow$ generate `AgentCode`, `SourceCode(s)`, and register `UnitExecutiveCode (UE)`.
   - `Step 2`: Call `IAs400ApiClient.SyncAgentMasterAsync` with `AgentCode` and `SourceCode` to enable selling capability.
   - `Step 3`: Call `IAparApiClient.ConfigureLedgerAccountAsync` with `AgentCode`.
   - `Step 4`: Call `ISapApiClient.CreateBusinessPartnerAsync` with Tax ID and Bank Account.
   - `Step 5`: Call `IPcsdisApiClient.SetupNodeAndUeAsync` with branch node, assigned UE, and commission rate.
3. **Idempotency & Partial Failure Handling**:
   - Each step logs a `CoreProvisioningTransactionEntity` record with status `SUCCESS`, `PENDING`, or `FAILED`.
   - If any step fails due to a network glitch or service timeout, the step is tagged for **Exponential Backoff Retry** (Retries at 1m, 5m, 15m, 1h).
   - Once Deves Master creates the codes and core provisioning succeeds, the agent is promoted to `ACTIVE_TEMPORARY` (Provisional Selling Active).

---

## 3. SLA Compliance & Auto-Suspension Background Daemon

### Daemon Configuration
- **Mechanism**: `Microsoft.Extensions.Hosting.BackgroundService` registered as a Singleton hosted worker.
- **Execution Interval**: Executes daily at midnight (00:00:00) and can be manually triggered by IT Admin for audits.

### Daemon Evaluation Logic:
```csharp
public class SlaComplianceBackgroundWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var slaService = scope.ServiceProvider.GetRequiredService<ISlaSuspensionDaemonService>();
                
                // 1. Evaluate 30-Day SLA Breaches -> Trigger Auto-Suspension
                await slaService.RunDailySlaEvaluationAsync(stoppingToken);
            }
            
            // Wait for next scheduled run (or 24 hours)
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
```

### Auto-Suspension Action:
- When an application in `ACTIVE_TEMPORARY` has `DaysSinceSubmission > 30` and `HardCopyReceivedDate == null`:
  1. Update local database status to `SUSPENDED_30D`.
  2. Invoke `IAs400ApiClient.UpdateAgentStatusAsync(agentCode, "SUSPENDED")`.
  3. Invoke `IPcsdisApiClient.SetSubmissionPermissionAsync(agentCode, allowSubmission: false)`.
  4. Dispatch high-priority notification to Branch BU, Head Office BU, and Premium Dept.

---

## 4. EAS Electronic Approval Webhook Handler

```
+-----------+                +-------------------------+                +-----------------------+
|  EAS App  |                | ManagedAgentBroker.Api  |                | Application DbContext |
+-----------+                +-------------------------+                +-----------------------+
      |                                   |                                         |
      | 1. POST /api/v1/eas/webhook       |                                         |
      |---------------------------------->|                                         |
      |    (Payload + HMAC Signature)     | 2. Verify HMAC SHA-256 Signature        |
      |                                   |-----------------------------------------|
      |                                   |                                         |
      |                                   | 3. Retrieve Application Entity          |
      |                                   |---------------------------------------->|
      |                                   |                                         |
      |                                   | 4. Update Status: REVIEW_PREMIUM        |
      |                                   |    Store E-Signature Timestamp & Hash   |
      |                                   |---------------------------------------->|
      |                                   |                                         |
      | 5. 200 OK (Webhook Acknowledged)  |                                         |
      |<----------------------------------|                                         |
```
