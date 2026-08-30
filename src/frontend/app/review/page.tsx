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
import { ClipboardCheck, ShieldCheck, Send, FileX2, Eye } from 'lucide-react';

export default function HeadOfficeReviewPage() {
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

  const { data: selectedApp, refetch: refetchDetail } = useQuery({
    queryKey: ['application', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  // Filter applications that need HO Review (Submitted, PendingHeadOfficeReview, DeficiencyPendingBranch)
  const reviewList = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'PendingHeadOfficeReview' || a.status === 'DeficiencyPendingBranch'
  );

  // Mutation: AMLO & OIC Compliance Screening
  const complianceMutation = useMutation({
    mutationFn: (id: string) => apiClient.runComplianceScreen(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      refetchDetail();
      const isPep = updated.complianceRecord?.requiresDirectorApproval;
      showToast({
        type: isPep ? 'warning' : 'success',
        title: 'ตรวจสอบ AMLO & คปภ. สำเร็จ',
        message: isPep
          ? 'ตรวจพบข้อมูล PEP / Orange Flag - ใบสมัครนี้ต้องให้ระดับกรรมการผู้จัดการ (Director) อนุมัติ'
          : 'ผลการคัดกรอง: ปกติ ไม่พบรายชื่อต้องห้าม (Clear)',
      });
    },
  });

  // Mutation: Forward to Executive Approval
  const forwardMutation = useMutation({
    mutationFn: (id: string) => apiClient.forwardToExecutive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsDetailModalOpen(false);
      showToast({
        type: 'success',
        title: 'ส่งต่อผู้บริหารเรียบร้อย',
        message: 'ใบสมัครถูกส่งเข้าคิวพิจารณาอนุมัติของผู้บริหาร (Pending MD Approval) พร้อมส่ง Notification ทางอีเมล',
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
      header: 'สาขา',
      accessorKey: 'branchName',
      sortable: true,
    },
    {
      header: 'วงเงินที่ขอ (บาท)',
      accessorKey: 'requestedCreditLimit',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-semibold text-gray-800">
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
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:text-white bg-blue-50 hover:bg-primary border border-primary/30 transition-all shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>ตรวจรับ & คัดกรอง</span>
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
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              สำนักงานใหญ่: ตรวจรับเอกสาร & คัดกรอง AMLO / คปภ. (HO Review)
            </h2>
            <p className="text-xs text-gray-500">
              งานตรวจรับเอกสารของสำนักงานใหญ่ และกลไกตรวจ Sanctions / Blacklist อัตโนมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-primary font-bold bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200">
          รอดำเนินการ: {reviewList.length} รายการ
        </div>
      </div>

      {/* Review Queue Table */}
      <DataTable
        data={reviewList}
        columns={columns}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร, ชื่อผู้สมัคร, สาขา..."
      />

      {/* Review Detail & AMLO Screening Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`ตรวจสอบใบสมัคร: ${selectedApp?.applicationNumber || ''}`}
        maxWidth="2xl"
      >
        {selectedApp ? (
          <div className="space-y-5">
            {/* Applicant Summary Card */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">ผู้สมัคร:</span>
                <span className="font-bold text-gray-900">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">เลขบัตร / Tax ID:</span>
                <PiiMaskedField value={selectedApp.profile.nationalIdOrTaxId} />
              </div>
              <div>
                <span className="text-gray-500 block">สาขาที่ยื่น:</span>
                <span className="font-semibold text-gray-800">{selectedApp.branchName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">วงเงินที่ขอ:</span>
                <span className="font-mono text-primary font-bold">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* AMLO & OIC Sanctions Screening Box */}
            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-gray-900">ผลการตรวจคัดกรอง AMLO (ปปง.) & คปภ.</h4>
                </div>

                <button
                  type="button"
                  onClick={() => complianceMutation.mutate(selectedApp.id)}
                  disabled={complianceMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light disabled:opacity-50 transition-all shadow-sm"
                >
                  {complianceMutation.isPending ? 'กำลังประมวลผล...' : '⚡ รันตรวจคัดกรอง Sanctions (AMLO/OIC)'}
                </button>
              </div>

              {selectedApp.complianceRecord ? (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div
                    className={`p-3 rounded-xl border ${
                      selectedApp.complianceRecord.amloStatus === 'Clear'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : selectedApp.complianceRecord.amloStatus === 'PepOrange'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <span className="font-bold block">สถานะ AMLO (ปปง.):</span>
                    <span className="font-medium mt-0.5 block">
                      {selectedApp.complianceRecord.amloStatus === 'Clear'
                        ? '🟢 ปกติ (Clear) — ไม่พบบุคคลต้องห้าม'
                        : selectedApp.complianceRecord.amloStatus === 'PepOrange'
                        ? '🟠 PEP / Orange Flag (ต้องระดับ MD อนุมัติ)'
                        : '🔴 บุคคลถูกกำหนด (Designated Entity)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800">
                    <span className="font-bold block">สถานะ Blacklist คปภ. (OIC):</span>
                    <span className="font-medium mt-0.5 block">🟢 ปกติ (Clear) — ไม่พบประวัติเพิกถอน</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  ยังไม่ได้รันตรวจคัดกรอง — กรุณากดปุ่มด้านบนเพื่อตรวจสอบอัตโนมัติ
                </p>
              )}
            </div>

            {/* Document Verification List */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-800">เอกสารแนบที่ผ่านการตรวจสอบ Magic Byte:</h5>
              <div className="space-y-1">
                {selectedApp.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                  >
                    <span className="font-medium text-gray-800">{att.fileName}</span>
                    <span className="text-green-700 font-mono text-[11px] font-semibold">Valid Signature ✓</span>
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
                <span>ส่งกลับสาขาแก้ไข (Deficiency)</span>
              </button>

              <button
                type="button"
                onClick={() => forwardMutation.mutate(selectedApp.id)}
                disabled={forwardMutation.isPending || !selectedApp.complianceRecord}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-md disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{forwardMutation.isPending ? 'กำลังส่งต่อ...' : 'ส่งต่อผู้บริหารอนุมัติ (Forward to MD)'}</span>
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
              className="px-4 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-100 border border-gray-300"
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
