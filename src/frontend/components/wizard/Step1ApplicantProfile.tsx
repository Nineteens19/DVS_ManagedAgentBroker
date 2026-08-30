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
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          ประเภทผู้สมัคร (Applicant Type) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setAgentType('Individual')}
            className={`flex items-center space-x-3 p-4 rounded-xl border transition-all text-left ${
              agentType === 'Individual'
                ? 'bg-blue-50/70 border-primary shadow-sm ring-2 ring-primary/20'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${agentType === 'Individual' ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-600'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">บุคคลธรรมดา (Individual Agent)</div>
              <div className="text-xs text-gray-500">ตัวแทนประกันวินาศภัยรายบุคคล</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAgentType('Corporate')}
            className={`flex items-center space-x-3 p-4 rounded-xl border transition-all text-left ${
              agentType === 'Corporate'
                ? 'bg-blue-50/70 border-primary shadow-sm ring-2 ring-primary/20'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${agentType === 'Corporate' ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-600'}`}>
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">นิติบุคคล (Corporate Broker)</div>
              <div className="text-xs text-gray-500">บริษัทนายหน้าประกันวินาศภัย / นิติบุคคล</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="deves-card p-6 space-y-4">
        <h4 className="text-sm font-bold text-primary pb-2 border-b border-gray-200">
          ข้อมูลพื้นฐานและเลขประจำตัวผู้เสียภาษี / บัตรประชาชน (ตรวจสอบ Modulo 11)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
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

        {/* 13-Digit National ID with Real-Time Modulo 11 Validation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {agentType === 'Individual' ? 'เลขประจำตัวประชาชน 13 หลัก' : 'เลขทะเบียนนิติบุคคล / Tax ID 13 หลัก'} <span className="text-red-500">*</span>
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
                className={`deves-input font-mono ${
                  touchedId
                    ? idValidation.isValid || (agentType === 'Corporate' && profile.nationalIdOrTaxId.length === 13)
                      ? 'border-green-500 focus:border-green-600 ring-2 ring-green-100'
                      : 'border-red-500 focus:border-red-600 ring-2 ring-red-100'
                    : ''
                }`}
              />
              {touchedId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {idValidation.isValid || (agentType === 'Corporate' && profile.nationalIdOrTaxId.length === 13) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Validation Feedback Message */}
            {touchedId && (
              <p
                className={`text-xs mt-1.5 flex items-center font-medium ${
                  idValidation.isValid || (agentType === 'Corporate' && profile.nationalIdOrTaxId.length === 13)
                    ? 'text-green-700'
                    : 'text-red-600'
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="เช่น 0812345678"
              className="deves-input"
            />
          </div>
        </div>

        {/* Address & Bank Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ที่อยู่ตามทะเบียนบ้าน / สำนักงาน
            </label>
            <textarea
              rows={2}
              value={profile.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              className="deves-input"
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ธนาคารสำหรับรับค่าคอมมิชชั่น
              </label>
              <input
                type="text"
                value={profile.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="เช่น ธนาคารกสิกรไทย"
                className="deves-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                เลขที่บัญชีธนาคาร
              </label>
              <input
                type="text"
                value={profile.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                placeholder="เช่น 0452345678"
                className="deves-input font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center space-x-2"
        >
          <span>ถัดไป: ผู้ค้ำประกันและสินเชื่อ</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
