'use client';

import React from 'react';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';

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
    <html lang="th">
      <head>
        <title>ระบบบริหารจัดการตัวแทนและนายหน้า | บริษัท เทเวศประกันภัย จำกัด (มหาชน)</title>
        <meta
          name="description"
          content="ระบบบริหารจัดการตัวแทนและนายหน้าประกันวินาศภัย เทเวศประกันภัย (Deves Insurance)"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#F8F9FA] text-[#212529] min-h-screen antialiased flex flex-col font-sans">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
