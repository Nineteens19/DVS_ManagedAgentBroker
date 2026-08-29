# Deployment Architecture — Unit 4: Compliance Screening & Native Approval Engine

This document specifies the deployment topology, network boundaries, and environment secret injection for email and compliance services.

---

## 1. Network Topology & Service Boundaries

```
[Browser / Frontend Client]
           |
      HTTPS (443)
           v
[ASP.NET Core Web API (Port 5000)]
      |              |               \
      |              |                +---> [Mailpit Local (Port 1025)] /
      |              |                      [Corporate SMTP (Port 587)]
      |              v
      |      [External AMLO / OIC Gateway]
      |      (HTTPS 443 with Polly Timeout/Retry)
      v
[SQL Server 2022 (Port 1433)]
```

---

## 2. Environment Variables & Secret Injections

| Environment Variable | Production Value / Description | Sensitive |
|---|---|---|
| `EmailSettings__SmtpHost` | Enterprise SMTP server address | No |
| `EmailSettings__SmtpPort` | `587` | No |
| `EmailSettings__SenderEmail` | `noreply@insurance-broker.com` | No |
| `EmailSettings__Username` | SMTP Service Principal Username | Yes |
| `EmailSettings__Password` | SMTP Service Principal Password (from Key Vault / Secrets Manager) | Yes |
| `EmailSettings__UseInMemoryFallback` | `false` in Prod / `true` in Dev & CI | No |
