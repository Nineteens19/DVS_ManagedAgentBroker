'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Building2, Bell, ChevronRight } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'ภาพรวมระบบ (Overview Dashboard)';
      case '/intake/new':
        return 'ยื่นใบสมัครตัวแทน/นายหน้าใหม่ (Application Intake)';
      case '/review':
        return 'สนญ. ตรวจรับเอกสาร & คัดกรอง AMLO (Review)';
      case '/approval':
        return 'ผู้บริหารพิจารณาอนุมัติ (Executive Approval)';
      case '/provisioning':
        return 'ฝ่ายสินเชื่อ & 100% IT Provisioning (Core Sync)';
      case '/archive':
        return 'ฝ่ายกฎหมายจัดเก็บสัญญาตัวจริง (Legal Archive)';
      case '/sla-dashboard':
        return 'SLA Dashboard & Monitoring';
      default:
        return 'ระบบบริหารจัดการตัวแทนและนายหน้า';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-header sticky top-0 z-40 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs">
          <Link href="/" className="text-gray-500 hover:text-primary transition-colors font-medium">
            หน้าหลัก
          </Link>
          {pathname !== '/' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-primary font-bold text-sm">{getPageTitle(pathname)}</span>
            </>
          )}
        </div>

        {/* Right Tools: Branch Info, Notifications, User Menu */}
        <div className="flex items-center space-x-4">
          {/* Branch Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-gray-800">{currentUser.branchName}</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Avatar & Name Block */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">{currentUser.fullName}</p>
              <p className="text-[11px] text-gray-500">{currentUser.roleDisplayName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
