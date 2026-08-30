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
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, canCreateApplication, canReviewCompliance, canApproveExecutive, canProvisionCore, canArchiveLegal } = useAuth();

  const navigationItems = [
    {
      label: 'ภาพรวมระบบ (Overview)',
      href: '/',
      icon: <LayoutDashboard className="w-4 h-4" />,
      show: true,
    },
    {
      label: 'ยื่นใบสมัครใหม่ (Intake)',
      href: '/intake/new',
      icon: <FilePlus className="w-4 h-4" />,
      show: canCreateApplication,
      badge: 'Branch',
    },
    {
      label: 'สนญ. ตรวจรับ & AMLO (Review)',
      href: '/review',
      icon: <ClipboardCheck className="w-4 h-4" />,
      show: canReviewCompliance,
      badge: 'HO',
    },
    {
      label: 'ผู้บริหารอนุมัติ (E-Approval)',
      href: '/approval',
      icon: <CheckCircle2 className="w-4 h-4" />,
      show: canApproveExecutive,
      badge: 'MD',
    },
    {
      label: 'สินเชื่อ & Provisioning (Core)',
      href: '/provisioning',
      icon: <Server className="w-4 h-4" />,
      show: canProvisionCore,
      badge: '100% IT',
    },
    {
      label: 'ฝ่ายกฎหมายจัดเก็บสัญญา (Archive)',
      href: '/archive',
      icon: <Archive className="w-4 h-4" />,
      show: canArchiveLegal,
      badge: 'Legal',
    },
    {
      label: 'SLA Dashboard & Monitoring',
      href: '/sla-dashboard',
      icon: <Clock className="w-4 h-4" />,
      show: true,
      badge: 'Live',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 p-4 space-y-6">
        {/* Navigation Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            เมนูการทำงาน (Role Menu)
          </p>
          {navigationItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-white' : 'text-sky-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isActive
                          ? 'bg-sky-700/60 text-sky-100'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Info Card: ISO 27001 & 100% IT Automation */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-900/60 border border-sky-500/20 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-sky-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold">100% IT Automation</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            เชื่อมต่อ AS400, APAR, SAP, PCSDIS อัตโนมัติ ปลอดภัยมาตรฐาน ISO 27001
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>SLA Monitoring:</span>
            <span className="text-emerald-400 font-bold">● Active (1h daemon)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
