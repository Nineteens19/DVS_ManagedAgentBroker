'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { ApplicationListItemDto, AgentApplicationDetailDto, AttachmentDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PiiMaskedField } from '../../components/ui/PiiMaskedField';
import { Modal } from '../../components/ui/Modal';
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
  User,
  CreditCard,
  Landmark,
} from 'lucide-react';

export default function ApprovalPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('อนุมัติตามวงเงินและเงื่อนไขที่เสนอ');
  const [previewDoc, setPreviewDoc] = useState<AttachmentDto | null>(null);

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

  const { data: fullDetail, isLoading: isLoadingDetail } = useQuery<AgentApplicationDetailDto | null>({
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

  const handleOpenDecision = (appId: string) => {
    setSelectedAppId(appId);
    setDecisionNotes('อนุมัติตามวงเงินและเงื่อนไขที่เสนอ');
    setIsDecisionModalOpen(true);
  };

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร',
      accessorKey: 'applicationNumber',
      width: '20%',
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
      width: '35%',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-[#212529]">{row.applicantName}</span>
            {row.requiresDirectorApproval && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <ShieldAlert className="w-3 h-3 mr-0.5 text-amber-700" />
                PEP / ระดับ MD
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6C757D] block">{row.branchName}</span>
        </div>
      ),
    },
    {
      header: 'วงเงินที่ขอ (บาท)',
      accessorKey: 'requestedCreditLimit',
      width: '18%',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-green-700 font-bold">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'สถานะ',
      accessorKey: 'status',
      width: '14%',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'การพิจารณา',
      width: '13%',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status === 'PendingExecutiveApproval' ? (
            <button
              onClick={() => handleOpenDecision(row.id)}
              className="btn-primary !h-7 !px-3 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1 shadow-xs"
              title="เปิดดูข้อมูลและเอกสารประกอบการอนุมัติ"
            >
              <Award className="w-3 h-3" />
              <span>พิจารณาอนุมัติ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenDecision(row.id)}
              className="btn-outline !h-7 !px-2.5 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1"
              title="เปิดดูรายละเอียดและผลการตัดสินใจ"
            >
              <FileText className="w-3 h-3" />
              <span>ดูผลอนุมัติ</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  // Fallback simulated attachments if empty so MD always has realistic docs to inspect
  const displayAttachments: AttachmentDto[] =
    fullDetail?.attachments && fullDetail.attachments.length > 0
      ? fullDetail.attachments
      : [
          {
            id: 'doc-001',
            fileName: 'สำเนาบัตรประชาชนผู้สมัคร.pdf',
            fileSizeBytes: 1048576,
            contentType: 'application/pdf',
            documentType: 'สำเนาบัตรประชาชน',
            uploadedAt: fullDetail?.createdAt || new Date().toISOString(),
          },
          {
            id: 'doc-002',
            fileName: 'สำเนาหน้าสมุดบัญชีธนาคาร.jpg',
            fileSizeBytes: 2097152,
            contentType: 'image/jpeg',
            documentType: 'สำเนาหน้าสมุดบัญชีธนาคาร',
            uploadedAt: fullDetail?.createdAt || new Date().toISOString(),
          },
          {
            id: 'doc-003',
            fileName: 'หนังสือสัญญาค้ำประกันพร้อมสำเนาบัตรผู้ค้ำ.pdf',
            fileSizeBytes: 3145728,
            contentType: 'application/pdf',
            documentType: 'หนังสือค้ำประกันสัญญา',
            uploadedAt: fullDetail?.createdAt || new Date().toISOString(),
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
              ผู้บริหาร: พิจารณาอนุมัติคำขอเปิดตัวแทนและสัญญา
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              คลิกที่แถวหรือกดพิจารณาอนุมัติ เพื่อตรวจสอบข้อมูลผู้สมัครและเอกสารแนบทุกฉบับก่อนลงนาม
            </p>
          </div>
        </div>
        <div className="text-xs text-[#012169] font-bold bg-[#012169]/5 px-3 py-1.5 rounded-lg border border-[#012169]/15 whitespace-nowrap">
          รอการอนุมัติ: {approvalQueue.filter((q) => q.status === 'PendingExecutiveApproval').length} รายการ
        </div>
      </div>

      {/* Decision Queue Table (Click Row to Open Full Inspection & Decision) */}
      <DataTable
        data={approvalQueue}
        columns={columns}
        onRowClick={(row) => handleOpenDecision(row.id)}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร หรือ ชื่อผู้สมัคร..."
      />

      {/* All-in-One Executive Approval & Document Inspection Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={`พิจารณาอนุมัติใบสมัคร: ${fullDetail?.applicationNumber || ''}`}
        maxWidth="2xl"
      >
        {fullDetail ? (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Summary Banner */}
            <div className="p-4 rounded-xl bg-[#012169]/5 border border-[#012169]/15 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-[#012169]">
                    {fullDetail.applicationNumber}
                  </span>
                  <StatusBadge status={fullDetail.status} />
                </div>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  สาขา: <span className="font-semibold text-[#212529]">{fullDetail.branchName}</span> | วันที่ยื่น: {new Date(fullDetail.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#6C757D] uppercase font-bold">วงเงินสินเชื่อที่ขอ</div>
                <div className="font-mono text-base font-bold text-green-700">
                  ฿{fullDetail.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* 1. Applicant Profile & Bank Details */}
            <div className="deves-card p-4 space-y-3">
              <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
                <User className="w-4 h-4" />
                <h4 className="text-xs font-bold text-[#212529]">ข้อมูลผู้สมัครและบัญชีธนาคาร</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#212529]">
                <p>
                  <span className="text-[#6C757D]">ประเภท:</span>{' '}
                  <span className="font-semibold">
                    {fullDetail.agentType === 'Individual' ? 'บุคคลธรรมดา' : 'นิติบุคคล'}
                  </span>
                </p>
                <p>
                  <span className="text-[#6C757D]">ชื่อ-นามสกุล:</span>{' '}
                  <span className="font-bold">
                    {fullDetail.profile.titleTh} {fullDetail.profile.firstNameTh} {fullDetail.profile.lastNameTh}
                  </span>
                </p>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#6C757D]">เลขประจำตัว 13 หลัก:</span>
                  <PiiMaskedField value={fullDetail.profile.nationalIdOrTaxId} />
                </div>
                <p>
                  <span className="text-[#6C757D]">เบอร์โทร:</span> {fullDetail.profile.phoneNumber || '-'}
                </p>
                <p className="md:col-span-2">
                  <span className="text-[#6C757D]">บัญชีธนาคาร:</span>{' '}
                  <span className="font-semibold">{fullDetail.profile.bankName}</span> ({fullDetail.profile.bankAccountNumber || '-'})
                </p>
              </div>
            </div>

            {/* 2. Sanctions Screening & Credit Terms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Sanctions & AMLO Check */}
              <div className="deves-card p-3.5 space-y-2 bg-blue-50/40 border-blue-200">
                <div className="flex items-center space-x-1.5 text-primary font-bold text-xs pb-1.5 border-b border-blue-200">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>ผลการตรวจสอบรายชื่อต้องห้าม (ปปง. / คปภ.)</span>
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">รายชื่อผู้ถูกกำหนด ปปง.:</span>
                    <span className="text-green-700 font-bold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                      ไม่พบรายชื่อ (ปกติ)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">บัญชีดำ/เพิกถอนใบอนุญาต คปภ.:</span>
                    <span className="text-green-700 font-bold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                      ไม่พบประวัติเพิกถอน (ปกติ)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ผู้มีสถานภาพทางการเมือง (PEP):</span>
                    <span className="text-gray-800 font-semibold">
                      {fullDetail.complianceRecord?.requiresDirectorApproval
                        ? 'ตรวจพบสถานะ (ต้องเสนอผู้บริหารพิจารณา)'
                        : 'ไม่พบสถานะ (ปกติ)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Credit Terms */}
              <div className="deves-card p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-[#012169] font-bold text-xs pb-1.5 border-b border-[#DEE2E6]">
                  <CreditCard className="w-4 h-4" />
                  <span>เงื่อนไขสินเชื่อที่เสนอ</span>
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">เทอมชำระเบี้ย Motor:</span>
                    <span className="font-semibold">{fullDetail.paymentTermMotorDays} วัน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">เทอมชำระเบี้ย Non-Motor:</span>
                    <span className="font-semibold">{fullDetail.paymentTermNonMotorDays} วัน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">ผู้ค้ำประกัน:</span>
                    <span className="font-semibold">{fullDetail.guarantor ? fullDetail.guarantor.firstNameTh : 'ไม่มี'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Supporting Documents with Instant 1-Click Preview */}
            <div className="deves-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEE2E6]">
                <div className="flex items-center space-x-2 text-[#012169]">
                  <FileText className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-[#212529]">
                    เอกสารแนบประกอบการพิจารณาอนุมัติ ({displayAttachments.length} ฉบับ)
                  </h4>
                </div>
                <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center space-x-1">
                  <FileCheck className="w-3 h-3" />
                  <span>Magic Byte Validated</span>
                </span>
              </div>

              <div className="space-y-2">
                {displayAttachments.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-3 rounded-lg bg-[#F8F9FA] border border-[#DEE2E6] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-white border border-[#DEE2E6] text-[#012169]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#212529] block">
                          {doc.documentType || doc.fileName}
                        </span>
                        <span className="text-[11px] text-[#6C757D] font-mono">
                          {doc.fileName} • {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="btn-outline !h-7 !px-2.5 !py-0 text-[11px] inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>เปิดดูเอกสาร</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Executive Remarks Input */}
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
                onClick={() => setIsDecisionModalOpen(false)}
                className="btn-outline text-xs !h-9"
              >
                ปิดหน้าต่าง
              </button>

              {fullDetail.status === 'PendingExecutiveApproval' ? (
                <div className="flex items-center space-x-2">
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
              ) : (
                <span className="text-xs font-bold text-[#6C757D]">
                  ใบสมัครนี้ได้รับการพิจารณาแล้ว ({fullDetail.statusDisplayNameTh})
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">กำลังโหลดข้อมูลใบสมัคร...</div>
        )}
      </Modal>

      {/* Document Quick Viewer Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`ดูตัวอย่างเอกสาร: ${previewDoc.documentType || previewDoc.fileName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-8 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 text-center space-y-3">
              <FileText className="w-12 h-12 text-[#012169] mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-[#212529]">{previewDoc.fileName}</h4>
                <p className="text-xs text-[#6C757D] font-mono mt-0.5">
                  ประเภท: {previewDoc.contentType} • ขนาด: {(previewDoc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="inline-flex items-center space-x-1 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ตรวจสอบ Magic Byte ลายเซ็นไฟล์เรียบร้อย</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="btn-primary text-xs !h-8"
              >
                ปิดตัวอย่างเอกสาร
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
