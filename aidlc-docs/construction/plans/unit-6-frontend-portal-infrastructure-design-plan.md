# Infrastructure Design Plan — Unit 6: Next.js Enterprise Web Portal & Operational Dashboards

## Purpose
This plan specifies the build pipeline, dependency configurations, containerization, environment settings, and local hosting architecture for **Unit 6: Next.js Enterprise Web Portal & Operational Dashboards**.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Frontend Package & Tooling Configurations (`infrastructure-design.md`)**
  - [x] `package.json` dependencies (Next.js 14+, React 18, TanStack Query v5, Lucide React, Tailwind CSS)
  - [x] `tsconfig.json` paths and TypeScript 5 compiler settings
  - [x] `tailwind.config.ts` & `postcss.config.js` design tokens and color scales
  - [x] `next.config.js` standalone output, security headers, and compression

- [x] **Step 2: Define Containerization & Deployment Topology (`deployment-architecture.md`)**
  - [x] Multi-stage `Dockerfile.frontend` (builder, runner stages with Node.js Alpine)
  - [x] `docker-compose.yml` service definition (Port 3000 $\rightarrow$ Frontend, Port 5000 $\rightarrow$ Backend, Port 1433 $\rightarrow$ SQL Server)
  - [x] Environment variables schema (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_ENABLE_DEMO_MODE`)

---

## Planning Questions for Unit 6 Infrastructure Design

Please answer the following questions to help guide the Infrastructure Design. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: Next.js Deployment & Build Mode
สำหรับสถาปัตยกรรมการ Build และ Containerization ของระบบ Frontend Next.js:

A) **Multi-stage Next.js Standalone Container (Node.js Alpine)**:
   - ใช้ `output: 'standalone'` ใน `next.config.js` เพื่อ bundle เฉพาะ dependencies ที่จำเป็น
   - ผลิต Docker Image ขนาดเล็ก ($< 150$MB) ปลอดภัย และรองรับทั้ง Server Components, Dynamic Routing, และ API Proxy *(Recommended)*

B) Static HTML Export (`output: 'export'`): สำหรับรันเป็น static web hosting

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Monorepo Development & Local Run Script
สำหรับการรันและทดสอบระบบทั้งหมดในเครื่อง Development (ทั้ง Frontend Next.js และ Backend .NET API):

A) **Integrated Root Package Scripts**:
   - เพิ่ม `package.json` ที่ Root Workspace พร้อม scripts เช่น `npm run dev` หรือ shell script ในการ launch ทั้ง Next.js Frontend (Port 3000) และ .NET API (Port 5000) อย่างเป็นระเบียบ *(Recommended)*

B) แยกคำสั่งรันอิสระในแต่ละโฟลเดอร์

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
