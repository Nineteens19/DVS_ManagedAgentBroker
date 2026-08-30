'use client';

import React from 'react';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Header } from '../components/layout/Header';
import { PersonaSwitcherBar } from '../components/layout/PersonaSwitcherBar';
import { Sidebar } from '../components/layout/Sidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <title>Agent & Broker Management System | ระบบบริหารจัดการตัวแทนและนายหน้า</title>
        <meta name="description" content="Enterprise Non-Life Insurance Agent & Broker Intake, Compliance, Approval & Automated Core Provisioning Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased flex flex-col font-sans">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                {/* 1. Top Persona Demo Switcher Bar */}
                <PersonaSwitcherBar />

                {/* 2. Top Header Navigation */}
                <Header />

                {/* 3. Main Body Container with Sidebar */}
                <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 gap-6">
                  <Sidebar />
                  <main className="flex-1 min-w-0">{children}</main>
                </div>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
