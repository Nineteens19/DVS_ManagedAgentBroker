'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { ApplicationListItemDto, AgentApplicationDetailDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlaCountdownBadge } from '../../components/ui/SlaCountdownBadge';
import { Modal } from '../../components/ui/Modal';
import { ApplicationDetailModal } from '../../components/ui/ApplicationDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  Archive,
  Box,
  CheckCircle2,
  ShieldCheck,
  Check,
  Eye,
} from 'lucide-react';

export default function ArchivePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [boxNumber, setBoxNumber] = useState('');
  const [auditorNotes, setAuditorNotes] = useState('');

  const [detailApp, setDetailApp] = useState<AgentApplicationDetailDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const archiveList = applications.filter(
    (app) =>
      app.status === 'ActiveTemporary' ||
      app.status === 'Suspended30D' ||
      app.status === 'ActivePermanent'
  );

  const { data: selectedApp } = useQuery<AgentApplicationDetailDto | null>({
    queryKey: ['applicationDetail', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  const archiveMutation = useMutation({
    mutationFn: (data: { applicationId: string; boxNumber: string; notes?: string }) =>
      apiClient.archivePhysicalContract(data.applicationId, data.boxNumber, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsArchiveModalOpen(false);
      showToast({
        type: 'success',
        title: 'จัดเก็บสัญญาฉบับจริงสำเร็จ (เปิดขายถาวร)',
        message: 'ปลดล็อกเปิดสิทธิ์ขายถาวร และสิ้นสุดการนับกำหนดเวลาส่งสัญญา 30 วัน เรียบร้อยแล้ว',
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

  const handleOpenArchive = (app: ApplicationListItemDto) => {
    setSelectedAppId(app.id);
    setBoxNumber(`BOX-2026-HQ-${String(Math.floor(Math.random() * 900) + 100)}`);
    setAuditorNotes('ตรวจรับสัญญาฉบับจริงพร้อมสำเนาบัตรประชาชนและหนังสือค้ำประกันครบถ้วน');
    setIsArchiveModalOpen(true);
  };

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร / รหัสตัวแทน',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-[#012169] block">{row.applicationNumber}</span>
          <span className="font-mono text-xs text-green-700 font-semibold">{row.agentCode || '-'}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อตัวแทน / สาขา',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[#212529] block">{row.applicantName}</span>
          <span className="text-[11px] text-[#6C757D]">{row.branchName}</span>
        </div>
      ),
    },
    {
      header: 'สถานะและการส่งสัญญา',
      cell: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          <SlaCountdownBadge status={row.status} daysRemaining={row.slaDaysRemaining} />
        </div>
      ),
    },
    {
      header: 'การจัดเก็บสัญญา',
      cell: (row) => (
        <div className="inline-flex items-center space-x-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleRowClick(row.id)}
            className="btn-outline !h-7 !px-2.5 !py-0 text-[11px] whitespace-nowrap inline-flex items-center space-x-1"
            title="ดูรายละเอียดฉบับเต็ม"
          >
            <Eye className="w-3 h-3" />
            <span>ดูข้อมูล</span>
          </button>

          <button
            onClick={() => handleOpenArchive(row)}
            disabled={row.status === 'ActivePermanent'}
            className={`inline-flex items-center space-x-1 !h-7 !px-2.5 !py-0 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              row.status === 'ActivePermanent'
                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                : 'btn-primary shadow-xs'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>
              {row.status === 'ActivePermanent' ? (
                <>
                  <Check className="w-3 h-3 mr-0.5 inline" />
                  <span>จัดเก็บแล้ว</span>
                </>
              ) : (
                <span>ลงทะเบียนจัดเก็บกล่อง</span>
              )}
            </span>
          </button>
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
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              ฝ่ายกฎหมาย / สำนักนิติกรรม: ตรวจรับและจัดเก็บเอกสารสัญญาฉบับจริง
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              ตรวจรับสัญญาฉบับจริง (F-CM-018) จากสาขา บันทึกหมายเลขกล่องจัดเก็บ และปลดล็อกเป็นสถานะเปิดขายถาวร
            </p>
          </div>
        </div>
        <div className="text-xs text-[#012169] font-bold bg-[#012169]/5 px-3 py-1.5 rounded-lg border border-[#012169]/15 whitespace-nowrap">
          รอจัดเก็บสัญญา: {archiveList.filter((q) => q.status === 'ActiveTemporary').length} รายการ
        </div>
      </div>

      {/* Archive Queue Table (Click Row to View Full Details) */}
      <DataTable
        data={archiveList}
        columns={columns}
        onRowClick={(row) => handleRowClick(row.id)}
        searchPlaceholder="ค้นหาตามเลขที่ใบสมัคร, รหัสตัวแทน, สาขา..."
      />

      {/* Archive Registration Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title={`ลงทะเบียนจัดเก็บสัญญาต้นฉบับ: ${selectedApp?.applicationNumber || ''}`}
        maxWidth="lg"
      >
        {selectedApp ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">ชื่อตัวแทน/โบรกเกอร์:</span>
                <span className="font-bold text-gray-900">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">รหัสตัวแทน (Agent Code):</span>
                <span className="font-mono text-green-700 font-bold">{selectedApp.agentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะสัญญาปัจจุบัน:</span>
                <span className="font-medium text-gray-800">{selectedApp.statusDisplayNameTh}</span>
              </div>
            </div>

            {/* Box Number & Auditor Notes */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  หมายเลขกล่องจัดเก็บเอกสาร (Archive Box Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={boxNumber}
                  onChange={(e) => setBoxNumber(e.target.value)}
                  placeholder="เช่น BOX-2026-HQ-001"
                  className="deves-input font-mono font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  บันทึกการตรวจรับของเจ้าหน้าที่กฎหมาย (Auditor Notes)
                </label>
                <textarea
                  rows={3}
                  value={auditorNotes}
                  onChange={(e) => setAuditorNotes(e.target.value)}
                  placeholder="เช่น ตรวจรับสัญญาฉบับจริง สำเนาบัตรประชาชน และหนังสือค้ำประกันครบถ้วนสมบูรณ์..."
                  className="deves-input"
                />
              </div>
            </div>

            {/* Permanent Upgrade Benefit Alert */}
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-start space-x-3 text-green-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">ปลดล็อกสถานะถาวร (Active Permanent)</h5>
                <p className="opacity-90 mt-0.5">
                  เมื่อจัดเก็บสัญญาแล้ว ระบบจะยกเลิกการนับถอยหลัง 30 วัน SLA และป้องกันการระงับสิทธิ์ชั่วคราวอัตโนมัติ
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="btn-outline text-xs !h-9"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() =>
                  archiveMutation.mutate({
                    applicationId: selectedApp.id,
                    boxNumber,
                    notes: auditorNotes,
                  })
                }
                disabled={archiveMutation.isPending || !boxNumber.trim()}
                className="btn-primary text-xs !h-9 inline-flex items-center space-x-2 shadow-md disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {archiveMutation.isPending ? 'กำลังบันทึกจัดเก็บ...' : 'บันทึกจัดเก็บ & เปิดสิทธิ์ถาวร'}
                </span>
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
