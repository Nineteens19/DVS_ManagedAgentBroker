'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/domain';
import { Users, Shield, CheckCircle, Award, FileSpreadsheet, Lock, LogIn } from 'lucide-react';

export const PersonaSwitcherBar: React.FC = () => {
  const { currentUser, loginAsPersona } = useAuth();

  const personas: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'branch_officer',
      title: 'ฝ่ายธุรกิจสาขา',
      desc: 'ยื่นใบสมัคร & แนบเอกสาร',
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      role: 'ho_reviewer',
      title: 'ฝ่ายธุรกิจ สนญ.',
      desc: 'ตรวจรับ & คัดกรอง ปปง./คปภ.',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      role: 'approver_md',
      title: 'กรรมการผู้จัดการ',
      desc: 'ผู้บริหารลงนามอนุมัติ',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    {
      role: 'premium_reviewer',
      title: 'ฝ่ายบริหารจัดการเบี้ย',
      desc: 'อนุมัติวงเงิน & เปิดรหัสระบบ',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    {
      role: 'auditor_legal',
      title: 'สำนักนิติกรรม',
      desc: 'ฝ่ายกฎหมายจัดเก็บสัญญา',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      role: 'admin',
      title: 'ผู้ดูแลระบบไอที',
      desc: 'ดูแลระบบ & ติดตามคิวงาน',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="bg-[#001744] text-white border-b border-[#FFCD00]/30 px-4 py-2 text-xs shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FFCD00]"></span>
          <span className="font-bold text-[#FFCD00] tracking-wide">
            สลับบทบาทผู้ใช้งาน (ทดสอบระบบ):
          </span>
          <Link
            href="/login"
            className="text-gray-300 hover:text-white underline text-[11px] ml-2 flex items-center space-x-1"
          >
            <LogIn className="w-3 h-3 text-secondary inline" />
            <span>ไปที่หน้า Login หลัก</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => {
            const isActive = currentUser.role === p.role;
            return (
              <button
                key={p.role}
                onClick={() => loginAsPersona(p.role)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#FFCD00] text-[#012169] font-bold shadow-md ring-2 ring-[#FFCD00]/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {p.icon}
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
