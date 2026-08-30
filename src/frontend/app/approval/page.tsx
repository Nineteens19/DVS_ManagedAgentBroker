'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { ApplicationListItemDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PiiMaskedField } from '../../components/ui/PiiMaskedField';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Award } from 'lucide-react';

export default function ExecutiveApprovalPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const { data: selectedApp } = useQuery({
    queryKey: ['application', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  // Filter applications waiting for Executive Approval
  const pendingApprovalList = applications.filter((a) => a.status === 'PendingExecutiveApproval');

  // Mutation: Process Executive Decision (Approve / Reject)
  const decisionMutation = useMutation({
    mutationFn: ({ isApproved, remarks }: { isApproved: boolean; remarks: string }) =>
      apiClient.processExecutiveDecision(selectedAppId!, isApproved, remarks),
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsDecisionModalOpen(false);
      setDecisionNotes('');
      if (variables.isApproved) {
        showToast({
          type: 'success',
          title: 'อนุมัติใบสมัครสำเร็จ (Approved)',
          message: `ใบสมัครเลขที่ ${updated.applicationNumber} ได้รับการอนุมัติแล้ว ส่งต่อไปยังฝ่ายสินเชื่อเพื่อตั้งวงเงินและรหัสตัวแทน`,
        });
      } else {
        showToast({
          type: 'error',
          title: 'ปฏิเสธใบสมัคร (Rejected)',
          message: `ใบสมัครเลขที่ ${updated.applicationNumber} ถูกบันทึกสถานะไม่อนุมัติเรียบร้อยแล้ว`,
        });
      }
    },
  });

  const handleOpenDecision = (appId: string) => {
    setSelectedAppId(appId);
    setDecisionNotes('อนุมัติตามวงเงินที่เสนอ');
    setIsDecisionModalOpen(true);
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
      header: 'เลขประจำตัว 13 หลัก',
      accessorKey: 'nationalIdOrTaxId',
      cell: (row) => <PiiMaskedField value={row.nationalIdOrTaxId} />,
    },
    {
      header: 'วงเงินที่ขออนุมัติ (บาท)',
      accessorKey: 'requestedCreditLimit',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-green-700 font-bold">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'ความเสี่ยง / PEP Flag',
      cell: (row) =>
        row.requiresDirectorApproval ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-700" />
            PEP / ต้องระดับ MD
          </span>
        ) : (
          <span className="text-[11px] text-green-700 font-medium">ปกติ (Standard)</span>
        ),
    },
    {
      header: 'สถานะ',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'การตัดสินใจ',
      cell: (row) => (
        <button
          onClick={() => handleOpenDecision(row.id)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-sm transition-all"
        >
          <Award className="w-3.5 h-3.5" />
          <span>พิจารณาอนุมัติ</span>
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
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              ผู้บริหาร: คอนโซลพิจารณาอนุมัติใบสมัคร (Executive Decision Console)
            </h2>
            <p className="text-xs text-gray-500">
              อนุมัติใบสมัครตัวแทนและนายหน้าในระบบโดยตรง พร้อมการแจ้งเตือนอีเมลอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-primary font-bold bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200">
          รออนุมัติ: {pendingApprovalList.length} รายการ
        </div>
      </div>

      {/* Decision Table */}
      <DataTable
        data={pendingApprovalList}
        columns={columns}
        searchPlaceholder="ค้นหาใบสมัครรออนุมัติ..."
      />

      {/* Executive Decision Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={`พิจารณาอนุมัติใบสมัคร: ${selectedApp?.applicationNumber || ''}`}
        maxWidth="xl"
      >
        {selectedApp ? (
          <div className="space-y-5">
            {/* Warning if PEP / Orange Flag */}
            {selectedApp.complianceRecord?.requiresDirectorApproval && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-900 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">ใบสมัครนี้ตรวจพบ PEP / Orange Flag หรือวงเงินสูง</h5>
                  <p className="opacity-90 mt-0.5">
                    ตามนโยบายกำกับดูแลกิจการ ต้องได้รับความเห็นชอบและลงนามอนุมัติโดยกรรมการผู้จัดการ (Managing Director)
                  </p>
                </div>
              </div>
            )}

            {/* Applicant Summary */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">ผู้สมัคร:</span>
                <span className="font-bold text-gray-900">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">ประเภท / สาขา:</span>
                <span className="font-semibold text-gray-800">
                  {selectedApp.agentType} | {selectedApp.branchName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">วงเงินสินเชื่อที่ขอ:</span>
                <span className="font-mono text-base font-bold text-green-700">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">เงื่อนไขการชำระ:</span>
                <span className="font-medium text-gray-800">
                  Motor {selectedApp.paymentTermMotorDays} วัน / Non-Motor {selectedApp.paymentTermNonMotorDays} วัน
                </span>
              </div>
            </div>

            {/* Decision Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ความเห็นและเงื่อนไขการอนุมัติ (Decision Remarks) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="ระบุความเห็นหรือเงื่อนไขพิเศษประกอบการอนุมัติ..."
                className="deves-input"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() =>
                  decisionMutation.mutate({ isApproved: false, remarks: decisionNotes || 'ไม่อนุมัติ' })
                }
                disabled={decisionMutation.isPending}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>ไม่อนุมัติ (Reject)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  decisionMutation.mutate({ isApproved: true, remarks: decisionNotes })
                }
                disabled={decisionMutation.isPending}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{decisionMutation.isPending ? 'กำลังประมวลผล...' : 'อนุมัติใบสมัคร (Approve Application)'}</span>
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
