# Deployment Architecture — Unit 5: Automated Provisioning & Background SLA Suspension Daemon

This document details the network topology, service connectivity, and background daemon execution model.

---

## 1. Network Topology & Core System Integration

```
[ASP.NET Core Web API / Daemon Pod]
  |
  +--- (HTTPS 443) ---> [Deves Master Central Service]
  |
  +--- (HTTPS 443) ---> [AS400 Core Insurance Integration Gateway]
  |
  +--- (HTTPS 443) ---> [APAR Accounting Gateway]
  |
  +--- (HTTPS 443) ---> [SAP ERP Financials Gateway]
  |
  +--- (HTTPS 443) ---> [PCSDIS Broker System Gateway]
  |
  +--- (TCP 1433) ----> [Microsoft SQL Server 2022]
  |
  +--- (TCP 587/1025) -> [Corporate SMTP / Local Mailpit]
```

---

## 2. Environment Variables & Secret Configuration

| Variable Name | Environment | Description |
|---|---|---|
| `ProvisioningSettings__UseSandboxSimulators` | Dev/Test: `true`, Prod: `false` | Controls mock vs real REST client |
| `ProvisioningSettings__DevesMasterEndpoint` | Production URL | Base endpoint for Deves Master code generation |
| `ProvisioningSettings__SlaDaemonIntervalMinutes` | Default: `60` | Background monitoring execution frequency |
