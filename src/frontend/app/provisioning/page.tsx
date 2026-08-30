'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { ApplicationListItemDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Server, Sparkles, Clock, Zap, Check } from 'lucide-react';

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
      cell: (row) => <span className="font-mono font-bold text-primary">{row.applicationNumber}</span>,
    },
    {
      header: 'ชื่อผู้สมัคร',
      accessorKey: 'applicantName',
      sortable: true,
      cell: (row) => <span className="font-semibold text-gray-900">{row.applicantName}</span>,
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
        <span className="font-mono text-gray-800">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'รหัสตัวแทน / Source',
      cell: (row) =>
        row.agentCode ? (
          <div className="font-mono text-xs">
            <span className="text-green-700 font-bold block">{row.agentCode}</span>
            <span className="text-[11px] text-gray-500">{row.sourceCode}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic">ยังไม่ได้สร้าง</span>
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
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            row.status === 'ActiveTemporary'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-primary text-white hover:bg-primary-light shadow-sm'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="flex items-center space-x-1">
            {row.status === 'ActiveTemporary' ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 inline" />
                <span>Provisioned</span>
              </>
            ) : (
              <span>ตั้งวงเงิน & ยิง Core</span>
            )}
          </span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-primary">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              ฝ่ายสินเชื่อ: กำหนดวงเงิน & 100% Core Auto-Provisioning
            </h2>
            <p className="text-xs text-gray-500">
              สร้าง Agent Code / Source Code ผ่าน Deves Master และ Sync ข้อมูลไปยัง AS400, APAR, SAP, PCSDIS อัตโนมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-primary font-bold bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200">
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
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">ผู้สมัคร:</span>
                <span className="font-bold text-gray-900">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สาขา:</span>
                <span className="font-semibold text-gray-800">{selectedApp.branchName} ({selectedApp.branchCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">วงเงินที่ได้รับอนุมัติจากผู้บริหาร:</span>
                <span className="font-mono text-green-700 font-bold">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  วงเงินสินเชื่อที่อนุมัติจริง (Approved Limit THB) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  value={approvedCreditLimit}
                  onChange={(e) => setApprovedCreditLimit(parseFloat(e.target.value) || 0)}
                  className="deves-input font-mono font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  อัตราค่าคอมมิชชั่น (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                  className="deves-input font-mono"
                />
              </div>
            </div>

            {/* 100% IT Automation Architecture Cards */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center space-x-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <h5 className="text-xs font-bold text-gray-900">
                  ระบบ Core Systems ที่จะเชื่อมโยงอัตโนมัติ (100% Zero-Touch IT):
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 shadow-xs">
                  <div className="font-bold text-primary">AS400</div>
                  <div className="text-[10px] text-gray-500">Non-Life Core</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 shadow-xs">
                  <div className="font-bold text-primary">APAR</div>
                  <div className="text-[10px] text-gray-500">Billing/Finance</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 shadow-xs">
                  <div className="font-bold text-primary">SAP</div>
                  <div className="text-[10px] text-gray-500">GL / Accounting</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 shadow-xs">
                  <div className="font-bold text-primary">PCSDIS</div>
                  <div className="text-[10px] text-gray-500">Disbursement</div>
                </div>
              </div>

              <div className="text-[11px] text-gray-600 flex items-center space-x-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>
                  เมื่อกดยิงระบบ จะเริ่มนับถอยหลังระยะเวลาผ่อนผันส่งสัญญาฉบับจริง 30 วัน (SLA 30D Active)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-100 border border-gray-300"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() => provisionMutation.mutate()}
                disabled={provisionMutation.isPending || approvedCreditLimit <= 0}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-md disabled:opacity-50 transition-all"
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
          <div className="py-8 text-center text-xs text-gray-500">กำลังโหลดข้อมูล...</div>
        )}
      </Modal>
    </div>
  );
}
