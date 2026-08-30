'use client';

import React, { useState } from 'react';
import { GuarantorDto, CollateralDto, CollateralType } from '../../types/domain';
import { validateThaiNationalId } from '../../services/fileValidation';
import { ShieldCheck, Landmark, CreditCard, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Step2GuarantorCollateralProps {
  guarantor?: GuarantorDto;
  setGuarantor: React.Dispatch<React.SetStateAction<GuarantorDto | undefined>>;
  collateral?: CollateralDto;
  setCollateral: React.Dispatch<React.SetStateAction<CollateralDto | undefined>>;
  requestedCreditLimit: number;
  setRequestedCreditLimit: (val: number) => void;
  paymentTermMotor: 15 | 30 | 31;
  setPaymentTermMotor: (val: 15 | 30 | 31) => void;
  paymentTermNonMotor: number;
  setPaymentTermNonMotor: (val: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2GuarantorCollateral: React.FC<Step2GuarantorCollateralProps> = ({
  guarantor,
  setGuarantor,
  collateral,
  setCollateral,
  requestedCreditLimit,
  setRequestedCreditLimit,
  paymentTermMotor,
  setPaymentTermMotor,
  paymentTermNonMotor,
  setPaymentTermNonMotor,
  onBack,
  onNext,
}) => {
  const [hasGuarantor, setHasGuarantor] = useState(Boolean(guarantor));
  const [hasCollateral, setHasCollateral] = useState(Boolean(collateral && collateral.type !== 'None'));

  const handleGuarantorChange = (field: keyof GuarantorDto, value: unknown) => {
    setGuarantor((prev) => ({
      firstNameTh: '',
      lastNameTh: '',
      nationalId: '',
      ...prev,
      [field]: value,
    }));
  };

  const handleCollateralChange = (field: keyof CollateralDto, value: unknown) => {
    setCollateral((prev) => ({
      type: 'None',
      ...prev,
      [field]: value,
    }));
  };

  const guarantorIdValidation = guarantor?.nationalId
    ? validateThaiNationalId(guarantor.nationalId)
    : { isValid: false, message: '' };

  const isGuarantorValid =
    !hasGuarantor ||
    ((guarantor?.firstNameTh || '').trim() !== '' &&
      (guarantor?.lastNameTh || '').trim() !== '' &&
      guarantorIdValidation.isValid);

  const isFormValid = requestedCreditLimit > 0 && isGuarantorValid;

  return (
    <div className="space-y-5">
      {/* 1. Credit Limit & Payment Terms */}
      <div className="deves-card p-5 space-y-4">
        <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
          <CreditCard className="w-4 h-4" />
          <h4 className="text-xs font-bold text-[#212529]">
            วงเงินสินเชื่อที่ขอและเทอมการชำระเบี้ย (Credit Request & Payment Terms)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Credit Limit */}
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              วงเงินสินเชื่อที่ต้องการขอ (บาท) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="50000"
              min="0"
              value={requestedCreditLimit || ''}
              onChange={(e) => setRequestedCreditLimit(parseFloat(e.target.value) || 0)}
              placeholder="เช่น 500000"
              className="deves-input font-mono font-semibold text-[#012169]"
            />
            {requestedCreditLimit > 500000 && (
              <p className="text-[11px] text-amber-700 mt-1.5 flex items-center font-medium">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500 flex-shrink-0" />
                วงเงินเกิน 500,000 บาท แนะนำให้แนบผู้ค้ำประกัน
              </p>
            )}
          </div>

          {/* Motor Term */}
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              เทอมชำระเบี้ยประกันภัยรถยนต์ (Motor) <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentTermMotor}
              onChange={(e) => setPaymentTermMotor(parseInt(e.target.value) as 15 | 30 | 31)}
              className="deves-input"
            >
              <option value={15}>15 วัน (Motor 15 Days)</option>
              <option value={30}>30 วัน (Motor 30 Days - มาตรฐาน)</option>
              <option value={31}>31 วัน (Motor 31 Days)</option>
            </select>
          </div>

          {/* Non-Motor Term */}
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              เทอมชำระเบี้ยประกันภัยทั่วไป (Non-Motor) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="45"
              value={paymentTermNonMotor}
              onChange={(e) => setPaymentTermNonMotor(parseInt(e.target.value) || 45)}
              className="deves-input font-mono"
            />
            <p className="text-[11px] text-[#6C757D] mt-1.5">เกณฑ์ คปภ. กำหนดสูงสุดไม่เกิน 45 วัน</p>
          </div>
        </div>
      </div>

      {/* 2. Guarantor Section */}
      <div className="deves-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DEE2E6]">
          <div className="flex items-center space-x-2 text-[#012169]">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[#212529]">ข้อมูลผู้ค้ำประกัน (Guarantor)</h4>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-[#212529]">
            <input
              type="checkbox"
              checked={hasGuarantor}
              onChange={(e) => {
                setHasGuarantor(e.target.checked);
                if (!e.target.checked) setGuarantor(undefined);
                else {
                  setGuarantor({
                    titleTh: 'นาย',
                    firstNameTh: '',
                    lastNameTh: '',
                    nationalId: '',
                    relationship: 'บิดา/มารดา',
                  });
                }
              }}
              className="rounded border-[#DEE2E6] text-[#012169] focus:ring-[#012169] h-4 w-4"
            />
            <span>มีผู้ค้ำประกันสัญญา</span>
          </label>
        </div>

        {hasGuarantor && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">คำนำหน้าชื่อ</label>
                <select
                  value={guarantor?.titleTh || 'นาย'}
                  onChange={(e) => handleGuarantorChange('titleTh', e.target.value)}
                  className="deves-input"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  ชื่อผู้ค้ำประกัน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guarantor?.firstNameTh || ''}
                  onChange={(e) => handleGuarantorChange('firstNameTh', e.target.value)}
                  placeholder="เช่น สมพร"
                  className="deves-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guarantor?.lastNameTh || ''}
                  onChange={(e) => handleGuarantorChange('lastNameTh', e.target.value)}
                  placeholder="เช่น ยิ่งเจริญ"
                  className="deves-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">ความสัมพันธ์</label>
                <select
                  value={guarantor?.relationship || 'บิดา/มารดา'}
                  onChange={(e) => handleGuarantorChange('relationship', e.target.value)}
                  className="deves-input"
                >
                  <option value="บิดา/มารดา">บิดา/มารดา</option>
                  <option value="คู่สมรส">คู่สมรส</option>
                  <option value="พี่น้อง">พี่น้อง</option>
                  <option value="กรรมการบริษัท">กรรมการบริษัท</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  เลขประจำตัวประชาชนผู้ค้ำประกัน 13 หลัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={13}
                  value={guarantor?.nationalId || ''}
                  onChange={(e) =>
                    handleGuarantorChange('nationalId', e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="1100400056789"
                  className="deves-input font-mono"
                />
                {guarantor?.nationalId && !guarantorIdValidation.isValid && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {guarantorIdValidation.message}
                  </p>
                )}
                {guarantor?.nationalId && guarantorIdValidation.isValid && (
                  <p className="text-[11px] text-green-700 mt-1 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                    Modulo 11 ผู้ค้ำประกันถูกต้อง
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">เบอร์โทรศัพท์ผู้ค้ำประกัน</label>
                <input
                  type="tel"
                  value={guarantor?.contactPhone || ''}
                  onChange={(e) => handleGuarantorChange('contactPhone', e.target.value)}
                  placeholder="0899999999"
                  className="deves-input font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Collateral Section */}
      <div className="deves-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DEE2E6]">
          <div className="flex items-center space-x-2 text-[#012169]">
            <Landmark className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[#212529]">ข้อมูลหลักทรัพย์ค้ำประกัน (Collateral)</h4>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-[#212529]">
            <input
              type="checkbox"
              checked={hasCollateral}
              onChange={(e) => {
                setHasCollateral(e.target.checked);
                if (!e.target.checked) setCollateral(undefined);
                else {
                  setCollateral({
                    type: 'BankGuarantee',
                    documentRefNumber: '',
                    appraisedValue: 500000,
                  });
                }
              }}
              className="rounded border-[#DEE2E6] text-[#012169] focus:ring-[#012169] h-4 w-4"
            />
            <span>มีหลักทรัพย์ค้ำประกัน</span>
          </label>
        </div>

        {hasCollateral && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#212529] mb-1">ประเภทหลักทรัพย์</label>
              <select
                value={collateral?.type || 'BankGuarantee'}
                onChange={(e) => handleCollateralChange('type', e.target.value as CollateralType)}
                className="deves-input"
              >
                <option value="BankGuarantee">หนังสือค้ำประกันธนาคาร (Bank Guarantee)</option>
                <option value="LandTitleDeed">โฉนดที่ดิน (Land Title Deed)</option>
                <option value="CashDeposit">เงินสดฝากค้ำประกัน (Cash Deposit)</option>
                <option value="GovernmentBond">พันธบัตรรัฐบาล (Government Bond)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#212529] mb-1">เลขที่เอกสารอ้างอิง</label>
              <input
                type="text"
                value={collateral?.documentRefNumber || ''}
                onChange={(e) => handleCollateralChange('documentRefNumber', e.target.value)}
                placeholder="เช่น BG-2026-99881"
                className="deves-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#212529] mb-1">มูลค่าประเมิน (บาท)</label>
              <input
                type="number"
                step="50000"
                value={collateral?.appraisedValue || 0}
                onChange={(e) =>
                  handleCollateralChange('appraisedValue', parseFloat(e.target.value) || 0)
                }
                placeholder="เช่น 500000"
                className="deves-input font-mono font-semibold"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline flex items-center space-x-1.5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="btn-primary flex items-center space-x-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>ถัดไป: อัปโหลดเอกสารแนบ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
