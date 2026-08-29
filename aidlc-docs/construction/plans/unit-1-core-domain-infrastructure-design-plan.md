# Infrastructure Design Plan — Unit 1: Core Domain & DB Schema

## Purpose
This plan outlines the infrastructure mapping, containerization, database hosting, and migration management for **Unit 1: Core Domain, Database Schema & EF Core Infrastructure**.

---

## Execution Checklist

- [x] **Step 1: Define Infrastructure Design (`infrastructure-design.md`)**
  - [x] MS SQL Server 2022 configuration (Collation: `Thai_100_CI_AI_SC_UTF8` / `Latin1_General_100_CI_AS_SC_UTF8`)
  - [x] Database connection string schemas and pooling settings (Max Pool Size: 100, Timeout: 30s)
  - [x] EF Core Migration strategy and seed data initialization

- [x] **Step 2: Define Deployment Architecture (`deployment-architecture.md`)**
  - [x] Local development Docker Compose configuration (`docker-compose.yml` with SQL Server 2022)
  - [x] Production High-Availability deployment topology (Always On Availability Groups / Azure SQL)

- [x] **Step 3: Define Shared Infrastructure Specification (`shared-infrastructure.md`)**
  - [x] Ports allocation: Web API (5000/5001), Next.js (3000), SQL Server (1433)
  - [x] Environment variables & Secret configuration matrix

---

## Planning Questions for Unit 1 Infrastructure Design

Please answer the following questions to guide the infrastructure setup. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Database Deployment & Local Development Setup
สำหรับการพัฒนาและการรันระบบในเครื่อง Development ต้องการให้จัดเตรียม SQL Server อย่างไร?

A) Docker Compose (`mcr.microsoft.com/mssql/server:2022-latest`) พร้อม Container Healthcheck และ Initial Volume Binding *(Recommended สำหรับความสะดวกในการรันและทดสอบ)*

B) เชื่อมต่อไปยัง Local/Remote SQL Server Instance ที่ติดตั้งไว้แล้วโดยตรง

C) LocalDB (`(localdb)\mssqllocaldb`)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Database Migration Strategy for Production
สำหรับการนำ Schema Migrations ไปรันบน Database Production ตามมาตรฐานความปลอดภัย ต้องการให้จัดการอย่างไร?

A) Idempotent SQL Script Generation (`dotnet ef migrations script --idempotent`) เพื่อให้ DBA / DevOps นำไป Review และ Deploy ผ่าน CI/CD Pipeline พร้อมรองรับ `context.Database.MigrateAsync()` ใน Development mode *(Recommended)*

B) Automatic Startup Migration (`context.Database.Migrate()`) รันทุกครั้งที่ Web API Boot up ในทุก Environment

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
