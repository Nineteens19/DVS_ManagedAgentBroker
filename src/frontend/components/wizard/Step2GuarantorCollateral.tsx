'use client';

import React, { useState } from 'react';
import { GuarantorDto, CollateralDto, CollateralType } from '../../types/domain';
import { validateThaiNationalId } from '../../services/fileValidation';
import { ShieldCheck, Landmark, CreditCard, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

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

  const isGuarantorValid = !hasGuarantor || (
    (guarantor?.firstNameTh || '').trim() !== '' &&
    (guarantor?.lastNameTh || '').trim() !== '' &&
    guarantorIdValidation.isValid
  );

  const isFormValid = requestedCreditLimit > 0 && isGuarantorValid;

  return (
    <div className="space-y-6">
      {/* 1. Credit Limit & Payment Terms */}
      <div className="deves-card p-6 space-y-4">
        <div className="flex items-center space-x-2 text-primary pb-2 border-b border-gray-200">
          <CreditCard className="w-5 h-5" />
          <h4 className="text-sm font-bold text-gray-900">
            วงเงินสินเชื่อที่ขอและเทอมการชำระเบี้ย (Credit Request & Payment Terms)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              วงเงินสินเชื่อที่ต้องการขอ (บาท) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="50000"
              min="0"
              value={requestedCreditLimit || ''}
              onChange={(e) => setRequestedCreditLimit(parseFloat(e.target.value) || 0)}
              placeholder="เช่น 500000"
              className="deves-input font-mono font-semibold text-primary"
            />
            {requestedCreditLimit > 500000 && (
              <p className="text-xs text-amber-700 mt-1.5 flex items-center font-medium">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500 flex-shrink-0" />
                วงเงินเกิน 500,000 บาท แนะนำให้แนบผู้ค้ำประกันหรือหลักทรัพย์
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              เทอมการชำระเบี้ยประกันภัยรถยนต์ (Motor) <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentTermMotor}
              onChange={(e) => setPaymentTermMotor(parseInt(e.target.value, 10) as 15 | 30 | 31)}
              className="deves-input"
            >
              <option value={15}>15 วัน (Motor 15 Days)</option>
              <option value={30}>30 วัน (Motor 30 Days)</option>
              <option value={31}>31 วัน (Motor 31 Days)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              เทอมการชำระเบี้ยประกันภัยทั่วไป (Non-Motor) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="45"
              value={paymentTermNonMotor}
              onChange={(e) => {
                const val = Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 45);
                setPaymentTermNonMotor(val);
              }}
              className="deves-input font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">เกณฑ์ คปภ. กำหนดสูงสุดไม่เกิน 45 วัน</p>
          </div>
        </div>
      </div>

      {/* 2. Guarantor Information */}
      <div className="deves-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-sm font-bold text-gray-900">ข้อมูลผู้ค้ำประกัน (Guarantor)</h4>
          </div>
          <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hasGuarantor}
              onChange={(e) => {
                setHasGuarantor(e.target.checked);
                if (!e.target.checked) setGuarantor(undefined);
              }}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            <span>มีผู้ค้ำประกันสัญญา</span>
          </label>
        </div>

        {hasGuarantor && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                คำนำหน้าชื่อ
              </label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่อผู้ค้ำประกัน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={guarantor?.firstNameTh || ''}
                onChange={(e) => handleGuarantorChange('firstNameTh', e.target.value)}
                placeholder="เช่น สมศรี"
                className="deves-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={guarantor?.lastNameTh || ''}
                onChange={(e) => handleGuarantorChange('lastNameTh', e.target.value)}
                placeholder="เช่น ใจดีมั่นคง"
                className="deves-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                เลขประจำตัวประชาชนผู้ค้ำ 13 หลัก <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={13}
                value={guarantor?.nationalId || ''}
                onChange={(e) => handleGuarantorChange('nationalId', e.target.value.replace(/\D/g, ''))}
                placeholder="ระบุ 13 หลัก"
                className={`deves-input font-mono ${
                  guarantor?.nationalId && !guarantorIdValidation.isValid
                    ? 'border-red-500'
                    : ''
                }`}
              />
              {guarantor?.nationalId && (
                <p className={`text-xs mt-1 font-medium ${guarantorIdValidation.isValid ? 'text-green-700' : 'text-red-600'}`}>
                  {guarantorIdValidation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ความสัมพันธ์กับผู้สมัคร
              </label>
              <input
                type="text"
                value={guarantor?.relationship || ''}
                onChange={(e) => handleGuarantorChange('relationship', e.target.value)}
                placeholder="เช่น คู่สมรส, บิดา, มารดา"
                className="deves-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                รายได้ต่อเดือน (บาท)
              </label>
              <input
                type="number"
                value={guarantor?.monthlySalary || ''}
                onChange={(e) => handleGuarantorChange('monthlySalary', parseFloat(e.target.value) || 0)}
                placeholder="เช่น 50000"
                className="deves-input font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Collateral Information */}
      <div className="deves-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-primary">
            <Landmark className="w-5 h-5" />
            <h4 className="text-sm font-bold text-gray-900">ข้อมูลหลักทรัพย์ค้ำประกัน (Collateral)</h4>
          </div>
          <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hasCollateral}
              onChange={(e) => {
                setHasCollateral(e.target.checked);
                if (!e.target.checked) setCollateral(undefined);
                else setCollateral({ type: 'LandTitleDeed', appraisedValue: 0 });
              }}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            <span>มีหลักทรัพย์ค้ำประกัน</span>
          </label>
        </div>

        {hasCollateral && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ประเภทหลักทรัพย์
              </label>
              <select
                value={collateral?.type || 'LandTitleDeed'}
                onChange={(e) => handleCollateralChange('type', e.target.value as CollateralType)}
                className="deves-input"
              >
                <option value="LandTitleDeed">โฉนดที่ดิน (Land Title Deed)</option>
                <option value="BankGuarantee">หนังสือค้ำประกันธนาคาร (Bank Guarantee)</option>
                <option value="CashDeposit">เงินสดค้ำประกัน (Cash Deposit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                เลขที่เอกสารสิทธิ์ / สัญญาค้ำ
              </label>
              <input
                type="text"
                value={collateral?.documentRefNumber || ''}
                onChange={(e) => handleCollateralChange('documentRefNumber', e.target.value)}
                placeholder="เช่น โฉนดที่ดิน 12345"
                className="deves-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                มูลค่าประเมิน (บาท)
              </label>
              <input
                type="number"
                value={collateral?.appraisedValue || ''}
                onChange={(e) => handleCollateralChange('appraisedValue', parseFloat(e.target.value) || 0)}
                placeholder="เช่น 1000000"
                className="deves-input font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:text-primary hover:bg-gray-100 border border-gray-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center space-x-2"
        >
          <span>ถัดไป: อัปโหลดเอกสารแนบ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
