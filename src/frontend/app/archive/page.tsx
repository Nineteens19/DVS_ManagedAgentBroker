'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { ApplicationListItemDto } from '../../types/domain';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlaCountdownBadge } from '../../components/ui/SlaCountdownBadge';
import { Modal } from '../../components/ui/Modal';
import { Archive, CheckCircle2, Box, FileCheck, ShieldCheck } from 'lucide-react';

export default function LegalArchivePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [boxNumber, setBoxNumber] = useState('');
  const [auditorNotes, setAuditorNotes] = useState('');

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.getApplications(),
  });

  const { data: selectedApp } = useQuery({
    queryKey: ['application', selectedAppId],
    queryFn: () => (selectedAppId ? apiClient.getApplicationById(selectedAppId) : null),
    enabled: Boolean(selectedAppId),
  });

  // Filter applications that need Hard-Copy Contract Archival (ActiveTemporary, Suspended30D, or ActivePermanent)
  const archiveList = applications.filter(
    (a) => a.status === 'ActiveTemporary' || a.status === 'Suspended30D' || a.status === 'ActivePermanent'
  );

  // Mutation: Archive Physical Hard-Copy Contract
  const archiveMutation = useMutation({
    mutationFn: () => apiClient.archivePhysicalContract(selectedAppId!, boxNumber, auditorNotes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsArchiveModalOpen(false);
      setBoxNumber('');
      setAuditorNotes('');
      showToast({
        type: 'success',
        title: 'จัดเก็บสัญญาฉบับจริงสำเร็จ (Active Permanent)',
        message: `ลงทะเบียนกล่อง ${updated.physicalContractRecord?.archiveBoxNumber} และปลดล็อกสิทธิ์เป็นตัวแทนถาวรเรียบร้อยแล้ว`,
      });
    },
  });

  const handleOpenArchive = (app: ApplicationListItemDto) => {
    setSelectedAppId(app.id);
    const suggestedBox = `BOX-${new Date().getFullYear()}-${app.branchCode}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setBoxNumber(suggestedBox);
    setAuditorNotes('ตรวจรับเอกสารสัญญาต้นฉบับ ลายมือชื่อ และเอกสารค้ำประกันครบถ้วน');
    setIsArchiveModalOpen(true);
  };

  const columns: Column<ApplicationListItemDto>[] = [
    {
      header: 'เลขที่ใบสมัคร / รหัสตัวแทน',
      cell: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-sky-400 block">{row.applicationNumber}</span>
          <span className="text-emerald-400 font-semibold">{row.agentCode || '-'}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อตัวแทน / นายหน้า',
      accessorKey: 'applicantName',
      sortable: true,
    },
    {
      header: 'สาขา',
      accessorKey: 'branchName',
      sortable: true,
    },
    {
      header: 'สถานะ SLA ปัจจุบัน',
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
        <button
          onClick={() => handleOpenArchive(row)}
          disabled={row.status === 'ActivePermanent'}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            row.status === 'ActivePermanent'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 cursor-default'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/40'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{row.status === 'ActivePermanent' ? 'จัดเก็บแล้ว ✓' : 'ลงทะเบียนจัดเก็บกล่อง'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="p-4 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">ฝ่ายกฎหมาย: จัดเก็บเอกสารสัญญาตัวจริง (Legal Contract Archive)</h2>
            <p className="text-xs text-slate-400">
              ตรวจรับต้นฉบับสัญญาตัวจริงจากสาขา ลงทะเบียนกล่องจัดเก็บ และปลดล็อกสิทธิ์ Active Permanent สมบูรณ์
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-300 font-mono bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          รอจัดเก็บสัญญา: {archiveList.filter((a) => a.status !== 'ActivePermanent').length} รายการ
        </div>
      </div>

      {/* Archive Queue Table */}
      <DataTable
        data={archiveList}
        columns={columns}
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
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ชื่อตัวแทน/โบรกเกอร์:</span>
                <span className="font-bold text-slate-100">
                  {selectedApp.profile.titleTh} {selectedApp.profile.firstNameTh} {selectedApp.profile.lastNameTh}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">รหัสตัวแทน (Agent Code):</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedApp.agentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">สถานะสัญญาปัจจุบัน:</span>
                <span className="text-slate-200">{selectedApp.statusDisplayNameTh}</span>
              </div>
            </div>

            {/* Box Number & Auditor Notes */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  หมายเลขกล่องจัดเก็บเอกสาร (Archive Box Number) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={boxNumber}
                  onChange={(e) => setBoxNumber(e.target.value)}
                  placeholder="เช่น BOX-2026-HQ-001"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  บันทึกการตรวจรับของเจ้าหน้าที่กฎหมาย (Auditor Notes)
                </label>
                <textarea
                  rows={3}
                  value={auditorNotes}
                  onChange={(e) => setAuditorNotes(e.target.value)}
                  placeholder="เช่น ตรวจรับสัญญาฉบับจริง สำเนาบัตรประชาชน และหนังสือค้ำประกันครบถ้วนสมบูรณ์..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Permanent Upgrade Benefit Alert */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start space-x-3 text-emerald-300 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">ปลดล็อกสถานะถาวร (Active Permanent)</h5>
                <p className="opacity-90 mt-0.5">
                  เมื่อจัดเก็บสัญญาแล้ว ระบบจะยกเลิกการนับถอยหลัง 30 วัน SLA และป้องกันการระงับสิทธิ์ชั่วคราวอัตโนมัติ
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending || !boxNumber.trim()}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all"
              >
                <FileCheck className="w-4 h-4" />
                <span>{archiveMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยันจัดเก็บเอกสารสัญญาตัวจริง'}</span>
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
