'use client';

import React from 'react';
import Link from 'next/link';
import { AgentApplicationDetailDto } from '../../types/domain';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import { SlaCountdownBadge } from './SlaCountdownBadge';
import { PiiMaskedField } from './PiiMaskedField';
import {
  User,
  CreditCard,
  ShieldCheck,
  Landmark,
  FileText,
  Server,
  Archive,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AgentApplicationDetailDto | null;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  if (!application) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`รายละเอียดใบสมัคร: ${application.applicationNumber}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Header Summary Banner */}
        <div className="p-4 rounded-xl bg-[#012169]/5 border border-[#012169]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold text-[#012169]">
                {application.applicationNumber}
              </span>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-[#6C757D] mt-1">
              สาขา: <span className="font-semibold text-[#212529]">{application.branchName} ({application.branchCode})</span> | ยื่นเมื่อ: {new Date(application.createdAt).toLocaleDateString('th-TH')}
            </p>
          </div>

          {application.agentCode && (
            <div className="p-2.5 rounded-lg bg-white border border-[#DEE2E6] text-right">
              <div className="text-[10px] text-[#6C757D] uppercase font-bold">รหัสที่ได้รับอนุมัติ</div>
              <div className="font-mono text-xs font-bold text-[#012169]">Agent: {application.agentCode}</div>
              {application.sourceCode && (
                <div className="font-mono text-[11px] text-[#6C757D]">Src: {application.sourceCode}</div>
              )}
            </div>
          )}
        </div>

        {/* 1. Applicant Profile */}
        <div className="deves-card p-4 space-y-3">
          <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
            <User className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[#212529]">ข้อมูลผู้สมัครและบัญชีธนาคาร</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#212529]">
            <p>
              <span className="text-[#6C757D]">ประเภท:</span>{' '}
              <span className="font-semibold">
                {application.agentType === 'Individual' ? 'บุคคลธรรมดา (Individual)' : 'นิติบุคคล (Corporate)'}
              </span>
            </p>
            <p>
              <span className="text-[#6C757D]">ชื่อ-นามสกุล:</span>{' '}
              <span className="font-bold">
                {application.profile.titleTh} {application.profile.firstNameTh} {application.profile.lastNameTh}
              </span>
            </p>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#6C757D]">เลขประจำตัว 13 หลัก:</span>
              <PiiMaskedField value={application.profile.nationalIdOrTaxId} />
            </div>
            <p>
              <span className="text-[#6C757D]">เบอร์โทรศัพท์:</span> {application.profile.phoneNumber || '-'}
            </p>
            <p>
              <span className="text-[#6C757D]">อีเมล:</span> {application.profile.email || '-'}
            </p>
            <p>
              <span className="text-[#6C757D]">เลขที่ใบอนุญาต:</span>{' '}
              <span className="font-mono">{application.profile.licenseNumber || 'อยู่ระหว่างยื่นขอ'}</span>
            </p>
            <p className="md:col-span-2">
              <span className="text-[#6C757D]">บัญชีธนาคาร:</span>{' '}
              <span className="font-semibold">{application.profile.bankName}</span> ({application.profile.bankAccountNumber || '-'})
            </p>
          </div>
        </div>

        {/* 2. Credit Terms & Guarantor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Credit Terms */}
          <div className="deves-card p-4 space-y-3">
            <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
              <CreditCard className="w-4 h-4" />
              <h4 className="text-xs font-bold text-[#212529]">วงเงินสินเชื่อ & เทอมชำระเบี้ย</h4>
            </div>
            <div className="text-xs space-y-2 text-[#212529]">
              <div className="flex justify-between">
                <span className="text-[#6C757D]">วงเงินที่ขอ:</span>
                <span className="font-mono font-bold text-[#012169]">
                  ฿{application.requestedCreditLimit.toLocaleString()}
                </span>
              </div>
              {application.approvedCreditLimit !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">วงเงินที่อนุมัติจริง:</span>
                  <span className="font-mono font-bold text-[#28A745]">
                    ฿{application.approvedCreditLimit.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6C757D]">เทอมชำระเบี้ย Motor:</span>
                <span className="font-semibold">{application.paymentTermMotorDays} วัน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C757D]">เทอมชำระเบี้ย Non-Motor:</span>
                <span className="font-semibold">{application.paymentTermNonMotorDays} วัน</span>
              </div>
              {application.commissionPercentage && (
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">อัตราคอมมิชชั่น:</span>
                  <span className="font-bold text-primary">{application.commissionPercentage}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Guarantor & Collateral */}
          <div className="deves-card p-4 space-y-3">
            <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs font-bold text-[#212529]">ผู้ค้ำประกัน & หลักทรัพย์</h4>
            </div>
            {application.guarantor ? (
              <div className="text-xs space-y-1.5 text-[#212529]">
                <p>
                  <span className="text-[#6C757D]">ชื่อผู้ค้ำ:</span>{' '}
                  <span className="font-bold">
                    {application.guarantor.titleTh} {application.guarantor.firstNameTh} {application.guarantor.lastNameTh}
                  </span>
                </p>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#6C757D]">เลขบัตร ปชช.:</span>
                  <PiiMaskedField value={application.guarantor.nationalId} />
                </div>
                <p>
                  <span className="text-[#6C757D]">ความสัมพันธ์:</span> {application.guarantor.relationship || '-'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#6C757D] italic">ไม่มีผู้ค้ำประกันสัญญา</p>
            )}

            {application.collateral && application.collateral.type !== 'None' && (
              <div className="pt-2 border-t border-[#DEE2E6] text-xs space-y-1">
                <div className="flex items-center space-x-1 text-[#012169] font-bold">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>หลักทรัพย์: {application.collateral.type}</span>
                </div>
                <p>
                  <span className="text-[#6C757D]">เลขที่อ้างอิง:</span> {application.collateral.documentRefNumber || '-'}
                </p>
                <p>
                  <span className="text-[#6C757D]">มูลค่าประเมิน:</span> ฿{(application.collateral.appraisedValue || 0).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Core Systems Sync Integration Record */}
        {application.syncTransactions && application.syncTransactions.length > 0 && (
          <div className="deves-card p-4 space-y-3">
            <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
              <Server className="w-4 h-4" />
              <h4 className="text-xs font-bold text-[#212529]">
                ประวัติการ Sync ข้อมูลไปยัง 4 ระบบหลัก (Deves Core Systems)
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {application.syncTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#DEE2E6] text-center"
                >
                  <span className="text-xs font-bold text-[#012169] block font-mono">{tx.targetSystem}</span>
                  <span className="inline-flex items-center text-[11px] text-green-700 font-semibold mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Physical Contract Record (if exists) */}
        {application.physicalContractRecord && (
          <div className="deves-card p-4 space-y-2 bg-[#F8F9FA]">
            <div className="flex items-center space-x-2 text-[#012169]">
              <Archive className="w-4 h-4" />
              <h4 className="text-xs font-bold text-[#212529]">ฝ่ายกฎหมายจัดเก็บเอกสารสัญญาตัวจริง</h4>
            </div>
            <div className="text-xs space-y-1 text-[#212529]">
              <p>
                <span className="text-[#6C757D]">สถานะจัดเก็บ:</span>{' '}
                <span className="font-bold text-primary">{application.physicalContractRecord.status}</span>
              </p>
              {application.physicalContractRecord.archiveBoxNumber && (
                <p>
                  <span className="text-[#6C757D]">หมายเลขกล่องจัดเก็บ:</span>{' '}
                  <span className="font-mono font-bold text-[#28A745]">{application.physicalContractRecord.archiveBoxNumber}</span>
                </p>
              )}
              {application.physicalContractRecord.legalAuditorNotes && (
                <p>
                  <span className="text-[#6C757D]">บันทึกเจ้าหน้าที่:</span> {application.physicalContractRecord.legalAuditorNotes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#DEE2E6] mt-4">
        <button
          type="button"
          onClick={onClose}
          className="btn-outline text-xs !h-9"
        >
          ปิดหน้าต่าง
        </button>

        <div className="flex items-center space-x-2">
          {/* If Draft / Deficiency -> Edit & Continue */}
          {(application.status === 'Draft' || application.status === 'DeficiencyPendingBranch') && (
            <Link
              href={`/intake/new?id=${application.id}`}
              onClick={onClose}
              className="btn-primary text-xs !h-9 inline-flex items-center space-x-1.5 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>เปิดแก้ไขและยื่นต่อ (Edit & Submit)</span>
            </Link>
          )}

          {/* Direct operational deep links based on status */}
          {application.status === 'PendingHeadOfficeReview' && (
            <Link
              href="/review"
              onClick={onClose}
              className="btn-primary text-xs !h-9 inline-flex items-center space-x-1.5 shadow-sm"
            >
              <span>ไปที่หน้าตรวจรับ สนญ.</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {application.status === 'PendingExecutiveApproval' && (
            <Link
              href="/approval"
              onClick={onClose}
              className="btn-primary text-xs !h-9 inline-flex items-center space-x-1.5 shadow-sm"
            >
              <span>ไปที่หน้าผู้บริหารอนุมัติ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {application.status === 'ReviewPremium' && (
            <Link
              href="/provisioning"
              onClick={onClose}
              className="btn-primary text-xs !h-9 inline-flex items-center space-x-1.5 shadow-sm"
            >
              <span>ไปที่หน้าตั้งวงเงิน & Provisioning</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {application.status === 'ActiveTemporary' && (
            <Link
              href="/archive"
              onClick={onClose}
              className="btn-primary text-xs !h-9 inline-flex items-center space-x-1.5 shadow-sm"
            >
              <span>ไปที่หน้าจัดเก็บสัญญาตัวจริง</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Modal>
  );
};
