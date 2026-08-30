'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/domain';
import { Users, Shield, CheckCircle, Award, FileSpreadsheet, Lock } from 'lucide-react';

export const PersonaSwitcherBar: React.FC = () => {
  const { currentUser, switchPersona } = useAuth();

  const personas: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'branch_officer',
      title: 'Branch Officer',
      desc: 'เจ้าหน้าที่สาขา',
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      role: 'ho_reviewer',
      title: 'HO Reviewer',
      desc: 'สนญ. ตรวจรับ & AMLO',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      role: 'approver_md',
      title: 'MD Approver',
      desc: 'ผู้บริหารอนุมัติ',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    {
      role: 'premium_reviewer',
      title: 'Premium Reviewer',
      desc: 'สินเชื่อ & Provisioning',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    {
      role: 'auditor_legal',
      title: 'Legal Auditor',
      desc: 'ฝ่ายกฎหมายจัดเก็บสัญญา',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      role: 'admin',
      title: 'System Admin',
      desc: 'ผู้ดูแลระบบ',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="bg-[#001744] text-white border-b border-[#FFCD00]/30 px-4 py-2 text-xs shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FFCD00] animate-pulse"></span>
          <span className="font-bold text-[#FFCD00] tracking-wide">
            DEMO PERSONA SWITCHER:
          </span>
          <span className="text-gray-300 text-[11px] hidden sm:inline">
            (คลิกสลับบทบาทเพื่อทดสอบสิทธิ์ในแต่ละขั้นตอน)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => {
            const isActive = currentUser.role === p.role;
            return (
              <button
                key={p.role}
                onClick={() => switchPersona(p.role)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#FFCD00] text-[#012169] font-bold shadow-md scale-105 ring-2 ring-[#FFCD00]/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {p.icon}
                <span>{p.title}</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">({p.desc})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
