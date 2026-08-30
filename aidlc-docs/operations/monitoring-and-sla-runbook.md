# Monitoring, Observability & SLA Runbook

## 1. Observability & Health Check Endpoints

| Endpoint | Protocol | Purpose |
|:---|:---|:---|
| `/healthz` | HTTP GET | Kubernetes liveness and readiness probe |
| `/swagger` | HTTP GET | OpenAPI / Swagger specification and interactive explorer |
| `/api/sla/metrics` | HTTP GET | Real-time SLA compliance matrix and active counts |

---

## 2. SLA Background Suspension Daemon Operations

### Daemon Architecture
- **Class**: `ManagedAgentBroker.Infrastructure.BackgroundJobs.SlaSuspensionBackgroundDaemon`
- **Execution Cadence**: Runs once every 60 minutes (`TimeSpan.FromHours(1)`).
- **Core Operations**:
  1. Queries all applications in `ActiveTemporary` where `Sla30DayDeadline < DateTime.UtcNow`.
  2. Transitions non-compliant applications to `Suspended30D`.
  3. Dispatches suspension event to Deves Master and AS400 Core System to block policy issuance.
  4. Queries applications in `Suspended30D` where `Sla90DayDeadline < DateTime.UtcNow`.
  5. Transitions overdue applications to `Terminated90D` and permanently revokes agent credentials.

### Manual Force-Trigger SLA Evaluation
In emergency or testing scenarios, trigger evaluation via API:
```bash
curl -X POST "http://localhost:5000/api/sla/evaluate" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

---

## 3. Incident Response & Core Sync Recovery Runbook

### Scenario A: AS400 / SAP Provisioning Network Timeout
1. Check `CoreSyncTransactions` table in SQL Server:
   ```sql
   SELECT * FROM CoreSyncTransactions WHERE Status = 'Failed';
   ```
2. Inspect `ErrorMessage` and timestamps.
3. Once the target Core System is back online, trigger the retry endpoint:
   ```bash
   curl -X POST "http://localhost:5000/api/provisioning/<APP_ID>/retry" \
     -H "Authorization: Bearer <PREMIUM_REVIEWER_TOKEN>"
   ```

### Scenario B: Accidental SLA Suspension (Hard Copy Arrived Late)
1. Legal Auditor logs into the portal (`/archive`).
2. Registers the physical archive box number (e.g. `BOX-2026-HQ-099`).
3. The system automatically clears the suspension reason, transitions the status to `ActivePermanent`, and reenables the agent in AS400.
