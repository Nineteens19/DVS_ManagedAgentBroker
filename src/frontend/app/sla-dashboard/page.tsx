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
          <span className="font-bold text-primary block">{row.applicationNumber}</span>
          <span className="text-green-700 font-semibold">{row.agentCode || '-'}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อตัวแทน / นายหน้า',
      accessorKey: 'applicantName',
      sortable: true,
      cell: (row) => <span className="font-semibold text-gray-900">{row.applicantName}</span>,
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
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              SLA Dashboard & Background Suspension Monitor
            </h2>
            <p className="text-xs text-gray-500">
              ระบบตรวจสอบ SLA ผ่อนผันส่งสัญญาฉบับจริง 30 วัน และกลไก Daemon ระงับสิทธิ์ชั่วคราวอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-700 bg-gray-50 px-3.5 py-1.5 rounded-lg border border-gray-200">
          <Activity className="w-4 h-4 text-green-600 animate-pulse" />
          <span>SlaSuspensionDaemon: <b className="text-green-700">Active (Hourly)</b></span>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="deves-summary-card border-l-4 border-l-[#17A2B8]">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Active Temporary</span>
            <Clock className="w-4 h-4 text-[#17A2B8]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#17A2B8] font-mono">
            {metrics?.activeTemporaryCount ?? 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">อยู่ในเกณฑ์ 30 วัน SLA</p>
        </div>

        <div className="deves-summary-card border-l-4 border-l-[#FD7E14]">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>ใกล้ครบกำหนด (≤ 7 วัน)</span>
            <AlertTriangle className="w-4 h-4 text-[#FD7E14]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#FD7E14] font-mono">
            {metrics?.nearDeadline7DaysCount ?? 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">แจ้งเตือนเร่งรัดสาขา</p>
        </div>

        <div className="deves-summary-card border-l-4 border-l-[#DC3545]">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Suspended 30D</span>
            <AlertOctagon className="w-4 h-4 text-[#DC3545]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#DC3545] font-mono">
            {metrics?.suspended30DCount ?? 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">ระบบระงับสิทธิ์ชั่วคราวแล้ว</p>
        </div>

        <div className="deves-summary-card border-l-4 border-l-[#28A745]">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Active Permanent</span>
            <ShieldCheck className="w-4 h-4 text-[#28A745]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#28A745] font-mono">
            {metrics?.activePermanentCount ?? 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">จัดเก็บสัญญาตัวจริงครบถ้วน</p>
        </div>
      </div>

      {/* SLA Policy Architecture Card */}
      <div className="deves-card p-6 space-y-3">
        <h4 className="text-xs font-bold text-primary flex items-center space-x-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>นโยบายการควบคุมระยะเวลา SLA ตามข้อกำหนดองค์กร:</span>
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-gray-700">
          <li className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
            <b className="text-primary block mb-1">1. Active Temporary (30 วัน)</b>
            เปิดสิทธิ์ให้ขายได้ทันทีหลังอนุมัติ โดยสาขาต้องส่งสัญญาตัวจริงให้ฝ่ายกฎหมายภายใน 30 วัน
          </li>
          <li className="p-3.5 rounded-xl bg-red-50/50 border border-red-200">
            <b className="text-red-700 block mb-1">2. Auto-Suspended 30D</b>
            หากเกิน 30 วัน Background Daemon จะระงับสิทธิ์การออกกรมธรรม์ใน Core AS400 อัตโนมัติ
          </li>
          <li className="p-3.5 rounded-xl bg-green-50/50 border border-green-200">
            <b className="text-green-700 block mb-1">3. Active Permanent</b>
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
