'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { ApplicationListItemDto, AgentApplicationDetailDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PiiMaskedField } from '../../components/ui/PiiMaskedField';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Award, FileText } from 'lucide-react';

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
      cell: (row) => <span className="font-mono font-bold text-sky-400">{row.applicationNumber}</span>,
    },
    {
      header: 'ชื่อผู้สมัคร',
      accessorKey: 'applicantName',
      sortable: true,
      cell: (row) => <span className="font-semibold text-slate-100">{row.applicantName}</span>,
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
        <span className="font-mono text-emerald-400 font-bold">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'ความเสี่ยง / PEP Flag',
      cell: (row) =>
        row.requiresDirectorApproval ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <ShieldAlert className="w-3 h-3 mr-1 text-amber-400" />
            PEP / ต้องระดับ MD
          </span>
        ) : (
          <span className="text-[11px] text-emerald-400 font-medium">ปกติ (Standard)</span>
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
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/30 transition-all"
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
      <div className="p-4 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">ผู้บริหาร: คอนโซลพิจารณาอนุมัติใบสมัคร (Executive Decision Console)</h2>
            <p className="text-xs text-slate-400">
              อนุมัติใบสมัครตัวแทนและนายหน้าในระบบโดยตรง พร้อมการแจ้งเตือนอีเมลอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-purple-300 font-mono bg-purple-950/50 px-3 py-1.5 rounded-xl border border-purple-500/30">
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
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start space-x-3 text-amber-200 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">ใบสมัครนี้ตรวจพบ PEP / Orange Flag หรือวงเงินสูง</h5>
                  <p className="opacity-90 mt-0.5">
                    ตามนโยบายกำกับดูแลกิจการ ต้องได้รับความเห็นชอบและลงนามอนุมัติโดยกรรมการผู้จัดการ (Managing Director)
                  </p>
                </div>
              </div>
            )}

            {/* Applicant Summary */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">ผู้สมัคร:</span>
                <span className="font-bold text-slate-100">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">ประเภท / สาขา:</span>
                <span className="text-slate-200">
                  {selectedApp.agentType} | {selectedApp.branchName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">วงเงินสินเชื่อที่ขอ:</span>
                <span className="font-mono text-base font-extrabold text-emerald-400">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">เงื่อนไขการชำระ:</span>
                <span className="text-slate-200">
                  Motor {selectedApp.paymentTermMotorDays} วัน / Non-Motor {selectedApp.paymentTermNonMotorDays} วัน
                </span>
              </div>
            </div>

            {/* Decision Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ความเห็นและเงื่อนไขการอนุมัติ (Decision Remarks) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="ระบุความเห็นหรือเงื่อนไขพิเศษประกอบการอนุมัติ..."
                className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  decisionMutation.mutate({ isApproved: false, remarks: decisionNotes || 'ไม่อนุมัติ' })
                }
                disabled={decisionMutation.isPending}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-500/40 transition-all"
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
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{decisionMutation.isPending ? 'กำลังประมวลผล...' : 'อนุมัติใบสมัคร (Approve Application)'}</span>
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
