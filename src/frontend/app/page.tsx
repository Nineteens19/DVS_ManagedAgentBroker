'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SlaCountdownBadge } from '../components/ui/SlaCountdownBadge';
import { ApplicationDetailModal } from '../components/ui/ApplicationDetailModal';
import { AgentApplicationDetailDto } from '../types/domain';
import {
  FilePlus,
  ClipboardCheck,
  CheckCircle2,
  Server,
  Archive,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Edit3,
  Eye,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    canCreateApplication,
    canReviewCompliance,
    canApproveExecutive,
    canProvisionCore,
    canArchiveLegal,
  } = useAuth();

  const [selectedApp, setSelectedApp] = useState<AgentApplicationDetailDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: metrics } = useQuery({
    queryKey: ['slaMetrics'],
    queryFn: () => apiClient.getSlaMetrics(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const recentApplications = applications.slice(0, 7);

  const handleRowClick = async (appId: string) => {
    const detail = await apiClient.getApplicationById(appId);
    if (detail) {
      setSelectedApp(detail);
      setIsDetailModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="deves-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#012169]/10 text-[#012169] text-xs font-semibold mb-1.5">
            <span>บริษัท เทเวศประกันภัย จำกัด (มหาชน)</span>
          </div>
          <h2 className="text-xl font-bold text-[#212529]">
            ยินดีต้อนรับ, คุณ {currentUser.fullName}
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5">
            บทบาท: <span className="text-[#012169] font-bold">{currentUser.roleDisplayName}</span> | สาขา: <span className="font-semibold text-[#212529]">{currentUser.branchName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canCreateApplication && (
            <Link
              href="/intake/new"
              className="btn-primary flex items-center space-x-2 text-xs whitespace-nowrap"
            >
              <FilePlus className="w-4 h-4" />
              <span>ยื่นใบสมัครตัวแทนใหม่</span>
            </Link>
          )}
          <Link
            href="/sla-dashboard"
            className="btn-outline flex items-center space-x-1.5 text-xs whitespace-nowrap"
          >
            <Clock className="w-4 h-4" />
            <span>SLA Monitoring</span>
          </Link>
        </div>
      </div>

      {/* 2. Deves Standard: 4 SummaryCards with 4px Left Border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
        <div className="deves-summary-card border-l-4 border-l-[#012169]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              ใบสมัครทั้งหมด
            </span>
            <div className="p-2 rounded-lg bg-[#012169]/10 text-[#012169]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-[#012169]">
            {metrics?.totalApplications ?? applications.length}
          </div>
          <p className="text-xs text-[#6C757D] mt-1">ทุกสถานะในระบบ</p>
        </div>

        {/* Card 2: Active Temporary */}
        <div className="deves-summary-card border-l-4 border-l-[#17A2B8]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              Active Temporary (30D)
            </span>
            <div className="p-2 rounded-lg bg-[#17A2B8]/10 text-[#17A2B8]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-[#17A2B8]">
            {metrics?.activeTemporaryCount ?? 0}
          </div>
          <p className="text-xs text-[#6C757D] mt-1">เปิดสิทธิ์ชั่วคราว ผ่อนผันส่งสัญญา</p>
        </div>

        {/* Card 3: Near Deadline */}
        <div className="deves-summary-card border-l-4 border-l-[#FD7E14]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              ใกล้ครบกำหนด (≤ 7 วัน)
            </span>
            <div className="p-2 rounded-lg bg-[#FD7E14]/10 text-[#FD7E14]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-[#FD7E14]">
            {metrics?.nearDeadline7DaysCount ?? 0}
          </div>
          <p className="text-xs text-[#6C757D] mt-1">ต้องเร่งติดตามสัญญาตัวจริง</p>
        </div>

        {/* Card 4: Active Permanent */}
        <div className="deves-summary-card border-l-4 border-l-[#28A745]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              Active Permanent
            </span>
            <div className="p-2 rounded-lg bg-[#28A745]/10 text-[#28A745]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold font-mono text-[#28A745]">
            {metrics?.activePermanentCount ?? 0}
          </div>
          <p className="text-xs text-[#6C757D] mt-1">จัดเก็บสัญญาตัวจริงสมบูรณ์</p>
        </div>
      </div>

      {/* 3. Role Consoles Grid */}
      <div className="deves-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#012169]">
          คอนโซลการทำงานตามสิทธิ์ของคุณ (Role Consoles)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canCreateApplication && (
            <Link
              href="/intake/new"
              className="p-4 rounded-xl border border-[#DEE2E6] hover:border-[#012169] hover:bg-[#F8F9FA] transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-lg bg-[#012169]/10 text-[#012169] group-hover:scale-105 transition-transform">
                <FilePlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#212529] group-hover:text-[#012169]">ยื่นใบสมัครใหม่ (Intake)</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5">กรอกข้อมูลตัวแทน/โบรกเกอร์ และอัปโหลดเอกสาร</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#012169] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canReviewCompliance && (
            <Link
              href="/review"
              className="p-4 rounded-xl border border-[#DEE2E6] hover:border-[#012169] hover:bg-[#F8F9FA] transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 group-hover:scale-105 transition-transform">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#212529] group-hover:text-[#012169]">สนญ. ตรวจรับ & AMLO</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5">ตรวจคัดกรอง Sanctions และส่งต่อผู้บริหาร</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#012169] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canApproveExecutive && (
            <Link
              href="/approval"
              className="p-4 rounded-xl border border-[#DEE2E6] hover:border-[#012169] hover:bg-[#F8F9FA] transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#212529] group-hover:text-[#012169]">ผู้บริหารอนุมัติ (E-Approval)</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5">พิจารณาอนุมัติใบสมัครในระบบแทน EAS</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#012169] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canProvisionCore && (
            <Link
              href="/provisioning"
              className="p-4 rounded-xl border border-[#DEE2E6] hover:border-[#012169] hover:bg-[#F8F9FA] transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
                <Server className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#212529] group-hover:text-[#012169]">ตั้งวงเงิน & Provisioning</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5">สร้างรหัสตัวแทนและยิง Core Deves 100%</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#012169] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {canArchiveLegal && (
            <Link
              href="/archive"
              className="p-4 rounded-xl border border-[#DEE2E6] hover:border-[#012169] hover:bg-[#F8F9FA] transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-lg bg-green-50 text-green-700 group-hover:scale-105 transition-transform">
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#212529] group-hover:text-[#012169]">จัดเก็บเอกสารสัญญาตัวจริง</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5">ลงทะเบียนกล่อง & เปิดสิทธิ์ถาวร</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6C757D] group-hover:text-[#012169] group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>
      </div>

      {/* 4. Streamlined 5-Column Recent Applications Table (100% Fit Single Screen - Zero Scrollbar) */}
      <div className="deves-card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#DEE2E6]">
          <div>
            <h3 className="text-sm font-bold text-[#012169]">รายการใบสมัครล่าสุด (Recent Applications)</h3>
            <p className="text-[11px] text-[#6C757D]">คลิกที่แถวเพื่อดูรายละเอียดฉบับเต็ม</p>
          </div>
          <span className="text-xs text-[#6C757D] font-mono">{applications.length} รายการ</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#DEE2E6] bg-[#F8F9FA] text-[11px] text-[#6C757D] font-semibold uppercase">
              <th className="py-2.5 px-3 w-[22%]">เลขที่ใบสมัคร</th>
              <th className="py-2.5 px-3 w-[30%]">ชื่อผู้สมัคร / สาขา</th>
              <th className="py-2.5 px-3 w-[20%]">รหัส Agent / Source</th>
              <th className="py-2.5 px-3 w-[15%]">สถานะ</th>
              <th className="py-2.5 px-3 w-[13%] text-right">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]/60 text-xs">
            {recentApplications.map((app) => (
              <tr
                key={app.id}
                onClick={() => handleRowClick(app.id)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
              >
                {/* 1. Application Number */}
                <td className="py-3 px-3">
                  <span className="font-mono font-bold text-[#012169] group-hover:underline block">
                    {app.applicationNumber}
                  </span>
                  <span className="text-[10px] text-[#6C757D]">
                    {new Date(app.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </td>

                {/* 2. Applicant Name & Branch Subtitle */}
                <td className="py-3 px-3">
                  <span className="font-semibold text-[#212529] block">
                    {app.applicantName}
                  </span>
                  <span className="text-[11px] text-[#6C757D]">
                    {app.branchName}
                  </span>
                </td>

                {/* 3. Agent / Source Code or SLA */}
                <td className="py-3 px-3">
                  {app.agentCode ? (
                    <div>
                      <span className="font-mono text-xs font-bold text-[#012169] bg-[#012169]/5 px-1.5 py-0.5 rounded border border-[#012169]/15 inline-block">
                        {app.agentCode}
                      </span>
                      {app.sourceCode && (
                        <span className="font-mono text-[10px] text-[#6C757D] block mt-0.5">
                          {app.sourceCode}
                        </span>
                      )}
                    </div>
                  ) : (
                    <SlaCountdownBadge status={app.status} daysRemaining={app.slaDaysRemaining} />
                  )}
                </td>

                {/* 4. Concise Status Badge */}
                <td className="py-3 px-3">
                  <StatusBadge status={app.status} />
                </td>

                {/* 5. Compact Action */}
                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex items-center space-x-1.5 justify-end">
                    {app.status === 'Draft' || app.status === 'DeficiencyPendingBranch' ? (
                      <Link
                        href={`/intake/new?id=${app.id}`}
                        className="btn-primary !h-7 !px-2.5 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1 shadow-xs"
                        title="เปิดแก้ไขและยื่นต่อ"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>แก้ไข / ยื่นต่อ</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRowClick(app.id)}
                        className="btn-outline !h-7 !px-2.5 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1"
                        title="ดูรายละเอียดฉบับเต็ม"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ดูข้อมูล</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Comprehensive Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        application={selectedApp}
      />
    </div>
  );
}
