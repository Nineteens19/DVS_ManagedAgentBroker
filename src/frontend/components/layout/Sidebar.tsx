'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  ClipboardCheck,
  CheckCircle2,
  Server,
  Archive,
  Clock,
  LogOut,
  User,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    canCreateApplication,
    canReviewCompliance,
    canApproveExecutive,
    canProvisionCore,
    canArchiveLegal,
  } = useAuth();

  const navigationItems = [
    {
      label: 'ภาพรวมระบบ',
      href: '/',
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: true,
    },
    {
      label: 'ยื่นใบสมัครใหม่',
      href: '/intake/new',
      icon: <FilePlus className="w-5 h-5" />,
      show: canCreateApplication,
    },
    {
      label: 'สนญ. ตรวจรับ & AMLO',
      href: '/review',
      icon: <ClipboardCheck className="w-5 h-5" />,
      show: canReviewCompliance,
    },
    {
      label: 'ผู้บริหารอนุมัติ',
      href: '/approval',
      icon: <CheckCircle2 className="w-5 h-5" />,
      show: canApproveExecutive,
    },
    {
      label: 'สินเชื่อ & Provisioning',
      href: '/provisioning',
      icon: <Server className="w-5 h-5" />,
      show: canProvisionCore,
    },
    {
      label: 'ฝ่ายกฎหมายจัดเก็บสัญญา',
      href: '/archive',
      icon: <Archive className="w-5 h-5" />,
      show: canArchiveLegal,
    },
    {
      label: 'SLA Dashboard',
      href: '/sla-dashboard',
      icon: <Clock className="w-5 h-5" />,
      show: true,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] h-screen bg-[#012169] text-white flex flex-col justify-between z-30 shadow-xl select-none">
      <div>
        {/* 1. Logo Block (Deves Standard Spec) */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFCD00] text-[#012169] font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
            DVS
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate leading-tight">
              ระบบตัวแทนและนายหน้า
            </h1>
            <p className="text-[11px] text-gray-300 truncate mt-0.5">
              เทเวศประกันภัย (Deves)
            </p>
          </div>
        </div>

        {/* 2. Nav Menu (14px font, .7rem vertical padding, 1.5rem horizontal padding) */}
        <nav className="py-3 px-2 space-y-1">
          {navigationItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#FFCD00] text-[#012169] font-bold shadow-sm'
                      : 'text-gray-100 hover:bg-[#003080] hover:text-white font-normal'
                  }`}
                >
                  <span className={isActive ? 'text-[#012169]' : 'text-gray-300'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      {/* 3. Bottom User Info & Logout Block (Deves Standard Spec) */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#001a52]/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FFCD00] text-[#012169] flex items-center justify-center text-xs font-bold flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
            <p className="text-[11px] text-gray-300 truncate">{currentUser.roleDisplayName}</p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 border border-white/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ / สลับบทบาท</span>
        </Link>
      </div>
    </aside>
  );
};
