'use client';

import React from 'react';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
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
    <html lang="th">
      <head>
        <title>ระบบบริหารจัดการตัวแทนและนายหน้า | บริษัท เทเวศประกันภัย จำกัด (มหาชน)</title>
        <meta
          name="description"
          content="ระบบบริหารจัดการตัวแทนและนายหน้าประกันวินาศภัย เทเวศประกันภัย (Deves Insurance)"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#F8F9FA] text-[#212529] min-h-screen antialiased flex flex-col font-sans">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              {/* 1. Top Persona Switcher Bar */}
              <PersonaSwitcherBar />

              {/* 2. Main Layout with Sidebar + Content Shell */}
              <div className="flex flex-1 min-h-[calc(100vh-42px)]">
                {/* 260px Fixed Deves Navy Sidebar */}
                <Sidebar />

                {/* Main Content Area with Header */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
                  <Header />
                  <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
                </div>
              </div>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
