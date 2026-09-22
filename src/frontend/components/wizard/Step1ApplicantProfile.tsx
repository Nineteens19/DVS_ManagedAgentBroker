'use client';

import React, { useState } from 'react';
import { AgentType, AgentProfileDto } from '../../types/domain';
import { validateThaiNationalId } from '../../services/fileValidation';
import { CheckCircle2, AlertCircle, User, Building, ArrowRight, CreditCard } from 'lucide-react';

interface Step1ApplicantProfileProps {
  agentType: AgentType;
  setAgentType: (type: AgentType) => void;
  profile: AgentProfileDto;
  setProfile: React.Dispatch<React.SetStateAction<AgentProfileDto>>;
  onNext: () => void;
}

export const Step1ApplicantProfile: React.FC<Step1ApplicantProfileProps> = ({
  agentType,
  setAgentType,
  profile,
  setProfile,
  onNext,
}) => {
  const [touchedId, setTouchedId] = useState(false);

  const idValidation = validateThaiNationalId(profile.nationalIdOrTaxId);

  const handleChange = (field: keyof AgentProfileDto, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    profile.firstNameTh.trim() !== '' &&
    profile.lastNameTh.trim() !== '' &&
    (agentType === 'Corporate' ? profile.nationalIdOrTaxId.length === 13 : idValidation.isValid) &&
    (profile.phoneNumber || '').trim() !== '';

  return (
    <div className="space-y-5">
      {/* 1. Agent Type Selector */}
      <div className="deves-card p-5 space-y-3">
        <label className="block text-xs font-bold text-[#012169] uppercase tracking-wider">
          ประเภทผู้สมัคร (Applicant Type) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setAgentType('Individual')}
            className={`flex items-center space-x-3.5 p-4 rounded-xl border transition-all text-left ${
              agentType === 'Individual'
                ? 'bg-[#012169]/5 border-[#012169] shadow-sm ring-2 ring-[#012169]/20'
                : 'bg-white border-[#DEE2E6] text-[#212529] hover:border-gray-400'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg ${
                agentType === 'Individual' ? 'bg-[#012169] text-[#FFCD00]' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#212529]">บุคคลธรรมดา (Individual Agent)</div>
              <div className="text-xs text-[#6C757D]">ตัวแทนประกันวินาศภัยรายบุคคล</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAgentType('Corporate')}
            className={`flex items-center space-x-3.5 p-4 rounded-xl border transition-all text-left ${
              agentType === 'Corporate'
                ? 'bg-[#012169]/5 border-[#012169] shadow-sm ring-2 ring-[#012169]/20'
                : 'bg-white border-[#DEE2E6] text-[#212529] hover:border-gray-400'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg ${
                agentType === 'Corporate' ? 'bg-[#012169] text-[#FFCD00]' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#212529]">นิติบุคคล (Corporate Broker)</div>
              <div className="text-xs text-[#6C757D]">บริษัทนายหน้าประกันวินาศภัย / นิติบุคคล</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Main Profile Grid */}
      <div className="deves-card p-5 space-y-4">
        <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
          <User className="w-4 h-4" />
          <h4 className="text-xs font-bold text-[#212529]">
            ข้อมูลพื้นฐานและเลขประจำตัวผู้เสียภาษี / บัตรประชาชน (ตรวจสอบความถูกต้อง 13 หลัก)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              คำนำหน้าชื่อ <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.titleTh || 'นาย'}
              onChange={(e) => handleChange('titleTh', e.target.value)}
              className="deves-input"
            >
              {agentType === 'Individual' ? (
                <>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </>
              ) : (
                <>
                  <option value="บจก.">บจก. (บริษัทจำกัด)</option>
                  <option value="บมจ.">บมจ. (บริษัทมหาชนจำกัด)</option>
                  <option value="หจก.">หจก. (ห้างหุ้นส่วนจำกัด)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              {agentType === 'Individual' ? 'ชื่อ (ภาษาไทย)' : 'ชื่อนิติบุคคล'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.firstNameTh}
              onChange={(e) => handleChange('firstNameTh', e.target.value)}
              placeholder={agentType === 'Individual' ? 'เช่น สมชาย' : 'เช่น สยามอินชัวร์ โบรกเกอร์'}
              className="deves-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              {agentType === 'Individual' ? 'นามสกุล (ภาษาไทย)' : 'สาขา/สำนักงาน'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.lastNameTh}
              onChange={(e) => handleChange('lastNameTh', e.target.value)}
              placeholder={agentType === 'Individual' ? 'เช่น ใจดี' : 'เช่น สำนักงานใหญ่'}
              className="deves-input"
            />
          </div>
        </div>

        {/* Thai ID / Tax ID with Modulo 11 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              {agentType === 'Individual' ? 'เลขประจำตัวประชาชน 13 หลัก' : 'เลขทะเบียนนิติบุคคล 13 หลัก'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={13}
                value={profile.nationalIdOrTaxId}
                onBlur={() => setTouchedId(true)}
                onChange={(e) => handleChange('nationalIdOrTaxId', e.target.value.replace(/\D/g, ''))}
                placeholder="1100400012345"
                className={`deves-input font-mono pr-9 ${
                  touchedId && profile.nationalIdOrTaxId.length > 0
                    ? idValidation.isValid
                      ? 'border-green-500 focus:border-green-600 focus:ring-green-100'
                      : 'border-red-500 focus:border-red-600 focus:ring-red-100'
                    : ''
                }`}
              />
              {touchedId && profile.nationalIdOrTaxId.length === 13 && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {idValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              )}
            </div>
            {touchedId && profile.nationalIdOrTaxId.length > 0 && !idValidation.isValid && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center font-medium">
                <AlertCircle className="w-3 h-3 mr-1 inline flex-shrink-0" />
                {idValidation.message}
              </p>
            )}
            {idValidation.isValid && (
              <p className="text-[11px] text-green-700 mt-1 flex items-center font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1 inline flex-shrink-0" />
                ตรวจสอบหลัก Modulo 11 ถูกต้อง
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">
              เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={profile.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="0812345678"
              className="deves-input font-mono"
            />
          </div>
        </div>

        {/* Email & Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">อีเมล (Email)</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="somchai@example.com"
              className="deves-input font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">ที่อยู่ตามทะเบียนบ้าน/ที่ทำการ</label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด..."
              className="deves-input"
            />
          </div>
        </div>
      </div>

      {/* 3. Bank Account Information */}
      <div className="deves-card p-5 space-y-4">
        <div className="flex items-center space-x-2 text-[#012169] pb-2 border-b border-[#DEE2E6]">
          <CreditCard className="w-4 h-4" />
          <h4 className="text-xs font-bold text-[#212529]">ข้อมูลบัญชีธนาคารสำหรับรับผลประโยชน์</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">ธนาคาร</label>
            <select
              value={profile.bankName || 'ธนาคารกสิกรไทย'}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className="deves-input"
            >
              <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย (KBANK)</option>
              <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</option>
              <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ (BBL)</option>
              <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย (KTB)</option>
              <option value="ธนาคารกรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา (BAY)</option>
              <option value="ธนาคารทหารไทยธนชาต">ธนาคารทหารไทยธนชาต (TTB)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#212529] mb-1">เลขที่บัญชีธนาคาร</label>
            <input
              type="text"
              value={profile.bankAccountNumber || ''}
              onChange={(e) => handleChange('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="012-3-45678-9"
              className="deves-input font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. Action Navigation */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="btn-primary flex items-center space-x-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>ถัดไป: ผู้ค้ำประกันและสินเชื่อ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
