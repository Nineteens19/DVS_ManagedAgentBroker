# Code Generation Plan — Unit 6: Next.js Enterprise Web Portal & Operational Dashboards

## Purpose
This plan details the step-by-step implementation tasks for **Unit 6: Next.js Enterprise Web Portal & Operational Dashboards**, creating a complete, modern, responsive Next.js 14 application with TypeScript, Tailwind CSS, TanStack Query, and interactive operational consoles for all 6 enterprise personas.

---

## Proposed Changes & Generation Steps

### Step 1: Project Tooling & Configurations
- Create `src/frontend/package.json`
- Create `src/frontend/tsconfig.json`
- Create `src/frontend/tailwind.config.ts`
- Create `src/frontend/postcss.config.js`
- Create `src/frontend/next.config.js`
- Create `src/frontend/.env.local`
- Create `src/frontend/app/globals.css` (Enterprise glassmorphism styling, CSS custom properties, scrollbars, micro-animations)

### Step 2: Types, Services & Mock Data Engine
- Create `src/frontend/types/domain.ts` (Full TypeScript interfaces matching backend models)
- Create `src/frontend/services/fileValidation.ts` (Client-side Magic Byte binary header inspection)
- Create `src/frontend/services/mockDataEngine.ts` (In-memory seed applications across all 12 domain lifecycle states)
- Create `src/frontend/services/apiClient.ts` (Hybrid dual-mode client: REST API with automatic mock fallback)

### Step 3: Context State Providers
- Create `src/frontend/context/AuthContext.tsx` (6 Persona state switcher, branch scope, RBAC capabilities)
- Create `src/frontend/context/ToastContext.tsx` (Global floating toast alerts)
- Create `src/frontend/context/ThemeContext.tsx` (Dark/Light mode provider)

### Step 4: Reusable UI Atoms & Layout Shell
- Create `src/frontend/components/ui/StatusBadge.tsx`
- Create `src/frontend/components/ui/SlaCountdownBadge.tsx`
- Create `src/frontend/components/ui/PiiMaskedField.tsx`
- Create `src/frontend/components/ui/MagicByteDropzone.tsx`
- Create `src/frontend/components/ui/Modal.tsx`
- Create `src/frontend/components/ui/DataTable.tsx`
- Create `src/frontend/components/layout/Header.tsx`
- Create `src/frontend/components/layout/PersonaSwitcherBar.tsx`
- Create `src/frontend/components/layout/Sidebar.tsx`

### Step 5: Application Intake Wizard (4 Steps)
- Create `src/frontend/components/wizard/WizardStepper.tsx`
- Create `src/frontend/components/wizard/Step1ApplicantProfile.tsx` (Real-time Thai National ID Modulo 11 check)
- Create `src/frontend/components/wizard/Step2GuarantorCollateral.tsx` (Guarantor, Land Deed, Credit Terms)
- Create `src/frontend/components/wizard/Step3DocumentUpload.tsx` (Drag & drop with binary magic byte validation)
- Create `src/frontend/components/wizard/Step4ReviewSubmit.tsx` (Complete review card, checklist, Submit action)

### Step 6: Operational Role Pages & Consoles
- Create `src/frontend/app/layout.tsx` (Root shell wrapping providers & navigation)
- Create `src/frontend/app/page.tsx` (Main Dashboard with role metrics & recent activity)
- Create `src/frontend/app/intake/new/page.tsx` (Branch Officer Intake Wizard)
- Create `src/frontend/app/review/page.tsx` (Head Office Review Queue, AMLO/OIC Screen, Deficiency Modal)
- Create `src/frontend/app/approval/page.tsx` (MD Executive Approval Console, PEP/Orange Warning Badge, 1-Click Approve/Reject)
- Create `src/frontend/app/provisioning/page.tsx` (Premium Reviewer Credit Limit & 100% Core Auto-Provisioning Monitor)
- Create `src/frontend/app/archive/page.tsx` (Legal Auditor Hard-Copy Archive Console & ActivePermanent Upgrade)
- Create `src/frontend/app/sla-dashboard/page.tsx` (Executive SLA Countdown & Auto-Suspension Dashboard)

### Step 7: Root Monorepo Orchestration & Verification
- Create root `package.json` with convenience scripts (`npm run dev`, `npm run build`)
- Create `docker-compose.yml` for unified local stack deployment
- Verify code integrity and run backend integration test suites

---

## Execution Checklist

- [ ] Step 1: Implement Project Tooling & Global Styles
- [ ] Step 2: Implement Types, Services & Mock Data Engine
- [ ] Step 3: Implement Context State Providers
- [ ] Step 4: Implement Reusable UI Atoms & Layout Shell
- [ ] Step 5: Implement Application Intake Wizard (4 Steps)
- [ ] Step 6: Implement Operational Role Pages & Consoles
- [ ] Step 7: Implement Root Monorepo Orchestration & Verification
