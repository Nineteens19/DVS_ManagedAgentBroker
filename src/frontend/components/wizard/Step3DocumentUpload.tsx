'use client';

import React from 'react';
import { AgentType, AttachmentDto } from '../../types/domain';
import { MagicByteDropzone } from '../ui/MagicByteDropzone';
import { FileCheck } from 'lucide-react';

interface Step3DocumentUploadProps {
  agentType: AgentType;
  hasGuarantor: boolean;
  hasCollateral: boolean;
  attachments: AttachmentDto[];
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentDto[]>>;
  onBack: () => void;
  onNext: () => void;
}

export const Step3DocumentUpload: React.FC<Step3DocumentUploadProps> = ({
  agentType,
  hasGuarantor,
  hasCollateral,
  attachments,
  setAttachments,
  onBack,
  onNext,
}) => {
  const handleAttachmentAdded = (newAtt: AttachmentDto) => {
    setAttachments((prev) => {
      const filtered = prev.filter((a) => a.documentType !== newAtt.documentType);
      return [...filtered, newAtt];
    });
  };

  const hasIdCard = attachments.some((a) => a.documentType === 'IdCardCopy' || a.documentType === 'CompanyAffidavit');

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center space-x-2 text-sky-400 pb-2 border-b border-slate-800">
          <FileCheck className="w-5 h-5" />
          <h4 className="text-sm font-bold text-slate-200">
            อัปโหลดเอกสารแนบประกอบการพิจารณา (Document Attachments & Magic Byte Verification)
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          ระบบมีกลไกตรวจสอบ Digital Binary Magic Byte Header อัตโนมัติ เพื่อป้องกันการปลอมแปลงนามสกุลไฟล์ตามมาตรฐาน ISO 27001
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Document 1: ID Card or Company Affidavit */}
          {agentType === 'Individual' ? (
            <MagicByteDropzone
              label="1. สำเนาบัตรประจำตัวประชาชนผู้สมัคร"
              documentType="IdCardCopy"
              required={true}
              onFileValidated={handleAttachmentAdded}
            />
          ) : (
            <MagicByteDropzone
              label="1. หนังสือรับรองนิติบุคคล (ไม่เกิน 6 เดือน)"
              documentType="CompanyAffidavit"
              required={true}
              onFileValidated={handleAttachmentAdded}
            />
          )}

          {/* Document 2: Bank Book Copy */}
          <MagicByteDropzone
            label="2. สำเนาสมุดบัญชีเงินฝากธนาคาร (หน้าแรก)"
            documentType="BankBook"
            required={true}
            onFileValidated={handleAttachmentAdded}
          />

          {/* Document 3: License Copy */}
          <MagicByteDropzone
            label="3. สำเนาใบอนุญาตตัวแทน / นายหน้าประกันวินาศภัย"
            documentType="LicenseCopy"
            required={false}
            onFileValidated={handleAttachmentAdded}
          />

          {/* Document 4: Guarantor ID Card (if applicable) */}
          {hasGuarantor && (
            <MagicByteDropzone
              label="4. สำเนาบัตรประชาชนผู้ค้ำประกัน"
              documentType="GuarantorIdCard"
              required={true}
              onFileValidated={handleAttachmentAdded}
            />
          )}

          {/* Document 5: Collateral Deed (if applicable) */}
          {hasCollateral && (
            <MagicByteDropzone
              label="5. สำเนาโฉนดที่ดิน / สัญญาค้ำประกันหลักทรัพย์"
              documentType="CollateralDeed"
              required={true}
              onFileValidated={handleAttachmentAdded}
            />
          )}
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
        >
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasIdCard}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 transition-all"
        >
          ถัดไป: ตรวจสอบและยื่นใบสมัคร →
        </button>
      </div>
    </div>
  );
};
