'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/domain';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Award,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  LogIn,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsPersona } = useAuth();

  const [username, setUsername] = useState('branch.bangkok');
  const [password, setPassword] = useState('••••••••');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const personas: {
    role: UserRole;
    title: string;
    desc: string;
    department: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      role: 'branch_officer',
      title: 'ฝ่ายธุรกิจสาขา (ผู้ยื่นคำขอ)',
      desc: 'บันทึกข้อมูลใบสมัคร, อัปโหลดเอกสารประกอบ และส่งเรื่อง',
      department: 'สาขาธุรกิจ / ฝ่ายขาย',
      icon: <Users className="w-5 h-5 text-primary" />,
      color: 'border-blue-200 hover:border-primary hover:bg-blue-50/50',
    },
    {
      role: 'ho_reviewer',
      title: 'ฝ่ายธุรกิจสำนักงานใหญ่ (สนญ.)',
      desc: 'ตรวจสอบเอกสารครบถ้วน และตรวจสอบรายชื่อ ปปง./คปภ.',
      department: 'ฝ่ายธุรกิจสำนักงานใหญ่',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-700" />,
      color: 'border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50/50',
    },
    {
      role: 'approver_md',
      title: 'กรรมการผู้จัดการ (ผู้มีอำนาจลงนาม)',
      desc: 'พิจารณาอนุมัติคำขอเปิดตัวแทนและสัญญาผ่านระบบ',
      department: 'ผู้บริหารระดับสูง',
      icon: <CheckCircle2 className="w-5 h-5 text-purple-700" />,
      color: 'border-purple-200 hover:border-purple-600 hover:bg-purple-50/50',
    },
    {
      role: 'premium_reviewer',
      title: 'ฝ่ายบริหารจัดการเบี้ยประกันภัย',
      desc: 'ตรวจสอบวงเงินหลักทรัพย์ และส่งเปิดรหัสระบบหลักอัตโนมัติ 100%',
      department: 'ฝ่ายบริหารจัดการเบี้ยประกันภัย',
      icon: <Award className="w-5 h-5 text-teal-700" />,
      color: 'border-teal-200 hover:border-teal-600 hover:bg-teal-50/50',
    },
    {
      role: 'auditor_legal',
      title: 'ฝ่ายกฎหมาย / สำนักนิติกรรม',
      desc: 'ตรวจรับสัญญาฉบับจริง, ลงทะเบียนกล่องจัดเก็บ และปลดล็อกเปิดขายถาวร',
      department: 'สำนักนิติกรรม',
      icon: <FileSpreadsheet className="w-5 h-5 text-green-700" />,
      color: 'border-green-200 hover:border-green-600 hover:bg-green-50/50',
    },
    {
      role: 'admin',
      title: 'ฝ่ายพัฒนาระบบ / ผู้ดูแลระบบไอที',
      desc: 'บริหารจัดการสิทธิ์ ตรวจสอบความถูกต้อง และดูแลการเชื่อมต่อระบบ',
      department: 'ฝ่ายพัฒนาระบบเทคโนโลยีสารสนเทศ',
      icon: <Lock className="w-5 h-5 text-gray-700" />,
      color: 'border-gray-300 hover:border-gray-600 hover:bg-gray-50/50',
    },
  ];

  const handlePersonaSelect = (role: UserRole) => {
    setIsLoggingIn(true);
    loginAsPersona(role);
    setTimeout(() => {
      router.push('/');
    }, 200);
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    loginAsPersona('branch_officer');
    setTimeout(() => {
      router.push('/');
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#001744] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        {/* Deves Logo & System Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary text-primary font-black text-2xl shadow-lg mb-3">
            DVS
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            ระบบบริหารจัดการตัวแทนและนายหน้า
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            บริษัท เทเวศประกันภัย จำกัด (มหาชน) | Deves Insurance Public Company Limited
          </p>
        </div>

        {/* Main Login & Persona Selector Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Standard Login Form (4 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gray-50/80 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-primary pb-3 border-b border-gray-200 mb-5">
                <KeyRound className="w-5 h-5" />
                <h2 className="text-sm font-bold text-gray-900">
                  เข้าสู่ระบบ (Sign In)
                </h2>
              </div>

              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="deves-input"
                    placeholder="ระบุชื่อผู้ใช้..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="deves-input font-mono"
                    placeholder="ระบุรหัสผ่าน..."
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span>จดจำการเข้าสู่ระบบ</span>
                  </label>
                  <span className="text-primary hover:underline cursor-pointer">
                    ลืมรหัสผ่าน?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-md transition-all disabled:opacity-50 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <span className="inline-flex items-center text-[11px] text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                ระบบความปลอดภัย ISO 27001
              </span>
            </div>
          </div>

          {/* Right: Quick Demo Persona Selector (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-primary">
                <UserCheck className="w-5 h-5 text-secondary fill-secondary" />
                <h2 className="text-sm font-bold text-gray-900">
                  เลือกบทบาทเพื่อทดสอบระบบ (1-Click Demo Persona)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-gray-400">6 Roles</span>
            </div>

            <p className="text-xs text-gray-500">
              คลิกเลือกบทบาทที่ต้องการทดสอบเพื่อเข้าสู่หน้าจอทำงานและสิทธิ์การอนุมัติในแต่ละขั้นตอนทันที:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {personas.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handlePersonaSelect(p.role)}
                  className={`p-3.5 rounded-xl border text-left transition-all shadow-xs flex flex-col justify-between group ${p.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-xs group-hover:scale-105 transition-transform">
                        {p.icon}
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {p.department}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-primary">
                    <span>เข้าใช้งานในบทบาทนี้</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-400 mt-6">
          ระบบจัดการข้อมูลตัวแทนและนายหน้าประกันวินาศภัย © {new Date().getFullYear()} บริษัท เทเวศประกันภัย จำกัด (มหาชน)
        </p>
      </div>
    </div>
  );
}
