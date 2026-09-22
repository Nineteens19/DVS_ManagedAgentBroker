# Component Dependencies & Communication Patterns — Agent & Broker Management System

This document maps the architectural dependencies and runtime communication flows across all system components.

---

## 1. Architectural Dependency Matrix

| Layer / Component | Depends On (Internal) | Depends On (External / Infrastructure) | Consumed By |
|---|---|---|---|
| **Domain** | None (Zero external dependencies) | None | Application, Infrastructure, Web API |
| **Application** | Domain | `IApplicationDbContext`, `IStorageService`, External Client Interfaces | Web API, Background Workers |
| **Infrastructure.Data** | Domain, Application (Interfaces) | Entity Framework Core, MS SQL Server 2022 | Web API (via DI registration) |
| **Infrastructure.Clients** | Domain, Application (Interfaces) | `HttpClient`, External REST APIs (AS400, SAP, APAR, PCSDIS, AMLO, OIC, EAS) | Application Services |
| **Infrastructure.BackgroundWorkers** | Application (Interfaces) | `Microsoft.Extensions.Hosting.BackgroundService` | Web API Runtime |
| **Web API (Presentation)** | Application, Domain, Infrastructure (DI) | ASP.NET Core 8, JWT/OAuth2, Swashbuckle | Next.js Frontend, EAS Webhooks |
| **Next.js Web Client** | Web API REST Endpoints | Axios / TanStack Query, NextAuth / AD SSO | End Users (All Personas) |

---

## 2. Dependency Graph

```mermaid
flowchart TD
    WebClient["Next.js Enterprise Web Portal"]
    WebAPI["ASP.NET Core 8 Web API"]
    
    subgraph APP_CORE["Core Application & Domain"]
        AppServices["Application Services & Handlers"]
        DomainCore["Domain Aggregates & Invariants"]
    end
    
    subgraph INFRA["Infrastructure Layer"]
        EFData["EF Core 8 / MS SQL Server 2022"]
        BgWorker["Background SLA Daemon Worker"]
        ExtClients["External API Connectors (Deves Master/AS400/SAP/APAR/PCSDIS/AMLO/OIC/EAS)"]
    end
    
    subgraph EXT_SYSTEMS["External Enterprise Ecosystem"]
        DevesMaster["Deves Mastermanagement Core"]
        AS400["AS400 Core System"]
        SAP["SAP Financials"]
        APAR["APAR Ledger System"]
        PCSDIS["PCS / PCSDIS System"]
        AMLO["AMLO Sanctions Service"]
        OIC["OIC Blacklist Service"]
        EAS["EAS E-Approval System"]
    end

    WebClient -->|HTTPS / JSON REST| WebAPI
    WebAPI --> AppServices
    AppServices --> DomainCore
    AppServices --> EFData
    AppServices --> ExtClients
    BgWorker --> AppServices
    EFData --> DomainCore
    
    ExtClients -->|REST / HTTPS| DevesMaster
    ExtClients -->|REST / HTTPS| AS400
    ExtClients -->|REST / HTTPS| SAP
    ExtClients -->|REST / HTTPS| APAR
    ExtClients -->|REST / HTTPS| PCSDIS
    ExtClients -->|REST / HTTPS| AMLO
    ExtClients -->|REST / HTTPS| OIC
    ExtClients -->|REST / HTTPS| EAS
    EAS -.->|Webhook / Callback| WebAPI

    style WebClient fill:#BBDEFB,stroke:#1565C0,stroke-width:2px,color:#000
    style WebAPI fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#000
    style AppServices fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px,color:#000
    style DomainCore fill:#FFE0B2,stroke:#F57C00,stroke-width:2px,color:#000
    style EFData fill:#E1BEE7,stroke:#8E24AA,stroke-width:2px,color:#000
    style BgWorker fill:#E1BEE7,stroke:#8E24AA,stroke-width:2px,color:#000
    style ExtClients fill:#E1BEE7,stroke:#8E24AA,stroke-width:2px,color:#000
```

### Text Alternative
```
1. Next.js Web Client communicates via HTTPS REST with ASP.NET Core 8 Web API.
2. Web API routes requests to Application Services.
3. Application Services manipulate Domain Aggregates and coordinate EF Core Data persistence and External API Connectors.
4. External API Connectors interact with AS400, SAP, APAR, PCSDIS, AMLO, OIC, and EAS.
5. Background SLA Daemon invokes Application Services daily for SLA evaluations.
6. EAS dispatches async Webhook callbacks to Web API.
```

---

## 3. Communication Sequences

### Automated Multi-System Provisioning Sequence
```
Branch/HO/Premium      AppService             AS400          APAR          SAP          PCSDIS
       |                   |                    |              |            |              |
       |-- Approve Credit->|                    |              |            |              |
       |                   |-- Create Agent --->|              |            |              |
       |                   |<-- Return Code ----|              |            |              |
       |                   |-- Map Ledger -------------------->|            |              |
       |                   |<-- Success -----------------------|            |              |
       |                   |-- Create BP Entity --------------------------->|              |
       |                   |<-- Success ------------------------------------|              |
       |                   |-- Setup Node, UE, Comm -------------------------------------->|
       |                   |<-- Success ---------------------------------------------------|
       |                   |
       |                   |-- Set Status: ACTIVE_TEMPORARY (Provisional Selling Active)
       |<-- Provisioned ---|
```
