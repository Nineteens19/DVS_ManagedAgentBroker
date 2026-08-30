'use client';

import React from 'react';
import { AgentType, AgentProfileDto, GuarantorDto, CollateralDto, AttachmentDto } from '../../types/domain';
import { PiiMaskedField } from '../ui/PiiMaskedField';
import { CheckCircle2, User, ShieldCheck, Landmark, FileText, Send, Save } from 'lucide-react';

interface Step4ReviewSubmitProps {
  agentType: AgentType;
  profile: AgentProfileDto;
  guarantor?: GuarantorDto;
  collateral?: CollateralDto;
  attachments: AttachmentDto[];
  requestedCreditLimit: number;
  paymentTermMotor: number;
  paymentTermNonMotor: number;
  branchName: string;
  onBack: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSavingDraft: boolean;
}

export const Step4ReviewSubmit: React.FC<Step4ReviewSubmitProps> = ({
  agentType,
  profile,
  guarantor,
  collateral,
  attachments,
  requestedCreditLimit,
  paymentTermMotor,
  paymentTermNonMotor,
  branchName,
  onBack,
  onSaveDraft,
  onSubmit,
  isSubmitting,
  isSavingDraft,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Header Confirmation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">ตรวจสอบความถูกต้องก่อนยื่นใบสมัคร</h4>
            <p className="text-xs text-slate-400">สาขาที่ยื่น: {branchName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">วงเงินสินเชื่อที่ขอ</span>
          <span className="text-base font-extrabold text-sky-400 font-mono">
            ฿{requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 2. Profile Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center space-x-2 text-sky-400 pb-2 border-b border-slate-800">
          <User className="w-4 h-4" />
          <h5 className="text-xs font-bold text-slate-200">ข้อมูลผู้สมัคร ({agentType === 'Individual' ? 'บุคคลธรรมดา' : 'นิติบุคคล'})</h5>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">ชื่อ-นามสกุล</span>
            <span className="font-semibold text-slate-100">
              {profile.titleTh} {profile.firstNameTh} {profile.lastNameTh}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">
              {agentType === 'Individual' ? 'เลขประจำตัวประชาชน' : 'เลขประจำตัวผู้เสียภาษี'}
            </span>
            <PiiMaskedField value={profile.nationalIdOrTaxId} type="nationalId" />
          </div>

          <div>
            <span className="text-slate-400 block">เบอร์โทรศัพท์</span>
            <span className="font-semibold text-slate-100">{profile.phoneNumber || '-'}</span>
          </div>

          <div>
            <span className="text-slate-400 block">บัญชีรับค่าคอมมิชชั่น</span>
            <span className="font-semibold text-slate-100">
              {profile.bankName} (<PiiMaskedField value={profile.bankAccountNumber} type="bankAccount" />)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Guarantor & Collateral & Terms Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-sky-400 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4" />
            <h5 className="text-xs font-bold text-slate-200">ผู้ค้ำประกัน & หลักทรัพย์</h5>
          </div>
          {guarantor ? (
            <div className="text-xs space-y-1 text-slate-300">
              <p>
                <span className="text-slate-400">ชื่อผู้ค้ำ:</span> {guarantor.titleTh} {guarantor.firstNameTh} {guarantor.lastNameTh}
              </p>
              <p>
                <span className="text-slate-400">เลขบัตร ปชช.:</span> <PiiMaskedField value={guarantor.nationalId} />
              </p>
              <p>
                <span className="text-slate-400">ความสัมพันธ์:</span> {guarantor.relationship || '-'}
              </p>
              <p>
                <span className="text-slate-400">รายได้:</span> ฿{(guarantor.monthlySalary || 0).toLocaleString()} / เดือน
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">ไม่มีข้อมูลผู้ค้ำประกัน</p>
          )}

          {collateral && collateral.type !== 'None' && (
            <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1 text-slate-300">
              <div className="flex items-center space-x-1 text-slate-200 font-semibold">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>หลักทรัพย์: {collateral.type}</span>
              </div>
              <p><span className="text-slate-400">เลขที่เอกสาร:</span> {collateral.documentRefNumber || '-'}</p>
              <p><span className="text-slate-400">มูลค่าประเมิน:</span> ฿{(collateral.appraisedValue || 0).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-sky-400 pb-2 border-b border-slate-800">
            <FileText className="w-4 h-4" />
            <h5 className="text-xs font-bold text-slate-200">เงื่อนไขเทอมการชำระ & เอกสารแนบ</h5>
          </div>
          <div className="text-xs space-y-1 text-slate-300">
            <p><span className="text-slate-400">เทอมชำระเบี้ย Motor:</span> <span className="font-bold text-sky-400">{paymentTermMotor} วัน</span></p>
            <p><span className="text-slate-400">เทอมชำระเบี้ย Non-Motor:</span> <span className="font-bold text-sky-400">{paymentTermNonMotor} วัน</span></p>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              เอกสารแนบที่ผ่านการตรวจสอบ ({attachments.length} ไฟล์):
            </span>
            <div className="space-y-1">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 px-2.5 py-1 rounded-lg">
                  <span className="truncate max-w-[200px]">{att.fileName}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Verified ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
        >
          ← ย้อนกลับ
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingDraft ? 'กำลังบันทึกร่าง...' : 'บันทึกแบบร่าง (Save Draft)'}</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSavingDraft}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังส่งใบสมัคร...' : 'ยื่นใบสมัคร (Submit Application)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
