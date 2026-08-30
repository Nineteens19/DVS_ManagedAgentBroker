# Logical Components & UI Architecture — Unit 6: Next.js Enterprise Web Portal

## Overview
This document specifies the component hierarchy, module breakdown, layout shell, and component interaction models for the **Next.js 14+ Enterprise Web Portal**.

---

## 1. Component Hierarchy & Directory Architecture

```
src/frontend/
├── app/
│   ├── layout.tsx                    # Root Layout with Font Preloading, QueryClient, ThemeProvider
│   ├── page.tsx                      # Root Home / Role Router Redirect
│   ├── intake/
│   │   ├── new/page.tsx              # Application Intake Wizard (4 Steps)
│   │   └── [id]/page.tsx             # Application Detail / Edit View
│   ├── review/
│   │   └── page.tsx                  # Head Office Review Worklist & Deficiency Console
│   ├── approval/
│   │   └── page.tsx                  # MD / Executive Approval Console
│   ├── provisioning/
│   │   └── page.tsx                  # Premium Review & 100% Core Auto-Provisioning Monitor
│   ├── archive/
│   │   └── page.tsx                  # Legal Contract Archiving & Box Number Management
│   └── sla-dashboard/
│       └── page.tsx                  # Executive SLA Countdown & Risk Matrix Dashboard
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Top Navigation Bar with Logo & User Profile
│   │   ├── PersonaSwitcherBar.tsx    # 1-Click Persona Demo Switcher (6 Roles)
│   │   ├── Sidebar.tsx               # Role-Gated Navigation Menu
│   │   ├── ThemeToggle.tsx           # Dark / Light Glassmorphism Mode Switcher
│   │   └── Breadcrumb.tsx            # Contextual Navigation Path
│   ├── wizard/
│   │   ├── WizardStepper.tsx         # 4-Step Progress Indicator
│   │   ├── Step1ApplicantProfile.tsx # Profile Form with Real-time Modulo 11 Validation
│   │   ├── Step2GuarantorCollateral.tsx # Guarantor, Land Deed & Credit Term Selector
│   │   ├── Step3DocumentUpload.tsx   # Drag-and-Drop Uploader with Magic Byte Inspector
│   │   └── Step4ReviewSubmit.tsx     # Full Summary Card, Checklist & Submission Action
│   ├── consoles/
│   │   ├── BranchWorklist.tsx        # Branch-specific Submissions & Status Tracking
│   │   ├── HoReviewWorklist.tsx      # All-Branch Review Queue & Compliance Trigger
│   │   ├── ExecutiveDecisionModal.tsx # One-Click Approval / Rejection with PEP Warning
│   │   ├── ProvisioningProgressCard.tsx # Live Multi-System Sync (AS400, APAR, SAP, PCSDIS)
│   │   ├── LegalArchiveModal.tsx     # Physical Box Number Recording & Upgrade Modal
│   │   └── SlaMetricsGrid.tsx        # SLA KPI Tiles (ActiveTemp, D-7, Suspended, Terminated)
│   └── ui/
│       ├── StatusBadge.tsx           # Color-Coded Domain Status Indicators
│       ├── SlaCountdownBadge.tsx     # Real-time SLA Deadline Countdown Badges
│       ├── PiiMaskedField.tsx        # Masked PII Field with Role-Gated Eye Icon Toggle
│       ├── MagicByteDropzone.tsx     # Binary Signature Validating File Dropzone
│       ├── ToastContainer.tsx        # Floating Toast Notification Engine
│       ├── Modal.tsx                 # Accessible Backdrop Modal Container
│       └── DataTable.tsx             # Sortable, Filterable, Paginated Enterprise Table
├── context/
│   ├── AuthContext.tsx               # User Persona, Active Role & Branch Scope
│   ├── ThemeContext.tsx              # Light / Dark Theme State
│   └── ToastContext.tsx              # Global Toast Notification Dispatcher
├── hooks/
│   ├── useApplications.ts            # TanStack Query Hook for Application Worklists
│   ├── useModulo11.ts                # Real-time Thai National ID Checksum Hook
│   └── useMagicByteValidator.ts      # Binary Header File Validator Hook
└── services/
    ├── apiClient.ts                  # Hybrid Dual-Mode REST API / Local Demo Provider
    ├── mockDataEngine.ts             # Preloaded Seed Applications for all 6 Roles
    └── fileValidation.ts             # Magic Byte Constants & Signature Verification
```

---

## 2. Layout Shell & Navigation Engine

```mermaid
flowchart TD
    Root[Root Layout (ThemeProvider + QueryClientProvider)] --> Shell[Enterprise App Shell]
    Shell --> TopBar[Header + Persona Switcher Bar]
    Shell --> MainArea[Main Content Area]
    MainArea --> Sidebar[Role-Filtered Sidebar]
    MainArea --> ViewPort[Dynamic Page Router ViewPort]
    ViewPort --> Wizard[Application Intake Wizard]
    ViewPort --> ReviewQ[Head Office Review Console]
    ViewPort --> ExecQ[MD Executive Approval Console]
    ViewPort --> ProvQ[Premium Review & Core Provisioning Monitor]
    ViewPort --> LegalQ[Legal Archiving & SLA Tracker]
    Shell --> Toast[Global Toast Notifications Container]
```

---

## 3. Persona-to-Page Routing Specification

| Role / Persona | Default Landing Page | Primary Allowed Routes |
|---|---|---|
| **Branch Officer** (`branch_officer`) | `/intake/new` | `/intake/new`, `/intake/[id]`, `/sla-dashboard` |
| **HO Reviewer** (`ho_reviewer`) | `/review` | `/review`, `/intake/[id]`, `/sla-dashboard` |
| **MD Executive** (`approver_md`) | `/approval` | `/approval`, `/intake/[id]`, `/sla-dashboard` |
| **Premium Reviewer** (`premium_reviewer`) | `/provisioning` | `/provisioning`, `/intake/[id]`, `/sla-dashboard` |
| **Legal Auditor** (`auditor_legal`) | `/archive` | `/archive`, `/sla-dashboard`, `/intake/[id]` |
| **System Admin** (`admin`) | `/sla-dashboard` | All Routes (`/intake`, `/review`, `/approval`, `/provisioning`, `/archive`, `/sla-dashboard`) |
