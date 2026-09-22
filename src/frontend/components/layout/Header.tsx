'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Building2, ChevronRight, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  if (pathname === '/login') return null;

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'ภาพรวมระบบ (แดชบอร์ดสรุปงาน)';
      case '/intake/new':
        return 'ยื่นใบสมัครตัวแทน/นายหน้าใหม่';
      case '/review':
        return 'สนญ. ตรวจรับเอกสาร & ตรวจสอบรายชื่อ ปปง./คปภ.';
      case '/approval':
        return 'ผู้บริหารพิจารณาอนุมัติคำขอ';
      case '/provisioning':
        return 'ฝ่ายบริหารจัดการเบี้ย & เปิดรหัสระบบหลักอัตโนมัติ 100%';
      case '/archive':
        return 'ฝ่ายกฎหมาย จัดเก็บสัญญาฉบับจริง';
      case '/sla-dashboard':
        return 'ติดตามระยะเวลากำหนดส่งสัญญา (ผ่อนผัน 30 วัน)';
      default:
        return 'ระบบบริหารจัดการตัวแทนและนายหน้า';
    }
  };

  return (
    <header className="bg-white border-b border-[#DEE2E6] px-6 py-3.5 shadow-header sticky top-0 z-20 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumbs (Deves Spec: separated by '>', last item navy bold, prior gray) */}
        <div className="flex items-center space-x-2 text-xs">
          <Link href="/" className="text-[#6C757D] hover:text-[#012169] transition-colors font-medium">
            หน้าหลัก
          </Link>
          {pathname !== '/' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#6C757D]" />
              <span className="text-[#012169] font-bold text-xs sm:text-sm">
                {getPageTitle(pathname)}
              </span>
            </>
          )}
        </div>

        {/* Right: Branch Info, Switch Role Link, User Avatar */}
        <div className="flex items-center space-x-3">
          {/* Branch Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#DEE2E6] text-xs text-[#212529]">
            <Building2 className="w-3.5 h-3.5 text-[#012169]" />
            <span className="font-semibold">{currentUser.branchName}</span>
          </div>

          {/* Quick Switch Role Link to Login */}
          <Link
            href="/login"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#012169] hover:bg-[#F8F9FA] border border-[#012169]/30 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#012169]" />
            <span>สลับบทบาท</span>
          </Link>

          {/* User Menu Avatar */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-[#DEE2E6]">
            <div className="w-8 h-8 rounded-full bg-[#012169] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-[#212529] leading-tight">{currentUser.fullName}</p>
              <p className="text-[11px] text-[#6C757D]">{currentUser.roleDisplayName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
