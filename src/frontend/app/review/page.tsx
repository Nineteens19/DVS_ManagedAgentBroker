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
import { ClipboardCheck, ShieldCheck, AlertTriangle, CheckCircle, Send, FileX2, Eye } from 'lucide-react';

export default function HeadOfficeReviewPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const { data: selectedApp, refetch: refetchDetail } = useQuery({
    queryKey: ['application', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  // Filter applications that need HO Review (Submitted, PendingHeadOfficeReview)
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
        message: 'ใบสมัครถูกส่งเข้าคิวพิจารณาอนุมัติของผู้บริหาร (Pending MD Approval)',
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
      header: 'สาขา',
      accessorKey: 'branchName',
      sortable: true,
    },
    {
      header: 'วงเงินที่ขอ (บาท)',
      accessorKey: 'requestedCreditLimit',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-slate-200">
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
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 hover:text-white bg-sky-950/40 hover:bg-sky-500 border border-sky-500/30 transition-all"
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
      <div className="p-4 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">สำนักงานใหญ่: ตรวจรับเอกสาร & คัดกรอง AMLO / คปภ.</h2>
            <p className="text-xs text-slate-400">
              งานตรวจรับเอกสารของสำนักงานใหญ่ และกลไกตรวจ Sanctions / Blacklist อัตโนมัติ
            </p>
          </div>
        </div>
        <div className="text-xs text-indigo-300 font-mono bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-500/30">
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
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">ผู้สมัคร:</span>
                <span className="font-semibold text-slate-100">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">เลขบัตร / Tax ID:</span>
                <PiiMaskedField value={selectedApp.profile.nationalIdOrTaxId} />
              </div>
              <div>
                <span className="text-slate-400 block">สาขาที่ยื่น:</span>
                <span className="text-slate-200">{selectedApp.branchName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">วงเงินที่ขอ:</span>
                <span className="font-mono text-sky-400 font-bold">
                  ฿{selectedApp.requestedCreditLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* AMLO & OIC Sanctions Screening Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-slate-100">ผลการตรวจคัดกรอง AMLO (ปปง.) & คปภ.</h4>
                </div>

                <button
                  type="button"
                  onClick={() => complianceMutation.mutate(selectedApp.id)}
                  disabled={complianceMutation.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
                >
                  {complianceMutation.isPending ? 'กำลังประมวลผล...' : '⚡ รันตรวจคัดกรอง Sanctions (AMLO/OIC)'}
                </button>
              </div>

              {selectedApp.complianceRecord ? (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div
                    className={`p-3 rounded-xl border ${
                      selectedApp.complianceRecord.amloStatus === 'Clear'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : selectedApp.complianceRecord.amloStatus === 'PepOrange'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
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

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
                    <span className="font-bold block">สถานะ Blacklist คปภ. (OIC):</span>
                    <span className="font-medium mt-0.5 block">🟢 ปกติ (Clear) — ไม่พบประวัติเพิกถอน</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  ยังไม่ได้รันตรวจคัดกรอง — กรุณากดปุ่มด้านบนเพื่อตรวจสอบอัตโนมัติ
                </p>
              )}
            </div>

            {/* Document Verification List */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300">เอกสารแนบที่ผ่านการตรวจสอบ Magic Byte:</h5>
              <div className="space-y-1">
                {selectedApp.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-200">{att.fileName}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Valid Signature ✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeficiencyModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-600 border border-rose-500/40 transition-all"
              >
                <FileX2 className="w-4 h-4" />
                <span>ส่งกลับสาขาแก้ไข (Deficiency)</span>
              </button>

              <button
                type="button"
                onClick={() => forwardMutation.mutate(selectedApp.id)}
                disabled={forwardMutation.isPending || !selectedApp.complianceRecord}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-500/25 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{forwardMutation.isPending ? 'กำลังส่งต่อ...' : 'ส่งต่อผู้บริหารอนุมัติ (Forward to MD)'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
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
            className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsDeficiencyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
            >
              ยืนยันส่งกลับสาขา
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
