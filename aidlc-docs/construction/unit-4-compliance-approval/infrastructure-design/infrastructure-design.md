# Infrastructure Design — Unit 4: Compliance Screening & Native Approval Engine

This document defines configuration schemas, Mailpit Docker testing container, and database indexing for compliance records and approval state queries.

---

## 1. AppSettings Configuration Schema

### `appsettings.json`
```json
{
  "EmailSettings": {
    "SmtpHost": "localhost",
    "SmtpPort": 1025,
    "SenderEmail": "noreply@insurance-broker.com",
    "SenderName": "Agent & Broker Management System",
    "Username": "",
    "Password": "",
    "EnableSsl": false,
    "UseInMemoryFallback": true
  }
}
```

### `appsettings.Production.json`
```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.internal-relay.corp",
    "SmtpPort": 587,
    "SenderEmail": "noreply@insurance-broker.com",
    "SenderName": "Agent & Broker System (Production)",
    "EnableSsl": true,
    "UseInMemoryFallback": false
  }
}
```

---

## 2. Docker Compose Integration (Mailpit Container)

```yaml
  mailpit:
    image: axllent/mailpit:latest
    container_name: mab-mailpit
    restart: unless-stopped
    ports:
      - "1025:1025" # SMTP server
      - "8025:8025" # Web UI
    environment:
      MP_MAX_MESSAGES: 5000
      MP_DATA_FILE: /data/mailpit.db
    volumes:
      - mailpit-data:/data
```

---

## 3. Database Indexes

- `IX_ComplianceRecords_ApplicationId` (Unique 1:1 index)
- `IX_AgentApplications_Status_BranchCode` (Composite index for approval dashboards and queues)
