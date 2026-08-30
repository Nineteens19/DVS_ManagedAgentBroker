'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#001744]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Fixed 260px Deves Navy Sidebar */}
      <Sidebar />

      {/* Main Container offset by 260px */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen min-w-0 bg-[#F8F9FA]">
        <Header />
        <main className="flex-1 p-6 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};
