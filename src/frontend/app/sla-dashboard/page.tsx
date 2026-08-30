'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { ApplicationListItemDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlaCountdownBadge } from '../../components/ui/SlaCountdownBadge';
import { PiiMaskedField } from '../../components/ui/PiiMaskedField';
import { Clock, AlertTriangle, AlertOctagon, ShieldCheck, Activity } from 'lucide-react';

export default function SlaMonitoringDashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['slaMetrics'],
    queryFn: () => apiClient.getSlaMetrics(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  // Filter only applications subject to SLA monitoring (ActiveTemporary, Suspended30D, Terminated90D, ActivePermanent)
  const slaMonitoredList = applications.filter((a) =>
    ['ActiveTemporary', 'Suspended30D', 'Terminated90D', 'ActivePermanent'].includes(a.status)
  );

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร / รหัสตัวแทน',
      cell: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-sky-400 block">{row.applicationNumber}</span>
          <span className="text-emerald-400 font-semibold">{row.agentCode || '-'}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อตัวแทน / นายหน้า',
      accessorKey: 'applicantName',
      sortable: true,
    },
    {
      header: 'เลขประจำตัว 13 หลัก',
      accessorKey: 'nationalIdOrTaxId',
      cell: (row) => <PiiMaskedField value={row.nationalIdOrTaxId} />,
    },
    {
      header: 'สาขา',
      accessorKey: 'branchName',
      sortable: true,
    },
    {
      header: 'สถานะปัจจุบัน',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'SLA Countdown / การติดตาม',
      cell: (row) => (
        <SlaCountdownBadge
          status={row.status}
          daysRemaining={row.slaDaysRemaining}
          slaDeadline={row.sla30DayDeadline}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="p-4 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">SLA Dashboard & Background Suspension Monitor</h2>
            <p className="text-xs text-slate-400">
              ระบบตรวจสอบ SLA ผ่อนผันส่งสัญญาฉบับจริง 30 วัน และกลไก Daemon ระงับสิทธิ์ชั่วคราวอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>SlaSuspensionDaemon: <b className="text-emerald-400">Active (Hourly)</b></span>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border-teal-500/20 bg-teal-950/10">
          <div className="flex items-center justify-between text-teal-400 text-xs font-semibold">
            <span>Active Temporary</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-teal-300 font-mono">
            {metrics?.activeTemporaryCount ?? 0}
          </div>
          <p className="text-[11px] text-teal-400/80 mt-1">อยู่ในเกณฑ์ 30 วัน SLA</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>ใกล้ครบกำหนด (≤ 7 วัน)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300 font-mono">
            {metrics?.nearDeadline7DaysCount ?? 0}
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">แจ้งเตือนเร่งรัดสาขา</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
            <span>Suspended 30D</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-300 font-mono">
            {metrics?.suspended30DCount ?? 0}
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1">ระบบระงับสิทธิ์ชั่วคราวแล้ว</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Active Permanent</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300 font-mono">
            {metrics?.activePermanentCount ?? 0}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">จัดเก็บสัญญาตัวจริงครบถ้วน</p>
        </div>
      </div>

      {/* SLA Policy Architecture Alert */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-2 text-xs">
        <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>นโยบายการควบคุมระยะเวลา SLA ตามข้อกำหนดองค์กร:</span>
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
          <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <b className="text-teal-400 block mb-1">1. Active Temporary (30 วัน)</b>
            เปิดสิทธิ์ให้ขายได้ทันทีหลังอนุมัติ โดยสาขาต้องส่งสัญญาตัวจริงให้ฝ่ายกฎหมายภายใน 30 วัน
          </li>
          <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <b className="text-rose-400 block mb-1">2. Auto-Suspended 30D</b>
            หากเกิน 30 วัน Background Daemon จะระงับสิทธิ์การออกกรมธรรม์ใน Core AS400 อัตโนมัติ
          </li>
          <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <b className="text-emerald-400 block mb-1">3. Active Permanent</b>
            เมื่อฝ่ายกฎหมายลงทะเบียนกล่องจัดเก็บ ระบบจะปลดล็อกสิทธิ์ถาวรและยกเลิกการระงับทันที
          </li>
        </ul>
      </div>

      {/* SLA Monitored Table */}
      <DataTable
        data={slaMonitoredList}
        columns={columns}
        searchPlaceholder="ค้นหารายการที่อยู่ระหว่างติดตาม SLA..."
      />
    </div>
  );
}
