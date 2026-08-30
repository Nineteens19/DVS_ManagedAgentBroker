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
      <div className="p-5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-primary text-secondary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary">ตรวจสอบความถูกต้องก่อนยื่นใบสมัคร</h4>
            <p className="text-xs text-gray-600">สาขาที่ยื่นเอกสาร: <span className="font-semibold text-gray-800">{branchName}</span></p>
          </div>
        </div>
        <div className="sm:text-right">
          <span className="text-xs text-gray-500 block">วงเงินสินเชื่อที่ขอ</span>
          <span className="text-lg font-black text-primary font-mono">
            ฿{requestedCreditLimit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 2. Profile Summary Card */}
      <div className="deves-card p-6 space-y-4">
        <div className="flex items-center space-x-2 text-primary pb-2 border-b border-gray-200">
          <User className="w-4 h-4" />
          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            ข้อมูลผู้สมัคร ({agentType === 'Individual' ? 'บุคคลธรรมดา' : 'นิติบุคคล'})
          </h5>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block">ชื่อ-นามสกุล</span>
            <span className="font-bold text-gray-900 text-sm">
              {profile.titleTh} {profile.firstNameTh} {profile.lastNameTh}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block">
              {agentType === 'Individual' ? 'เลขประจำตัวประชาชน' : 'เลขประจำตัวผู้เสียภาษี'}
            </span>
            <PiiMaskedField value={profile.nationalIdOrTaxId} type="nationalId" />
          </div>

          <div>
            <span className="text-gray-500 block">เบอร์โทรศัพท์</span>
            <span className="font-semibold text-gray-800">{profile.phoneNumber || '-'}</span>
          </div>

          <div>
            <span className="text-gray-500 block">บัญชีรับค่าคอมมิชชั่น</span>
            <span className="font-semibold text-gray-800">
              {profile.bankName} (<PiiMaskedField value={profile.bankAccountNumber} type="bankAccount" />)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Guarantor & Collateral & Terms Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="deves-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-primary pb-2 border-b border-gray-200">
            <ShieldCheck className="w-4 h-4" />
            <h5 className="text-xs font-bold text-gray-900">ผู้ค้ำประกัน & หลักทรัพย์</h5>
          </div>
          {guarantor ? (
            <div className="text-xs space-y-1.5 text-gray-700">
              <p>
                <span className="text-gray-500">ชื่อผู้ค้ำ:</span> <span className="font-semibold text-gray-900">{guarantor.titleTh} {guarantor.firstNameTh} {guarantor.lastNameTh}</span>
              </p>
              <p>
                <span className="text-gray-500">เลขบัตร ปชช.:</span> <PiiMaskedField value={guarantor.nationalId} />
              </p>
              <p>
                <span className="text-gray-500">ความสัมพันธ์:</span> {guarantor.relationship || '-'}
              </p>
              <p>
                <span className="text-gray-500">รายได้:</span> ฿{(guarantor.monthlySalary || 0).toLocaleString()} / เดือน
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">ไม่มีข้อมูลผู้ค้ำประกัน</p>
          )}

          {collateral && collateral.type !== 'None' && (
            <div className="pt-2 border-t border-gray-200 text-xs space-y-1 text-gray-700">
              <div className="flex items-center space-x-1 text-primary font-semibold">
                <Landmark className="w-3.5 h-3.5 text-amber-600" />
                <span>หลักทรัพย์: {collateral.type}</span>
              </div>
              <p><span className="text-gray-500">เลขที่เอกสาร:</span> {collateral.documentRefNumber || '-'}</p>
              <p><span className="text-gray-500">มูลค่าประเมิน:</span> ฿{(collateral.appraisedValue || 0).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="deves-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-primary pb-2 border-b border-gray-200">
            <FileText className="w-4 h-4" />
            <h5 className="text-xs font-bold text-gray-900">เงื่อนไขการชำระ & เอกสารแนบ</h5>
          </div>
          <div className="text-xs space-y-1.5 text-gray-700">
            <p><span className="text-gray-500">เทอมชำระเบี้ย Motor:</span> <span className="font-bold text-primary">{paymentTermMotor} วัน</span></p>
            <p><span className="text-gray-500">เทอมชำระเบี้ย Non-Motor:</span> <span className="font-bold text-primary">{paymentTermNonMotor} วัน</span></p>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <span className="text-[11px] font-semibold text-gray-600 block mb-1">
              เอกสารแนบที่ผ่านการตรวจสอบ ({attachments.length} ไฟล์):
            </span>
            <div className="space-y-1">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between text-xs text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded border border-gray-200">
                  <span className="truncate max-w-[200px]">{att.fileName}</span>
                  <span className="text-[11px] text-green-700 font-semibold font-mono">Magic Byte OK ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:text-primary hover:bg-gray-100 border border-gray-300 transition-all"
        >
          ← ย้อนกลับ
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-primary bg-white hover:bg-blue-50 border border-primary disabled:opacity-50 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingDraft ? 'กำลังบันทึกร่าง...' : 'บันทึกแบบร่าง (Save Draft)'}</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSavingDraft}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-md disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังส่งใบสมัคร...' : 'ยื่นใบสมัคร (Submit Application)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
