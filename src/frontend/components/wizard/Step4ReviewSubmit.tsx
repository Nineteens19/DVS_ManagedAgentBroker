'use client';

import React from 'react';
import { AgentType, AgentProfileDto, GuarantorDto, CollateralDto, AttachmentDto } from '../../types/domain';
import { PiiMaskedField } from '../ui/PiiMaskedField';
import { CheckCircle2, User, ShieldCheck, Landmark, FileText, Send, Save, ArrowLeft } from 'lucide-react';

interface Step4ReviewSubmitProps {
  agentType: AgentType;
  profile: AgentProfileDto;
  guarantor?: GuarantorDto;
  collateral?: CollateralDto;
  attachments: AttachmentDto[];
  requestedCreditLimit: number;
  paymentTermMotor: 15 | 30 | 31;
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
    <div className="space-y-5">
      {/* 1. Review Summary Notice */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start space-x-3 text-xs text-[#012169]">
        <CheckCircle2 className="w-5 h-5 text-[#012169] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนยื่นใบสมัคร</h4>
          <p className="mt-0.5 text-blue-900/80">
            เมื่อยื่นใบสมัครแล้ว ข้อมูลจะถูกส่งต่อไปยังเจ้าหน้าที่ตรวจรับสำนักงานใหญ่ (HO Reviewer) และระบบตรวจคัดกรอง Sanctions (AMLO/OIC) อัตโนมัติ
          </p>
        </div>
      </div>

      {/* 2. Profile & Guarantor Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applicant Information */}
        <div className="deves-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
            <User className="w-4 h-4" />
            <h5 className="text-xs font-bold text-[#212529]">ข้อมูลผู้สมัคร</h5>
          </div>
          <div className="text-xs space-y-1.5 text-[#212529]">
            <p>
              <span className="text-[#6C757D]">ประเภท:</span>{' '}
              <span className="font-bold text-[#012169]">
                {agentType === 'Individual' ? 'บุคคลธรรมดา (Individual Agent)' : 'นิติบุคคล (Corporate Broker)'}
              </span>
            </p>
            <p>
              <span className="text-[#6C757D]">ชื่อ-นามสกุล:</span>{' '}
              <span className="font-bold text-[#212529]">
                {profile.titleTh} {profile.firstNameTh} {profile.lastNameTh}
              </span>
            </p>
            <p className="flex items-center space-x-1.5">
              <span className="text-[#6C757D]">เลขประจำตัว 13 หลัก:</span>
              <PiiMaskedField value={profile.nationalIdOrTaxId} />
            </p>
            <p>
              <span className="text-[#6C757D]">เบอร์โทรศัพท์:</span> {profile.phoneNumber || '-'}
            </p>
            <p>
              <span className="text-[#6C757D]">อีเมล:</span> {profile.email || '-'}
            </p>
            <p>
              <span className="text-[#6C757D]">สาขาที่ยื่น:</span> <span className="font-semibold">{branchName}</span>
            </p>
          </div>
        </div>

        {/* Credit Limit & Terms */}
        <div className="deves-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
            <FileText className="w-4 h-4" />
            <h5 className="text-xs font-bold text-[#212529]">วงเงินสินเชื่อ & เทอมชำระเบี้ย</h5>
          </div>
          <div className="text-xs space-y-1.5 text-[#212529]">
            <p>
              <span className="text-[#6C757D]">วงเงินสินเชื่อที่ขอ:</span>{' '}
              <span className="font-mono text-sm font-bold text-[#012169]">
                ฿{requestedCreditLimit.toLocaleString()}
              </span>
            </p>
            <p>
              <span className="text-[#6C757D]">เทอมชำระเบี้ย Motor:</span>{' '}
              <span className="font-bold text-[#012169]">{paymentTermMotor} วัน</span>
            </p>
            <p>
              <span className="text-[#6C757D]">เทอมชำระเบี้ย Non-Motor:</span>{' '}
              <span className="font-bold text-[#012169]">{paymentTermNonMotor} วัน</span>
            </p>
            <p>
              <span className="text-[#6C757D]">บัญชีธนาคาร:</span> {profile.bankName} ({profile.bankAccountNumber || '-'})
            </p>
          </div>
        </div>
      </div>

      {/* 3. Guarantor & Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guarantor & Collateral */}
        <div className="deves-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
            <ShieldCheck className="w-4 h-4" />
            <h5 className="text-xs font-bold text-[#212529]">ผู้ค้ำประกัน & หลักทรัพย์</h5>
          </div>
          {guarantor ? (
            <div className="text-xs space-y-1.5 text-[#212529]">
              <p>
                <span className="text-[#6C757D]">ชื่อผู้ค้ำ:</span>{' '}
                <span className="font-bold">
                  {guarantor.titleTh} {guarantor.firstNameTh} {guarantor.lastNameTh}
                </span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="text-[#6C757D]">เลขบัตร ปชช.:</span>
                <PiiMaskedField value={guarantor.nationalId} />
              </p>
              <p>
                <span className="text-[#6C757D]">ความสัมพันธ์:</span> {guarantor.relationship || '-'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#6C757D] italic">ไม่มีผู้ค้ำประกันสัญญา</p>
          )}

          {collateral && collateral.type !== 'None' && (
            <div className="pt-2 border-t border-[#DEE2E6] text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-[#012169] font-bold">
                <Landmark className="w-3.5 h-3.5" />
                <span>หลักทรัพย์: {collateral.type}</span>
              </div>
              <p>
                <span className="text-[#6C757D]">เลขที่เอกสาร:</span> {collateral.documentRefNumber || '-'}
              </p>
              <p>
                <span className="text-[#6C757D]">มูลค่าประเมิน:</span> ฿
                {(collateral.appraisedValue || 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="deves-card p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
            <FileText className="w-4 h-4" />
            <h5 className="text-xs font-bold text-[#212529]">เอกสารแนบที่ผ่านการตรวจสอบ</h5>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#6C757D] block mb-1">
              เอกสารแนบทั้งหมด ({attachments.length} ไฟล์):
            </span>
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between text-xs text-[#212529] bg-[#F8F9FA] px-3 py-2 rounded border border-[#DEE2E6]"
              >
                <span className="truncate max-w-[200px]">{att.fileName}</span>
                <span className="text-[11px] text-green-700 font-semibold font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 inline mr-1" />
                  <span>Magic Byte Valid</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Action Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#DEE2E6]">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline flex items-center space-x-1.5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="btn-secondary flex items-center space-x-1.5 text-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง (Draft)'}</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSavingDraft}
            className="btn-primary flex items-center space-x-2 text-xs disabled:opacity-50 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันและยื่นใบสมัคร (Submit)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
