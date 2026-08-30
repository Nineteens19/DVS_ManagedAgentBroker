'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SlaCountdownBadge } from '../components/ui/SlaCountdownBadge';
import { PiiMaskedField } from '../components/ui/PiiMaskedField';
import {
  FilePlus,
  ClipboardCheck,
  CheckCircle2,
  Server,
  Archive,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, canCreateApplication, canReviewCompliance, canApproveExecutive, canProvisionCore, canArchiveLegal } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['slaMetrics'],
    queryFn: () => apiClient.getSlaMetrics(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-indigo-950/80 border border-sky-500/20 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ยินดีต้อนรับเข้าสู่ระบบ Enterprise Portal</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              สวัสดีคุณ {currentUser.fullName}
            </h2>
            <p className="text-xs text-slate-300">
              บทบาทปัจจุบัน: <span className="text-sky-400 font-bold">{currentUser.roleDisplayName}</span> | ประจำ: {currentUser.branchName}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {canCreateApplication && (
              <Link
                href="/intake/new"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 shadow-lg shadow-sky-500/25 transition-all transform hover:scale-105"
              >
                <FilePlus className="w-4 h-4" />
                <span>ยื่นใบสมัครใหม่</span>
              </Link>
            )}
            <Link
              href="/sla-dashboard"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>SLA Monitor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ใบสมัครทั้งหมด</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {metrics?.totalApplications ?? applications.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ทุกสถานะในระบบ</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-teal-500/20 bg-teal-950/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-teal-400 text-xs font-semibold">
            <span>Active Temporary</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-teal-300 font-mono">
            {metrics?.activeTemporaryCount ?? 0}
          </div>
          <p className="text-[11px] text-teal-400/80 mt-1">เปิดสิทธิ์ชั่วคราว (30D SLA)</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-amber-500/20 bg-amber-950/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>ใกล้ครบกำหนด SLA (≤ 7 วัน)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300 font-mono">
            {metrics?.nearDeadline7DaysCount ?? 0}
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">ต้องเร่งติดตามสัญญาตัวจริง</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-emerald-500/20 bg-emerald-950/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Active Permanent</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300 font-mono">
            {metrics?.activePermanentCount ?? 0}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">จัดเก็บสัญญาตัวจริงสมบูรณ์</p>
        </div>
      </div>

      {/* Quick Action Consoles for Current Role */}
      <div className="p-6 rounded-2xl glass-card border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>คอนโซลการทำงานด่วนตามสิทธิ์ของคุณ (Quick Action Consoles)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canCreateApplication && (
            <Link
              href="/intake/new"
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                <FilePlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-300">ยื่นใบสมัครใหม่ (Intake)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">กรอกข้อมูลตัวแทน/โบรกเกอร์ และอัปโหลดเอกสาร</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canReviewCompliance && (
            <Link
              href="/review"
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">สนญ. ตรวจรับ & AMLO</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">ตรวจสอบเอกสารและตรวจคัดกรอง sanctions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canApproveExecutive && (
            <Link
              href="/approval"
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-300">ผู้บริหารอนุมัติ (E-Approval)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">พิจารณาอนุมัติใบสมัครในระบบแทน EAS</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canProvisionCore && (
            <Link
              href="/provisioning"
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                <Server className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-teal-300">ตั้งวงเงิน & Auto-Provisioning</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">เชื่อมต่อ AS400, APAR, SAP, PCSDIS 100%</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canArchiveLegal && (
            <Link
              href="/archive"
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">จัดเก็บเอกสารสัญญาตัวจริง</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">ลงทะเบียนกล่องเอกสาร & เปิดสิทธิ์ถาวร</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="p-6 rounded-2xl glass-card border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">ใบสมัครล่าสุดในระบบ (Recent Applications)</h3>
          <span className="text-xs text-slate-400 font-mono">{applications.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">เลขที่ใบสมัคร</th>
                <th className="py-2.5 px-3">ชื่อผู้สมัคร</th>
                <th className="py-2.5 px-3">เลขประจำตัว 13 หลัก</th>
                <th className="py-2.5 px-3">สาขา</th>
                <th className="py-2.5 px-3">สถานะ</th>
                <th className="py-2.5 px-3">SLA / รหัสตัวแทน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentApplications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-sky-400">
                    {app.applicationNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-100">
                    {app.applicantName}
                  </td>
                  <td className="py-3 px-3">
                    <PiiMaskedField value={app.nationalIdOrTaxId} />
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {app.branchName}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3 px-3">
                    {app.agentCode ? (
                      <span className="font-mono text-emerald-400 font-bold">{app.agentCode}</span>
                    ) : (
                      <SlaCountdownBadge status={app.status} daysRemaining={app.slaDaysRemaining} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
