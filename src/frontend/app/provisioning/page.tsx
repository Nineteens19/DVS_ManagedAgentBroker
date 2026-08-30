'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { ApplicationListItemDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Server, Sparkles, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

export default function CoreProvisioningPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [approvedCreditLimit, setApprovedCreditLimit] = useState<number>(500000);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(15.0);

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const { data: selectedApp } = useQuery({
    queryKey: ['application', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  // Filter applications in ReviewPremium or CoreAutoProvisioning
  const provisioningQueue = applications.filter(
    (a) => a.status === 'ReviewPremium' || a.status === 'CoreAutoProvisioning' || a.status === 'ActiveTemporary'
  );

  // Mutation: Trigger 100% Automated Multi-System Core Provisioning
  const provisionMutation = useMutation({
    mutationFn: () =>
      apiClient.triggerProvisioning(selectedAppId!, approvedCreditLimit, commissionPercentage),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsProvisionModalOpen(false);
      showToast({
        type: 'success',
        title: 'สร้างรหัสและเชื่อมต่อ Core สำเร็จ 100%',
        message: `สร้างรหัสตัวแทน ${updated.agentCode} และ Source ${updated.sourceCode} พร้อมเปิดสิทธิ์ชั่วคราว (30D SLA Active) เรียบร้อยแล้ว`,
      });
    },
    onError: (err) => {
      showToast({
        type: 'error',
        title: 'การเชื่อมต่อระบบขัดข้อง',
        message: String(err),
      });
    },
  });

  const handleOpenProvision = (app: ApplicationListItemDto) => {
    setSelectedAppId(app.id);
    setApprovedCreditLimit(app.requestedCreditLimit || 500000);
    setCommissionPercentage(15.0);
    setIsProvisionModalOpen(true);
  };

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร',
      accessorKey: 'applicationNumber',
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-sky-400">{row.applicationNumber}</span>,
    },
    {
      header: 'ชื่อผู้สมัคร',
      accessorKey: 'applicantName',
      sortable: true,
    },
    {
      header: 'สาขา',
      accessorKey: 'branchName',
      sortable: true,
    },
    {
      header: 'วงเงินที่ขอ (บาท)',
      accessorKey: 'requestedCreditLimit',
      cell: (row) => (
        <span className="font-mono text-slate-200">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'รหัสตัวแทน / Source',
      cell: (row) =>
        row.agentCode ? (
          <div className="font-mono text-xs">
            <span className="text-emerald-400 font-bold block">{row.agentCode}</span>
            <span className="text-[10px] text-slate-400">{row.sourceCode}</span>
          </div>
        ) : (
          <span className="text-slate-500 italic">ยังไม่ได้สร้าง</span>
        ),
    },
    {
      header: 'สถานะ',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'การทำงาน',
      cell: (row) => (
        <button
          onClick={() => handleOpenProvision(row)}
          disabled={row.status === 'ActiveTemporary'}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            row.status === 'ActiveTemporary'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 shadow-md shadow-teal-900/30'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{row.status === 'ActiveTemporary' ? 'Provisioned ✓' : 'ตั้งวงเงิน & ยิง Core'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="p-4 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">ฝ่ายสินเชื่อ: กำหนดวงเงิน & 100% Core Auto-Provisioning</h2>
            <p className="text-xs text-slate-400">
              สร้าง Agent Code / Source Code ผ่าน Deves Master และ Sync ข้อมูลไปยัง AS400, APAR, SAP, PCSDIS อัตโนมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-teal-300 font-mono bg-teal-950/50 px-3 py-1.5 rounded-xl border border-teal-500/30">
          คิวรอตั้งรหัส: {provisioningQueue.filter((q) => q.status === 'ReviewPremium').length} รายการ
        </div>
      </div>

      {/* Queue Table */}
      <DataTable
        data={provisioningQueue}
        columns={columns}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร หรือ รหัสตัวแทน..."
      />

      {/* Provisioning Setup & Progress Modal */}
      <Modal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        title={`กำหนดวงเงินและรหัสตัวแทน: ${selectedApp?.applicationNumber || ''}`}
        maxWidth="xl"
      >
        {selectedApp ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ผู้สมัคร:</span>
                <span className="font-bold text-slate-100">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">สาขา:</span>
                <span className="text-slate-200">{selectedApp.branchName} ({selectedApp.branchCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">วงเงินที่ได้รับอนุมัติจากผู้บริหาร:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  วงเงินสินเชื่อที่อนุมัติจริง (Approved Limit THB) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  value={approvedCreditLimit}
                  onChange={(e) => setApprovedCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  อัตราค่าคอมมิชชั่น (%) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* 100% IT Automation Architecture Cards */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-sky-400">
                <Sparkles className="w-4 h-4" />
                <h5 className="text-xs font-bold text-slate-200">
                  ระบบ Core Systems ที่จะเชื่อมโยงอัตโนมัติ (100% Zero-Touch IT):
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">AS400</div>
                  <div className="text-[10px] text-teal-400">Non-Life Core</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">APAR</div>
                  <div className="text-[10px] text-teal-400">Billing/Finance</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">SAP</div>
                  <div className="text-[10px] text-teal-400">GL / Accounting</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">PCSDIS</div>
                  <div className="text-[10px] text-teal-400">Disbursement</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  เมื่อกดยิงระบบ จะเริ่มนับถอยหลังระยะเวลาผ่อนผันส่งสัญญาฉบับจริง 30 วัน (SLA 30D Active)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() => provisionMutation.mutate()}
                disabled={provisionMutation.isPending || approvedCreditLimit <= 0}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/25 disabled:opacity-50 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {provisionMutation.isPending
                    ? 'กำลังเชื่อมต่อ Core Systems ทั้ง 4 ระบบ...'
                    : 'ยืนยันสร้างรหัส & Auto-Provision'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
        )}
      </Modal>
    </div>
  );
}
