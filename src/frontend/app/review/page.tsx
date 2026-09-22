'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { ApplicationListItemDto, AgentApplicationDetailDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PiiMaskedField } from '../../components/ui/PiiMaskedField';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  Send,
  FileX2,
  Eye,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState('');

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const reviewQueue = applications.filter(
    (app) =>
      app.status === 'Submitted' ||
      app.status === 'PendingHeadOfficeReview' ||
      app.status === 'DeficiencyPendingBranch'
  );

  const { data: selectedApp } = useQuery<AgentApplicationDetailDto | null>({
    queryKey: ['applicationDetail', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  const formatAmloStatus = (status?: string) => {
    if (!status || status === 'Clear') return 'ผ่าน (ไม่พบรายชื่อผู้ถูกกำหนดในระบบ ปปง.)';
    if (status === 'PepOrange') return 'พบสถานะผู้มีสถานภาพทางการเมือง (PEP - ต้องเสนอผู้บริหาร)';
    if (status === 'DesignatedSanction') return 'พบรายชื่อผู้ถูกกำหนด / มาตรการคว่ำบาตร (ห้ามดำเนินการ)';
    return status;
  };

  const formatOicStatus = (status?: string) => {
    if (!status || status === 'Clear') return 'ผ่าน (ใบอนุญาตถูกต้อง ไม่พบประวัติเพิกถอน)';
    if (status === 'Found') return 'พบประวัติในบัญชีดำ / ถูกเพิกถอนใบอนุญาต (คปภ.)';
    return status;
  };

  const screenMutation = useMutation({
    mutationFn: (id: string) => apiClient.runComplianceScreen(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationDetail', selectedAppId] });
      showToast({
        type: 'success',
        title: 'ตรวจสอบรายชื่อต้องห้าม (ปปง./คปภ.) สำเร็จ',
        message: `ผลการตรวจสอบ ปปง.: ${formatAmloStatus(updated.complianceRecord?.amloStatus)}, คปภ.: ${formatOicStatus(updated.complianceRecord?.oicBlacklistStatus)}`,
      });
    },
  });

  const forwardMutation = useMutation({
    mutationFn: (id: string) => apiClient.forwardToExecutive(id, 'REV-001'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsDetailModalOpen(false);
      showToast({
        type: 'success',
        title: 'ส่งต่อผู้บริหารเรียบร้อย',
        message: 'ใบสมัครถูกส่งเข้าคิวพิจารณาอนุมัติของผู้บริหารเรียบร้อยแล้ว พร้อมส่งการแจ้งเตือนทางอีเมล',
      });
    },
  });

  const handleOpenDetail = (appId: string) => {
    setSelectedAppId(appId);
    setIsDetailModalOpen(true);
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
        <span className="font-mono font-semibold text-[#212529]">
          ฿{row.requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
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
          onClick={() => handleOpenDetail(row.id)}
          className="btn-primary !h-7 !px-3 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1 shadow-xs"
        >
          <Eye className="w-3 h-3" />
          <span>ตรวจรับ & คัดกรอง</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="deves-card p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#012169]/10 text-[#012169] flex-shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              สำนักงานใหญ่: ตรวจรับเอกสาร & ตรวจสอบรายชื่อ ปปง. / คปภ.
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              ตรวจสอบความครบถ้วนของเอกสาร ตรวจสอบรายชื่อผู้ถูกกำหนด และส่งต่อผู้บริหารพิจารณาอนุมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-[#012169] font-bold bg-[#012169]/5 px-3 py-1.5 rounded-lg border border-[#012169]/15 whitespace-nowrap">
          คิวรอตรวจรับ: {reviewQueue.filter((q) => q.status === 'Submitted' || q.status === 'PendingHeadOfficeReview').length} รายการ
        </div>
      </div>

      {/* Review Queue Table */}
      <DataTable
        data={reviewQueue}
        columns={columns}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร หรือ ชื่อผู้สมัคร..."
      />

      {/* Verification & Compliance Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`ตรวจรับใบสมัคร: ${selectedApp?.applicationNumber || ''}`}
        maxWidth="2xl"
      >
        {selectedApp ? (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Applicant Summary */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">ชื่อผู้สมัคร:</span>{' '}
                <span className="font-bold text-gray-900">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-500">เลขบัตร ปชช.:</span>{' '}
                <PiiMaskedField value={selectedApp.profile.nationalIdOrTaxId} />
              </div>
              <div>
                <span className="text-gray-500">สาขา:</span>{' '}
                <span className="font-medium text-gray-800">{selectedApp.branchName}</span>
              </div>
              <div>
                <span className="text-gray-500">วงเงินที่ขอ:</span>{' '}
                <span className="font-mono text-green-700 font-bold">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Sanctions & Compliance Screening */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ผลการตรวจสอบรายชื่อ ปปง. (ป้องกันการฟอกเงิน) & คปภ.</span>
                </div>
                <button
                  type="button"
                  onClick={() => screenMutation.mutate(selectedApp.id)}
                  disabled={screenMutation.isPending}
                  className="px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-sm disabled:opacity-50"
                >
                  {screenMutation.isPending ? 'กำลังประมวลผล...' : 'ตรวจสอบรายชื่อ ปปง./คปภ.'}
                </button>
              </div>

              {selectedApp.complianceRecord ? (
                <div className="p-3 rounded-lg bg-white border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">รายชื่อผู้ถูกกำหนด ปปง.:</span>
                    <span className="font-bold text-green-700 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {formatAmloStatus(selectedApp.complianceRecord.amloStatus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ประวัติเพิกถอนใบอนุญาต คปภ.:</span>
                    <span className="text-green-700 font-semibold">{formatOicStatus(selectedApp.complianceRecord.oicBlacklistStatus)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ผู้มีสถานภาพทางการเมือง (PEP):</span>
                    <span className="text-gray-800 font-medium">
                      {selectedApp.complianceRecord.requiresDirectorApproval ? 'ตรวจพบสถานะ (ต้องเสนอผู้บริหารพิจารณา)' : 'ไม่พบสถานะ (ปกติ)'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  ยังไม่ได้ตรวจสอบรายชื่อต้องห้าม (ปปง./คปภ.) สำหรับใบสมัครนี้
                </p>
              )}
            </div>

            {/* Document Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>รายการเอกสารแนบประกอบการพิจารณา ({selectedApp.attachments.length} ฉบับ)</span>
              </h4>
              <div className="space-y-1.5">
                {selectedApp.attachments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-800">{doc.fileName}</span>
                      <span className="text-[10px] text-gray-500 font-mono">({doc.contentType || doc.documentType})</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      เอกสารผ่านการตรวจสอบ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsDeficiencyModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 transition-all"
              >
                <FileX2 className="w-4 h-4" />
                <span>ส่งกลับให้สาขาแก้ไข</span>
              </button>

              <button
                type="button"
                onClick={() => forwardMutation.mutate(selectedApp.id)}
                disabled={forwardMutation.isPending || !selectedApp.complianceRecord}
                className="btn-primary text-xs !h-9 inline-flex items-center space-x-2 shadow-md disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>{forwardMutation.isPending ? 'กำลังส่งต่อ...' : 'ส่งต่อผู้บริหารพิจารณาอนุมัติ'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">กำลังโหลดข้อมูล...</div>
        )}
      </Modal>

      {/* Deficiency Return Modal */}
      <Modal
        isOpen={isDeficiencyModalOpen}
        onClose={() => setIsDeficiencyModalOpen(false)}
        title="ระบุรายการเอกสารหรือข้อบกพร่องที่ต้องแก้ไข"
        maxWidth="md"
      >
        <div className="space-y-4">
          <textarea
            rows={4}
            value={deficiencyReason}
            onChange={(e) => setDeficiencyReason(e.target.value)}
            placeholder="เช่น ภาพถ่ายบัตรประชาชนไม่ชัดเจน หรือ ขาดสลิปเงินเดือนผู้ค้ำประกัน..."
            className="deves-input"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsDeficiencyModalOpen(false)}
              className="btn-outline text-xs !h-8"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                showToast({
                  type: 'warning',
                  title: 'ส่งกลับแก้ไขแล้ว',
                  message: 'แจ้งเตือนสาขาเพื่อแนบเอกสารเพิ่มเติมเรียบร้อยแล้ว',
                });
                setIsDeficiencyModalOpen(false);
                setIsDetailModalOpen(false);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
            >
              ยืนยันส่งกลับสาขา
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
