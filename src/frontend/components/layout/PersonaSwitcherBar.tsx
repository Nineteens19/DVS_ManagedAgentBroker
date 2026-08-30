'use client';

import React from 'react';
import { useAuth, PRESET_PERSONAS } from '../../context/AuthContext';
import { UserRole } from '../../types/domain';
import { Users, Shield, CheckCircle, Award, FileSpreadsheet, Lock } from 'lucide-react';

export const PersonaSwitcherBar: React.FC = () => {
  const { currentUser, switchPersona } = useAuth();

  const personas: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'branch_officer',
      title: 'Branch Officer',
      desc: 'เจ้าหน้าที่สาขา',
      icon: <Users className="w-4 h-4" />,
    },
    {
      role: 'ho_reviewer',
      title: 'HO Reviewer',
      desc: 'สนญ. ตรวจรับ & AMLO',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      role: 'approver_md',
      title: 'MD Approver',
      desc: 'ผู้บริหารอนุมัติ',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      role: 'premium_reviewer',
      title: 'Premium Reviewer',
      desc: 'สินเชื่อ & 100% Provisioning',
      icon: <Award className="w-4 h-4" />,
    },
    {
      role: 'auditor_legal',
      title: 'Legal Auditor',
      desc: 'ฝ่ายกฎหมายจัดเก็บสัญญา',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      role: 'admin',
      title: 'System Admin',
      desc: 'ผู้ดูแลระบบ',
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-sky-500/20 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span>⚡ DEMO ROLE SWITCHER (สลับบทบาททดสอบ):</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => {
            const isActive = currentUser.role === p.role;
            return (
              <button
                key={p.role}
                onClick={() => switchPersona(p.role)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105 border border-sky-300'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {p.icon}
                <span className="font-semibold">{p.title}</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">({p.desc})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
