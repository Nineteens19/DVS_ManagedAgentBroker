# Shared Infrastructure Specification — Agent & Broker Management System

This document outlines the shared environment parameters, network ports, and cross-cutting infrastructure services used across all Units of Work.

---

## 1. Network Ports Allocation

| Service / Container | Default Port | Internal Docker Port | Description |
|---|---|---|---|
| **Next.js Web Portal** | `3000` | `3000` | Enterprise UI and NextAuth endpoints |
| **ASP.NET Core Web API** | `5000` (HTTP) / `5001` (HTTPS) | `8080` (HTTP) | REST API and Swagger UI |
| **MS SQL Server 2022** | `1433` | `1433` | Database engine and EF Core migrations |

---

## 2. Configuration & Secrets Environment Matrix

| Key | Example / Default | Description |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | `Server=localhost,1433;Database=ManagedAgentBrokerDb;User Id=sa;Password=DevPassword123!;TrustServerCertificate=True;` | Primary MS SQL Server connection string |
| `DataEncryption__Key` | `k8z/5j4Wq7n8vR3b1N6mP9t2s5v8y/B?E(H+MbQeThW` (Base64 32 bytes) | AES-256 Master Key for PII column encryption |
| `Jwt__Secret` | `SuperSecretJwtSigningKeyForManagedAgentBroker2026!` | Secret for signing JWT authentication tokens |
| `Jwt__Issuer` | `ManagedAgentBroker.Api` | Token issuer |
| `Jwt__Audience` | `ManagedAgentBroker.Web` | Token audience |
| `Smtp__Host` | `smtp.office365.com` | Corporate SMTP server for approval notifications |
| `Smtp__Port` | `587` | SMTP TLS port |
| `Smtp__SenderEmail` | `no-reply-agentbroker@company.co.th` | System sender address |
