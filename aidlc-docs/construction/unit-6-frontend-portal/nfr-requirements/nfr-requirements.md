# Non-Functional Requirements (NFR) — Unit 6: Next.js Enterprise Web Portal

## Overview
This document defines the quantitative Non-Functional Requirements (NFR) for **Unit 6: Next.js Enterprise Web Portal & Operational Dashboards**, governing client performance, security baselines, design aesthetics, PII protection, and operational resilience.

---

## 1. Performance & Responsiveness Requirements

| Requirement ID | Category | Target Metric | Implementation Strategy |
|---|---|---|---|
| `NFR-PERF-01` | First Contentful Paint (FCP) | $< 1.2$ seconds | Next.js Server Components, optimized font preloading, critical CSS inlining |
| `NFR-PERF-02` | Time to Interactive (TTI) | $< 2.0$ seconds | Route splitting, lazy-loaded modals and drawer components |
| `NFR-PERF-03` | Client-Side State Querying | $< 50$ ms | TanStack Query with in-memory caching (`staleTime: 30_000`), automatic background revalidation |
| `NFR-PERF-04` | Persona Switching Latency | $< 100$ ms | Instantaneous in-memory context swap, optimistic UI rerendering |
| `NFR-PERF-05` | Binary Magic Byte Verification | $< 10$ ms | Instant `ArrayBuffer` slice inspection of first 8 bytes prior to network transmission |

---

## 2. Security Baseline & PII Protection

| Requirement ID | Category | Specification | Implementation Strategy |
|---|---|---|---|
| `NFR-SEC-01` | XSS Protection | Zero unescaped HTML injection | React JSX automatic escaping, strict Content Security Policy (CSP) headers |
| `NFR-SEC-02` | Sensitive PII Masking | Default masking on tables & lists | Thai National ID masked as `1-1004-XXXXX-XX-3`, Bank Account masked as `XXX-X-XX123-4` |
| `NFR-SEC-03` | Role-Gated Unmasking | Authorized access only | Eye icon unmasks PII only if current role is `branch_officer`, `ho_reviewer`, or `admin` |
| `NFR-SEC-04` | Anti-Spoofing File Upload | Client-side signature check | Verifies `%PDF` (`\x25\x50\x44\x46`), `JPEG` (`\xFF\xD8\xFF`), `PNG` (`\x89\x50\x4E\x47`) before upload |
| `NFR-SEC-05` | Token Lifecycle | JWT In-memory storage | Access token stored in memory state; automatic 401 interceptor for refresh token rotation |

---

## 3. Visual Design, Aesthetics & Usability Standards

| Requirement ID | Category | Specification | Implementation Strategy |
|---|---|---|---|
| `NFR-UI-01` | Design Aesthetics | Enterprise Glassmorphism | Dark/Light theme toggle, translucent card backdrops (`backdrop-blur-md`), subtle gradients |
| `NFR-UI-02` | Typography | Professional Bilingual Fonts | Sarabun & Prompt for Thai, Inter for English numerals and codes |
| `NFR-UI-03` | Micro-Animations & Feedback | Smooth interactive feedback | CSS transitions on hover, animated loading spinners, progress bar indicators |
| `NFR-UI-04` | Responsive Breakpoints | Mobile, Tablet, Desktop | Full responsiveness across `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px) |
| `NFR-UI-05` | Notification & Toast Engine | Non-intrusive action feedback | Toast notifications with auto-dismiss (4s), color-coded alerts (Success, Info, Warning, Error) |

---

## 4. Reliability & Client-Side Error Boundaries

| Requirement ID | Category | Specification | Implementation Strategy |
|---|---|---|---|
| `NFR-REL-01` | Network Fault Resilience | Graceful degradation | Automatic retry on transient network failures with exponential backoff via TanStack Query |
| `NFR-REL-02` | Standalone Demo Engine | 100% offline preview capability | In-memory local demo mock provider with preloaded mock applications for all 6 personas |
| `NFR-REL-03` | Error Boundary Coverage | Zero uncaught UI crashes | React Error Boundary components wrapping pages and critical widget containers |
