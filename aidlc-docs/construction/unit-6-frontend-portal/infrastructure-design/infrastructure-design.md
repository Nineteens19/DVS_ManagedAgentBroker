# Frontend Infrastructure Design & Tooling Configuration — Unit 6: Next.js Enterprise Web Portal

## Overview
This document defines the configuration schemas, package manifests, build toolchains, and environment settings for the **Next.js 14+ Enterprise Web Portal & Operational Dashboards**.

---

## 1. Package Manifest & Toolchain Dependencies (`src/frontend/package.json`)

```json
{
  "name": "managed-agent-broker-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tanstack/react-query": "^5.51.23",
    "lucide-react": "^0.428.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.14.14",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.9",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## 2. TypeScript Compiler Configuration (`src/frontend/tsconfig.json`)

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 3. Tailwind CSS & Design Token Configuration (`src/frontend/tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc2fd',
          400: '#36a2fa',
          500: '#0c87eb',
          600: '#026bc9',
          700: '#0355a2',
          800: '#074885',
          900: '#0c3d6e',
          950: '#082749',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-sarabun)', 'sans-serif'],
        display: ['var(--font-prompt)', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};

export default config;
```

---

## 4. Next.js Runtime Configuration (`src/frontend/next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['localhost', 'avatar.vercel.sh'],
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 5. Environment Variables Blueprint (`src/frontend/.env.example`)

```bash
# Backend REST API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Metadata
NEXT_PUBLIC_APP_NAME=Agent & Broker Management System
NEXT_PUBLIC_APP_VERSION=1.0.0

# Standalone Fallback Demo Mode (Enabled by default for seamless UI testing)
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```
