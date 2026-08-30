'use client';

import React, { useState } from 'react';
import { AgentType, AgentProfileDto } from '../../types/domain';
import { validateThaiNationalId } from '../../services/fileValidation';
import { CheckCircle2, AlertCircle, User, Building } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Agent Type Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          ประเภทตัวแทน / นายหน้า (Applicant Type) <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setAgentType('Individual')}
            className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left ${
              agentType === 'Individual'
                ? 'bg-sky-950/40 border-sky-500 text-sky-100 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">บุคคลธรรมดา (Individual Agent)</div>
              <div className="text-xs opacity-75">ตัวแทนประกันภัยรายบุคคล</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAgentType('Corporate')}
            className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left ${
              agentType === 'Corporate'
                ? 'bg-sky-950/40 border-sky-500 text-sky-100 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">นิติบุคคล (Corporate Broker)</div>
              <div className="text-xs opacity-75">บริษัทนายหน้าประกันวินาศภัย</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h4 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
          ข้อมูลพื้นฐานและเลขประจำตัวผู้เสียภาษี / บัตรประชาชน
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              คำนำหน้าชื่อ <span className="text-rose-400">*</span>
            </label>
            <select
              value={profile.titleTh || 'นาย'}
              onChange={(e) => handleChange('titleTh', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {agentType === 'Individual' ? 'ชื่อ (ภาษาไทย)' : 'ชื่อนิติบุคคล'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={profile.firstNameTh}
              onChange={(e) => handleChange('firstNameTh', e.target.value)}
              placeholder={agentType === 'Individual' ? 'เช่น สมชาย' : 'เช่น สยามอินชัวร์ โบรกเกอร์'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {agentType === 'Individual' ? 'นามสกุล (ภาษาไทย)' : 'สาขา/สำนักงาน'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={profile.lastNameTh}
              onChange={(e) => handleChange('lastNameTh', e.target.value)}
              placeholder={agentType === 'Individual' ? 'เช่น ใจดี' : 'เช่น สำนักงานใหญ่'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* 13-Digit National ID with Real-Time Modulo 11 Validation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {agentType === 'Individual' ? 'เลขประจำตัวประชาชน 13 หลัก' : 'เลขทะเบียนนิติบุคคล / Tax ID 13 หลัก'} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={13}
                value={profile.nationalIdOrTaxId}
                onChange={(e) => {
                  setTouchedId(true);
                  handleChange('nationalIdOrTaxId', e.target.value.replace(/\D/g, ''));
                }}
                placeholder="ระบุตัวเลข 13 หลัก"
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                  touchedId
                    ? idValidation.isValid || (agentType === 'Corporate' && profile.nationalIdOrTaxId.length === 13)
                      ? 'border-emerald-500 focus:border-emerald-400 ring-1 ring-emerald-500/20'
                      : 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/20'
                    : 'border-slate-700 focus:border-sky-500'
                }`}
              />
              {touchedId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {idValidation.isValid || (agentType === 'Corporate' && profile.nationalIdOrTaxId.length === 13) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              )}
            </div>

            {/* Validation Feedback Message */}
            {touchedId && (
              <p
                className={`text-[11px] mt-1 flex items-center ${
                  idValidation.isValid || (agentType === 'Corporate' && profile.nationalIdOrTaxId.length === 13)
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {agentType === 'Individual'
                  ? idValidation.message
                  : profile.nationalIdOrTaxId.length === 13
                  ? 'เลขทะเบียนนิติบุคคล 13 หลักถูกต้อง'
                  : `กรอกแล้ว ${profile.nationalIdOrTaxId.length}/13 หลัก`}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              เบอร์โทรศัพท์ติดต่อ <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={profile.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="เช่น 0812345678"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Address & Bank Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ที่อยู่ตามทะเบียนบ้าน / สำนักงาน
            </label>
            <textarea
              rows={2}
              value={profile.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ธนาคารสำหรับรับค่าคอมมิชชั่น
              </label>
              <input
                type="text"
                value={profile.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="เช่น ธนาคารกสิกรไทย"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เลขที่บัญชีธนาคาร
              </label>
              <input
                type="text"
                value={profile.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                placeholder="เช่น 0452345678"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 transition-all"
        >
          ถัดไป: ผู้ค้ำประกันและสินเชื่อ →
        </button>
      </div>
    </div>
  );
};
