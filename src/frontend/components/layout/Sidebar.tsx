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
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, canCreateApplication, canReviewCompliance, canApproveExecutive, canProvisionCore, canArchiveLegal } = useAuth();

  const navigationItems = [
    {
      label: 'ภาพรวมระบบ',
      desc: 'Overview Dashboard',
      href: '/',
      icon: <LayoutDashboard className="w-4 h-4" />,
      show: true,
    },
    {
      label: 'ยื่นใบสมัครใหม่',
      desc: 'Application Intake',
      href: '/intake/new',
      icon: <FilePlus className="w-4 h-4" />,
      show: canCreateApplication,
      badge: 'Branch',
    },
    {
      label: 'สนญ. ตรวจรับ & AMLO',
      desc: 'HO Review & Screening',
      href: '/review',
      icon: <ClipboardCheck className="w-4 h-4" />,
      show: canReviewCompliance,
      badge: 'HO',
    },
    {
      label: 'ผู้บริหารอนุมัติ',
      desc: 'Executive E-Approval',
      href: '/approval',
      icon: <CheckCircle2 className="w-4 h-4" />,
      show: canApproveExecutive,
      badge: 'MD',
    },
    {
      label: 'สินเชื่อ & Provisioning',
      desc: 'Core Systems Auto-Sync',
      href: '/provisioning',
      icon: <Server className="w-4 h-4" />,
      show: canProvisionCore,
      badge: '100% IT',
    },
    {
      label: 'ฝ่ายกฎหมายจัดเก็บสัญญา',
      desc: 'Legal Contract Archive',
      href: '/archive',
      icon: <Archive className="w-4 h-4" />,
      show: canArchiveLegal,
      badge: 'Legal',
    },
    {
      label: 'SLA Dashboard',
      desc: '30D SLA & Auto-Suspension',
      href: '/sla-dashboard',
      icon: <Clock className="w-4 h-4" />,
      show: true,
      badge: 'Live',
    },
  ];

  return (
    <aside className="w-[260px] flex-shrink-0 bg-primary text-white min-h-screen flex flex-col justify-between shadow-xl">
      <div>
        {/* Deves Logo Header Block */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3">
          {/* DVS Gold Icon Badge */}
          <div className="w-10 h-10 rounded-lg bg-secondary text-primary font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
            DVS
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate leading-snug">
              ระบบตัวแทน & โบรกเกอร์
            </h1>
            <p className="text-[11px] text-gray-300 truncate">
              เทเวศประกันภัย (Deves)
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            เมนูการทำงานหลัก
          </p>

          {navigationItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-secondary text-primary font-bold shadow-md'
                      : 'text-gray-200 hover:bg-[#003080] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={isActive ? 'text-primary' : 'text-secondary'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Bottom Info & User Block */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* ISO 27001 Security Indicator */}
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] space-y-1">
          <div className="flex items-center space-x-1.5 text-secondary font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ISO 27001 Certified</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-tight">
            เชื่อมต่อ Deves Core 100% Zero-Touch IT
          </p>
        </div>

        {/* User Role Card */}
        <div className="p-2 rounded-lg bg-black/20 flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
            <p className="text-[10px] text-gray-300 truncate">{currentUser.branchName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
