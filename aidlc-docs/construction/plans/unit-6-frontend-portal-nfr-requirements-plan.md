# NFR Requirements Plan — Unit 6: Next.js Enterprise Web Portal & Operational Dashboards

## Purpose
This plan defines the Non-Functional Requirements (NFR) for **Unit 6: Next.js Enterprise Web Portal & Operational Dashboards**, covering performance targets, client-side security baselines, PII masking, responsive typography, and accessibility standards.

---

## Execution Checklist (Part 1: Planning)

- [x] **Step 1: Define Performance & Responsiveness Targets (`nfr-requirements.md`)**
  - [x] First Contentful Paint (FCP) $< 1.2$s, Time to Interactive (TTI) $< 2.0$s
  - [x] TanStack Query client caching, optimistic UI transitions, and pagination
  - [x] Debounced search inputs and lazy-loaded modals

- [x] **Step 2: Define Client Security & PII Protection Baselines (`nfr-requirements.md`)**
  - [x] In-browser PII masking (National ID / Bank Account Number masking `1-1004-XXXXX-XX-3` on public views)
  - [x] Anti-spoofing client-side Magic Byte binary header inspection
  - [x] Secure JWT token lifecycle and automatic token refresh interceptor

- [x] **Step 3: Define Usability, Theme & Typography Standards (`nfr-requirements.md`)**
  - [x] Modern Enterprise Glassmorphic Theme (Dark/Light mode support)
  - [x] Thai-English bilingual typography with Sarabun / Prompt / Inter font families
  - [x] Toast notification engine with auto-dismiss and accessibility ARIA labels

---

## Planning Questions for Unit 6 NFR Requirements

Please answer the following questions to help guide the NFR specifications. Fill in the letter choice after each `[Answer]:` tag.

### Question 1: UI Theme & Design Aesthetics
สำหรับหน้าตาและธีมของระบบ Enterprise Web Portal ต้องการรูปแบบ Visual Design อย่างไร?

A) **Modern Enterprise Glassmorphic Theme (Dark/Light Mode)**:
   - ดีไซน์ระดับพรีเมียมด้วย Glassmorphism, Subtle Gradients, Dark/Light Mode Switcher, Card Hover Micro-animations
   - การจัดวาง Dashboard ที่สวยงาม ทันสมัย ชัดเจน พร้อม Status Badges ที่สื่อความหมายชัดเจน *(Recommended)*

B) Standard Flat Corporate: ใช้ดีไซน์แบบธรรมดาทั่วไป

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: PII Data Masking on Frontend Displays
สำหรับการแสดงผลข้อมูลส่วนบุคคลที่มีความอ่อนไหว (PII) เช่น เลขบัตรประชาชน และเลขบัญชีธนาคาร บนหน้ารายการ (Application List / Table):

A) **Default Masked with Toggle**:
   - แสดงผลในรูปแบบ Masked เป็นค่าเริ่มต้น เช่น `1-1004-XXXXX-XX-3`
   - มีปุ่มลูกตา (Eye Icon) ให้กดเปิดดู (Unmask) ได้เฉพาะผู้ใช้งานที่มีสิทธิ์ตาม Role *(Recommended)*

B) แสดงผลแบบเต็ม 13 หลักตลอดเวลา

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
