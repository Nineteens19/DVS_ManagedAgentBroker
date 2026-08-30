'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { ApplicationListItemDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlaCountdownBadge } from '../../components/ui/SlaCountdownBadge';
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export default function SlaDashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['slaMetrics'],
    queryFn: () => apiClient.getSlaMetrics(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const slaTrackedList = applications.filter(
    (app) =>
      app.status === 'ActiveTemporary' ||
      app.status === 'Suspended30D' ||
      app.status === 'Terminated90D' ||
      app.status === 'ActivePermanent'
  );

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร / รหัส Agent',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-[#012169] block">{row.applicationNumber}</span>
          <span className="font-mono text-xs text-green-700 font-semibold">{row.agentCode || '-'}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อตัวแทน / สาขา',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[#212529] block">{row.applicantName}</span>
          <span className="text-[11px] text-[#6C757D]">{row.branchName}</span>
        </div>
      ),
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
      <div className="deves-card p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#012169]/10 text-[#012169] flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              SLA Dashboard & Background Suspension Monitor
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              ระบบตรวจสอบ SLA ผ่อนผันส่งสัญญาฉบับจริง 30 วัน และกลไก Daemon ระงับสิทธิ์ชั่วคราวอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[#212529] bg-green-50 px-3.5 py-1.5 rounded-lg border border-green-200">
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

      {/* SLA Monitored Table */}
      <DataTable
        data={slaTrackedList}
        columns={columns}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร, รหัสตัวแทน, สาขา..."
      />
    </div>
  );
}
