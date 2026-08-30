# Frontend NFR Design Patterns — Unit 6: Next.js Enterprise Web Portal

## Overview
This document specifies the software design patterns, client-side resilience mechanisms, API connectivity models, and security filters implemented in the **Next.js 14+ Enterprise Web Portal**.

---

## 1. Hybrid Dual-Mode API Client Pattern

To ensure seamless local execution and immediate visual verification without requiring a running SQL Server instance during frontend iterations, the API client implements a **Transparent Fallback Pattern**:

```mermaid
flowchart LR
    UI[Frontend Components] --> Client[apiClient.ts]
    Client --> HealthCheck{Backend API Available?}
    HealthCheck -- Yes --> Backend[ASP.NET Core 8 Web API]
    HealthCheck -- No (Fallback) --> MockEngine[mockDataEngine.ts (In-Memory Local DB)]
```

### Pattern Implementation Logic:
1. `apiClient.ts` attempts to send HTTP requests to `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`).
2. If the request times out or backend is offline, the client automatically falls back to `mockDataEngine.ts` with comprehensive pre-populated applications across all lifecycle stages.
3. State mutations in mock mode update in-memory state so that all transitions (Submit $\rightarrow$ Review $\rightarrow$ Compliance Screen $\rightarrow$ Executive Approve $\rightarrow$ Core Provisioning $\rightarrow$ Archive) function end-to-end interactively.

---

## 2. Optimistic Mutation & Cache Invalidation via TanStack Query

```typescript
// Pattern: Optimistic Update with Automatic Rollback
export function useSubmitApplication() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (applicationId: string) => apiClient.submitApplication(applicationId),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData<ApplicationListItem[]>(['applications']);

      // Optimistically update status to 'Submitted'
      queryClient.setQueryData<ApplicationListItem[]>(['applications'], (old = []) =>
        old.map((app) =>
          app.id === applicationId ? { ...app, status: 'Submitted' } : app
        )
      );

      return { previousApps };
    },
    onError: (err, applicationId, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['applications'], context.previousApps);
      }
      showToast({ type: 'error', title: 'การยื่นใบสมัครล้มเหลว', message: String(err) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      showToast({ type: 'success', title: 'สำเร็จ', message: 'ยื่นใบสมัครเรียบร้อยแล้ว' });
    }
  });
}
```

---

## 3. Client-Side Magic Byte Binary Verification Pattern

```typescript
// Pattern: FileReader ArrayBuffer Header Inspector
export async function verifyFileMagicBytes(file: File): Promise<{ isValid: boolean; detectedType?: string; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
        return resolve({ isValid: false, error: 'Cannot read file buffer' });
      }

      const arr = new Uint8Array(e.target.result).subarray(0, 8);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0').toUpperCase();
      }

      // Check PDF: 25 50 44 46 (%PDF)
      if (header.startsWith('25504446')) {
        return resolve({ isValid: true, detectedType: 'application/pdf' });
      }
      // Check JPEG: FF D8 FF
      if (header.startsWith('FFD8FF')) {
        return resolve({ isValid: true, detectedType: 'image/jpeg' });
      }
      // Check PNG: 89 50 4E 47
      if (header.startsWith('89504E47')) {
        return resolve({ isValid: true, detectedType: 'image/png' });
      }

      // Header spoofing detected
      resolve({
        isValid: false,
        error: 'รูปแบบไฟล์ไม่ถูกต้องตาม Header ลายเซ็นดิจิทัล (Security Violation: File spoofing detected)'
      });
    };

    // Read first 8 bytes only for optimal memory and speed
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}
```

---

## 4. Real-time Modulo 11 Thai National ID Checksum Pattern

```typescript
// Pattern: Real-time Checksum Validator Hook
export function validateThaiNationalId(id: string): boolean {
  if (!id || id.length !== 13 || !/^\d{13}$/.test(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }

  const remainder = sum % 11;
  const checkDigit = (11 - remainder) % 10;

  return checkDigit === parseInt(id.charAt(12), 10);
}
```

---

## 5. Modern Enterprise Glassmorphic Design System (Tailwind CSS Variables)

```css
/* Design System CSS Custom Properties */
:root {
  --bg-app: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.7);
  --border-card: rgba(255, 255, 255, 0.08);
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-primary: #3b82f6;
  --accent-primary-hover: #2563eb;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
}

.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-card);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}
```
