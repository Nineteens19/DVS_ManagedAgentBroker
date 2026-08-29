# Consolidated Application Design Specification — Agent & Broker Management System

## Executive Summary
This document consolidates the complete architectural specification, component topology, API method contracts, and service orchestration flows for the **Agent & Broker Management System (ระบบบริหารจัดการตัวแทนนายหน้า)**.

---

## 1. Architectural Blueprint & Layering

The system is built on **Clean Architecture** with strict layer decoupling:

1. **Presentation Layer**:
   - **Frontend**: Next.js 14+ (React, TypeScript, Tailwind CSS, TanStack Query)
   - **Backend API**: ASP.NET Core 8 Web API (RESTful, OpenAPI/Swagger, JWT/OAuth2 Authentication)
2. **Application Layer**:
   - Application Intake, Compliance Screening Orchestrator, EAS Workflow Engine, 100% Automated Multi-System Provisioning Engine, and SLA Compliance Daemon.
3. **Core Domain Layer**:
   - `AgentApplicationAggregate`, `ComplianceScreeningEntity`, `CoreProvisioningTransactionEntity`, `PhysicalContractRecordEntity`, Value Objects, State Machine Enums.
4. **Infrastructure Layer**:
   - Entity Framework Core 8, MS SQL Server 2022, AES-256 Encrypted File Storage, and Typed External HTTP API Clients (AS400, SAP, APAR, PCSDIS, AMLO, OIC, EAS).

---

## 2. Key Design Tenets & Solutions

### 2.1 Provisional Selling Rights (เปิดขายชั่วคราว)
Upon executive approval via EAS and credit confirmation by the Premium Department, the system automatically activates provisional selling rights (`ACTIVE_TEMPORARY`), allowing the agent to commence selling immediately while initiating a 30-day SLA window for hard-copy submission.

### 2.2 100% Automated Multi-System Provisioning
Eliminates legacy manual IT data entry. Event-driven background flows automatically provision agent codes in **AS400**, map accounts in **APAR**, create business partners in **SAP**, and configure nodes/UE/commissions in **PCSDIS** with idempotent retry handling, fulfilling **ISO 27001 segregation of duties**.

### 2.3 Automated Policy Submission Blocking (Auto-Suspend Daemon)
A background compliance daemon evaluates active provisional agents daily:
- **At Day 31 (SLA Breached)**: Automatically calls AS400 and PCSDIS APIs to set status to `SUSPENDED_TEMPORARY` and block all new policy submissions.
- **At Day 91 (Contract Expired)**: Automatically calls all core systems to set status to `TERMINATED_PERMANENT`.

### 2.4 EAS Integration & Single Sign-On
Seamlessly bridges with the internal EAS system for executive digital signatures via HMAC SHA-256 authenticated webhooks, and integrates with enterprise Active Directory for Single Sign-On (SSO).

---

## 3. Related Design Artifacts
- Component Definitions: [`components.md`](file:///Users/nineteen/DVS/managedAgentBroker/aidlc-docs/inception/application-design/components.md)
- Method Contracts & Signatures: [`component-methods.md`](file:///Users/nineteen/DVS/managedAgentBroker/aidlc-docs/inception/application-design/component-methods.md)
- Service Pipelines & Orchestration: [`services.md`](file:///Users/nineteen/DVS/managedAgentBroker/aidlc-docs/inception/application-design/services.md)
- Component Dependencies & Data Flows: [`component-dependency.md`](file:///Users/nineteen/DVS/managedAgentBroker/aidlc-docs/inception/application-design/component-dependency.md)
