# NFR Design Plan — Unit 6: Next.js Enterprise Web Portal & Operational Dashboards

## Purpose
This plan specifies the technical component architecture, frontend design patterns, state management models, and resiliency mechanisms for **Unit 6: Next.js Enterprise Web Portal & Operational Dashboards**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Logical Components & UI Architecture (`logical-components.md`)**
  - [x] Layout & Navigation Shell (Persona Switcher, Sidebar, Topbar, Dark/Light Theme Toggle)
  - [x] Application Intake Wizard (Step 1-4 Form Components, Drag-and-Drop Uploader with Magic Byte Reader)
  - [x] Operational Queue & Table Components (Sortable, Searchable, Filterable with PII Masking Toggle)
  - [x] Action Modals & Drawers (Executive Approval Modal, Rejection Checklist, Core Provisioning Progress Monitor, Archive Box Assign)
  - [x] SLA Metrics & Dashboard Visualizations

- [x] **Step 2: Define Frontend NFR Design Patterns (`nfr-design-patterns.md`)**
  - [x] Hybrid API Client Pattern (Axios/Fetch Interceptor with Mock Fallback for standalone demo)
  - [x] Optimistic Mutation & Cache Invalidation Pattern via TanStack Query
  - [x] Form Validation Pattern with Live Modulo 11 Checksum and Magic Byte Header Analyzer
  - [x] Error Boundary & Toast Notification Dispatcher Pattern

---

## Planning Questions for Unit 6 NFR Design

Please answer the following questions to help guide the NFR Design. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Frontend State Management & Data Fetching Architecture
สำหรับการจัดการ State และการดึงข้อมูลบน Next.js Web Portal:

A) **TanStack Query + React Context State Engine**:
   - ใช้ TanStack Query (React Query v5) จัดการ Server State Caching, Background Refetching, และ Optimistic UI Updates
   - ใช้ React Context / Custom Hooks สำหรับ Local UI State, Persona Switching, และ Theme Toggle ซึ่งเบา ยืดหยุ่น และมีประสิทธิภาพสูง *(Recommended)*

B) Redux Toolkit (RTK): ใช้ Redux Store แบบดั้งเดิม

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Application Intake Draft Auto-Save Strategy
สำหรับการกรอกใบสมัครใน Wizard เพื่อป้องกันข้อมูลสูญหายหากผู้ใช้งานเผลอปิดแท็บหรือไฟดับ:

A) **Dual Auto-Save (LocalStorage + Backend Draft API)**:
   - บันทึกข้อมูลลง `localStorage` อัตโนมัติแบบ Debounced (ทุก 3 วินาที) เมื่อมีการพิมพ์
   - พร้อมมีปุ่ม "บันทึกร่าง (Save Draft)" เพื่อ Sync ส่งข้อมูลไปยัง Backend API เก็บเป็นสถานะ `Draft` *(Recommended)*

B) Manual Save Only: บันทึกเฉพาะเมื่อผู้ใช้กดปุ่ม "บันทึกร่าง" เท่านั้น

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
