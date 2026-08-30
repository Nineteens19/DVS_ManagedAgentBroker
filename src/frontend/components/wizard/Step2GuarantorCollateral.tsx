'use client';

import React, { useState } from 'react';
import { GuarantorDto, CollateralDto, CollateralType } from '../../types/domain';
import { validateThaiNationalId } from '../../services/fileValidation';
import { ShieldCheck, Landmark, CreditCard, AlertTriangle } from 'lucide-react';

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
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center space-x-2 text-sky-400 pb-2 border-b border-slate-800">
          <CreditCard className="w-5 h-5" />
          <h4 className="text-sm font-bold text-slate-200">
            วงเงินสินเชื่อที่ขอและเทอมการชำระเบี้ย (Credit Request & Terms)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              วงเงินสินเชื่อที่ต้องการขอ (บาท) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="50000"
              min="0"
              value={requestedCreditLimit || ''}
              onChange={(e) => setRequestedCreditLimit(parseFloat(e.target.value) || 0)}
              placeholder="เช่น 500000"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {requestedCreditLimit > 500000 && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                วงเงินเกิน 500,000 บาท แนะนำให้แนบผู้ค้ำประกันหรือหลักทรัพย์
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              เทอมการชำระเบี้ยประกันภัยรถยนต์ (Motor) <span className="text-rose-400">*</span>
            </label>
            <select
              value={paymentTermMotor}
              onChange={(e) => setPaymentTermMotor(parseInt(e.target.value, 10) as 15 | 30 | 31)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value={15}>15 วัน (Motor 15 Days)</option>
              <option value={30}>30 วัน (Motor 30 Days)</option>
              <option value={31}>31 วัน (Motor 31 Days)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              เทอมการชำระเบี้ยประกันภัยทั่วไป (Non-Motor) <span className="text-rose-400">*</span>
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
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">ตามเกณฑ์ คปภ. สูงสุดไม่เกิน 45 วัน</p>
          </div>
        </div>
      </div>

      {/* 2. Guarantor Information */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-sm font-bold text-slate-200">ข้อมูลผู้ค้ำประกัน (Guarantor)</h4>
          </div>
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasGuarantor}
              onChange={(e) => {
                setHasGuarantor(e.target.checked);
                if (!e.target.checked) setGuarantor(undefined);
              }}
              className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950"
            />
            <span>มีผู้ค้ำประกันสัญญา</span>
          </label>
        </div>

        {hasGuarantor && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                คำนำหน้าชื่อ
              </label>
              <select
                value={guarantor?.titleTh || 'นาย'}
                onChange={(e) => handleGuarantorChange('titleTh', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ชื่อผู้ค้ำประกัน <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={guarantor?.firstNameTh || ''}
                onChange={(e) => handleGuarantorChange('firstNameTh', e.target.value)}
                placeholder="เช่น สมศรี"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                นามสกุล <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={guarantor?.lastNameTh || ''}
                onChange={(e) => handleGuarantorChange('lastNameTh', e.target.value)}
                placeholder="เช่น ใจดีมั่นคง"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เลขประจำตัวประชาชนผู้ค้ำ 13 หลัก <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={13}
                value={guarantor?.nationalId || ''}
                onChange={(e) => handleGuarantorChange('nationalId', e.target.value.replace(/\D/g, ''))}
                placeholder="ระบุ 13 หลัก"
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 focus:outline-none ${
                  guarantor?.nationalId && !guarantorIdValidation.isValid
                    ? 'border-rose-500'
                    : 'border-slate-700 focus:border-sky-500'
                }`}
              />
              {guarantor?.nationalId && (
                <p className={`text-[10px] mt-1 ${guarantorIdValidation.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {guarantorIdValidation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ความสัมพันธ์กับผู้สมัคร
              </label>
              <input
                type="text"
                value={guarantor?.relationship || ''}
                onChange={(e) => handleGuarantorChange('relationship', e.target.value)}
                placeholder="เช่น คู่สมรส, บิดา, มารดา"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                รายได้ต่อเดือน (บาท)
              </label>
              <input
                type="number"
                value={guarantor?.monthlySalary || ''}
                onChange={(e) => handleGuarantorChange('monthlySalary', parseFloat(e.target.value) || 0)}
                placeholder="เช่น 50000"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Collateral Information */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400">
            <Landmark className="w-5 h-5" />
            <h4 className="text-sm font-bold text-slate-200">ข้อมูลหลักทรัพย์ค้ำประกัน (Collateral)</h4>
          </div>
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasCollateral}
              onChange={(e) => {
                setHasCollateral(e.target.checked);
                if (!e.target.checked) setCollateral(undefined);
                else setCollateral({ type: 'LandTitleDeed', appraisedValue: 0 });
              }}
              className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950"
            />
            <span>มีหลักทรัพย์ค้ำประกัน</span>
          </label>
        </div>

        {hasCollateral && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ประเภทหลักทรัพย์
              </label>
              <select
                value={collateral?.type || 'LandTitleDeed'}
                onChange={(e) => handleCollateralChange('type', e.target.value as CollateralType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="LandTitleDeed">โฉนดที่ดิน (Land Title Deed)</option>
                <option value="BankGuarantee">หนังสือค้ำประกันธนาคาร (Bank Guarantee)</option>
                <option value="CashDeposit">เงินสดค้ำประกัน (Cash Deposit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เลขที่เอกสารสิทธิ์ / สัญญาค้ำ
              </label>
              <input
                type="text"
                value={collateral?.documentRefNumber || ''}
                onChange={(e) => handleCollateralChange('documentRefNumber', e.target.value)}
                placeholder="เช่น โฉนดที่ดิน 12345"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                มูลค่าประเมิน (บาท)
              </label>
              <input
                type="number"
                value={collateral?.appraisedValue || ''}
                onChange={(e) => handleCollateralChange('appraisedValue', parseFloat(e.target.value) || 0)}
                placeholder="เช่น 1000000"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}
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
          disabled={!isFormValid}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 transition-all"
        >
          ถัดไป: อัปโหลดเอกสารแนบ →
        </button>
      </div>
    </div>
  );
};
