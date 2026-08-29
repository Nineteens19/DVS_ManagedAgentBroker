# Unit of Work Plan

## Purpose
This plan outlines the methodology and execution steps to decompose the **Agent & Broker Management System** into cohesive, modular Units of Work for construction and verification.

---

## Execution Checklist (Part 2: Generation)

- [x] **Step 1: Generate Unit of Work Definitions (`unit-of-work.md`)**
  - [x] Define Unit 1: Core Domain, Database Schema & EF Core Infrastructure
  - [x] Define Unit 2: Authentication, RBAC & Organization Directory Service
  - [x] Define Unit 3: Application Intake & Document Management Service (F-CM-035 & F-CM-018)
  - [x] Define Unit 4: Compliance Screening & EAS Electronic Signature Engine
  - [x] Define Unit 5: Automated Provisioning & SLA Auto-Suspension Background Daemon
  - [x] Define Unit 6: Next.js Enterprise Web Portal & Operational Dashboards
  - [x] Document Greenfield directory structure and code organization strategy

- [x] **Step 2: Generate Unit Dependency Matrix (`unit-of-work-dependency.md`)**
  - [x] Define dependency graph across units
  - [x] Establish construction execution order and integration checkpoints

- [x] **Step 3: Generate Story-to-Unit Mapping (`unit-of-work-story-map.md`)**
  - [x] Map US-1.1, US-1.2, US-2.1, US-2.2, US-3.1, US-3.2, US-4.1, US-5.1, US-5.2, US-6.1, US-6.2 to their respective units
  - [x] Ensure 100% story coverage and traceability

---

## Planning Questions for Unit Decomposition

Please answer the following questions to guide the code organization and construction sequencing. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Codebase Directory Structure (Greenfield Monorepo)
คุณต้องการให้จัดวางโครงสร้างโฟลเดอร์ของโปรเจกต์ใน Workspace Root อย่างไร?

A) Monorepo Structure:
   - `src/backend/` (ASP.NET Core Solution: Domain, Application, Infrastructure, Api)
   - `src/frontend/` (Next.js 14+ Application: components, app, lib, styles)
   - `tests/` (xUnit tests, PBT tests, E2E tests)

B) Separate Flat Structure (`backend/`, `frontend/`)

C) Multi-Project Solution Root with nested projects

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Construction Phase Execution Strategy
เมื่อเข้าสู่ระยะ CONSTRUCTION Phase คุณต้องการให้ดำเนินการออกแบบและสร้างโค้ดทีละ Unit ตามลำดับ Dependency อย่างไร?

A) Sequential Unit-by-Unit Execution (สร้างและทดสอบเสร็จสมบูรณ์ทีละ Unit ตั้งแต่ Unit 1 (Domain/DB) -> Unit 2 (Auth) -> Unit 3 (Intake) -> Unit 4 (Compliance/EAS) -> Unit 5 (Auto-Provisioning/SLA Daemon) -> Unit 6 (Next.js Portal))

B) Backend-First then Frontend (สร้าง Unit 1-5 รวมกันก่อน แล้วตามด้วย Unit 6 UI)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
