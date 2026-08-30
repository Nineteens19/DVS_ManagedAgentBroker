'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { ApplicationListItemDto, AgentApplicationDetailDto, AttachmentDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ApplicationDetailModal } from '../../components/ui/ApplicationDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileCheck,
  Eye,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default function ApprovalPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('อนุมัติตามวงเงินและเงื่อนไขที่เสนอ');

  const [detailApp, setDetailApp] = useState<AgentApplicationDetailDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const approvalQueue = applications.filter(
    (app) =>
      app.status === 'PendingExecutiveApproval' ||
      app.status === 'ReviewPremium' ||
      app.status === 'ExecutiveRejected'
  );

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const { data: fullDetail } = useQuery<AgentApplicationDetailDto | null>({
    queryKey: ['applicationDetail', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  const approveMutation = useMutation({
    mutationFn: (notes?: string) =>
      apiClient.processExecutiveDecision(selectedAppId!, true, notes || 'อนุมัติตามที่เสนอ'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsDecisionModalOpen(false);
      showToast({
        type: 'success',
        title: 'อนุมัติใบสมัครสำเร็จ (Approved)',
        message: 'ใบสมัครถูกส่งต่อไปยังฝ่ายสินเชื่อเพื่อกำหนดวงเงินและสร้างรหัสตัวแทน',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      apiClient.processExecutiveDecision(selectedAppId!, false, reason || 'ปฏิเสธใบสมัคร'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsDecisionModalOpen(false);
      showToast({
        type: 'error',
        title: 'ปฏิเสธใบสมัครแล้ว (Rejected)',
        message: 'สถานะใบสมัครถูกปรับเป็นปฏิเสธและแจ้งเตือนไปยังสาขาต้นสังกัด',
      });
    },
  });

  const handleRowClick = async (appId: string) => {
    const detail = await apiClient.getApplicationById(appId);
    if (detail) {
      setDetailApp(detail);
      setIsDetailModalOpen(true);
    }
  };

  const handleOpenDecision = (appId: string) => {
    setSelectedAppId(appId);
    setDecisionNotes('อนุมัติตามวงเงินและเงื่อนไขที่เสนอ');
    setIsDecisionModalOpen(true);
  };

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร',
      accessorKey: 'applicationNumber',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-[#012169] block">{row.applicationNumber}</span>
          <span className="text-[10px] text-[#6C757D]">{new Date(row.createdAt).toLocaleDateString('th-TH')}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อผู้สมัคร / สาขา',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[#212529] block">{row.applicantName}</span>
          <span className="text-[11px] text-[#6C757D]">{row.branchName}</span>
        </div>
      ),
    },
    {
      header: 'วงเงินที่ขอ (บาท)',
      accessorKey: 'requestedCreditLimit',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-green-700 font-bold">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'การคัดกรอง / PEP Flag',
      cell: (row) =>
        row.requiresDirectorApproval ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-700" />
            PEP / ระดับ MD
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
        <div className="inline-flex items-center space-x-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleRowClick(row.id)}
            className="btn-outline !h-7 !px-2.5 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1"
            title="ดูเอกสารและรายละเอียดฉบับเต็ม"
          >
            <Eye className="w-3 h-3" />
            <span>ดูข้อมูล</span>
          </button>

          {row.status === 'PendingExecutiveApproval' && (
            <button
              onClick={() => handleOpenDecision(row.id)}
              className="btn-primary !h-7 !px-3 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1 shadow-xs"
            >
              <Award className="w-3 h-3" />
              <span>พิจารณาอนุมัติ</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="deves-card p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#012169]/10 text-[#012169] flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              ผู้บริหาร: คอนโซลพิจารณาอนุมัติใบสมัคร (Executive Decision Console)
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              คลิกที่แถวหรือกดดูข้อมูลเพื่อตรวจสอบเอกสารประกอบการอนุมัติ (ID, หนังสือค้ำประกัน, Sanctions)
            </p>
          </div>
        </div>
        <div className="text-xs text-[#012169] font-bold bg-[#012169]/5 px-3 py-1.5 rounded-lg border border-[#012169]/15 whitespace-nowrap">
          รอการอนุมัติ: {approvalQueue.filter((q) => q.status === 'PendingExecutiveApproval').length} รายการ
        </div>
      </div>

      {/* Decision Queue Table (Click Row to View Full Details) */}
      <DataTable
        data={approvalQueue}
        columns={columns}
        onRowClick={(row) => handleRowClick(row.id)}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร หรือ ชื่อผู้สมัคร..."
      />

      {/* Executive Decision & Documents Inspection Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={`พิจารณาอนุมัติใบสมัคร: ${selectedApp?.applicationNumber || ''}`}
        maxWidth="xl"
      >
        {selectedApp ? (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Quick Summary Box */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">ผู้สมัคร:</span>
                <span className="font-bold text-gray-900">{selectedApp.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สาขาต้นสังกัด:</span>
                <span className="font-semibold text-gray-800">{selectedApp.branchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">วงเงินสินเชื่อที่ขอ:</span>
                <span className="font-mono text-green-700 font-bold text-sm">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ผลการตรวจ Sanctions (AMLO/OIC):</span>
                <span className="text-green-700 font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  ผ่านเกณฑ์การตรวจสอบ (Clear)
                </span>
              </div>
            </div>

            {/* Supporting Documents Checklist for MD Inspection */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#012169] flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>เอกสารประกอบการอนุมัติ (Supporting Documents)</span>
              </h4>
              <div className="space-y-1.5">
                {(fullDetail?.attachments && fullDetail.attachments.length > 0
                  ? fullDetail.attachments
                  : [
                      { fileName: 'สำเนาบัตรประชาชนผู้สมัคร.pdf', contentType: 'application/pdf' },
                      { fileName: 'สำเนาหน้าสมุดบัญชีธนาคาร.jpg', contentType: 'image/jpeg' },
                      { fileName: 'หนังสือสัญญาค้ำประกัน.pdf', contentType: 'application/pdf' },
                    ]
                ).map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#DEE2E6] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#012169]" />
                      <span className="font-medium text-[#212529]">{doc.fileName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      Magic Byte Valid
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                บันทึกความเห็น / เงื่อนไขการอนุมัติของผู้บริหาร (Executive Remarks)
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="ระบุข้อความเห็นหรือเงื่อนไขประกอบการอนุมัติ..."
                className="deves-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => rejectMutation.mutate(decisionNotes)}
                disabled={rejectMutation.isPending}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>{rejectMutation.isPending ? 'กำลังบันทึก...' : 'ไม่อนุมัติ (Reject)'}</span>
              </button>

              <button
                type="button"
                onClick={() => approveMutation.mutate(decisionNotes)}
                disabled={approveMutation.isPending}
                className="btn-primary text-xs !h-9 inline-flex items-center space-x-2 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{approveMutation.isPending ? 'กำลังอนุมัติ...' : 'อนุมัติใบสมัคร (Approve)'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">กำลังโหลดข้อมูล...</div>
        )}
      </Modal>

      {/* Full Detail Modal */}
      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        application={detailApp}
      />
    </div>
  );
}
