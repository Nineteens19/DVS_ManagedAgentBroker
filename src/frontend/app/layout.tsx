import React from 'react';
import './globals.css';
import { Sarabun } from 'next/font/google';
import { Providers } from './providers';
import { AppShell } from '../components/layout/AppShell';

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-sarabun',
});

export const metadata = {
  title: 'ระบบบริหารจัดการตัวแทนและนายหน้า | บริษัท เทเวศประกันภัย จำกัด (มหาชน)',
  description: 'ระบบบริหารจัดการตัวแทนและนายหน้าประกันวินาศภัย เทเวศประกันภัย (Deves Insurance)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className={`${sarabun.className} bg-[#F8F9FA] text-[#212529] min-h-screen antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
