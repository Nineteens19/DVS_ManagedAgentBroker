'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { apiClient } from '../../../services/apiClient';
import { AgentType, AgentProfileDto, GuarantorDto, CollateralDto, AttachmentDto } from '../../../types/domain';
import { WizardStepper } from '../../../components/wizard/WizardStepper';
import { Step1ApplicantProfile } from '../../../components/wizard/Step1ApplicantProfile';
import { Step2GuarantorCollateral } from '../../../components/wizard/Step2GuarantorCollateral';
import { Step3DocumentUpload } from '../../../components/wizard/Step3DocumentUpload';
import { Step4ReviewSubmit } from '../../../components/wizard/Step4ReviewSubmit';
import { FilePlus } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'agent_broker_intake_draft';

export default function NewApplicationIntakePage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [agentType, setAgentType] = useState<AgentType>('Individual');
  const [profile, setProfile] = useState<AgentProfileDto>({
    titleTh: 'นาย',
    firstNameTh: '',
    lastNameTh: '',
    nationalIdOrTaxId: '',
    phoneNumber: '',
    email: '',
    address: '',
    bankName: 'ธนาคารกสิกรไทย',
    bankAccountNumber: '',
  });
  const [guarantor, setGuarantor] = useState<GuarantorDto | undefined>(undefined);
  const [collateral, setCollateral] = useState<CollateralDto | undefined>(undefined);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [requestedCreditLimit, setRequestedCreditLimit] = useState<number>(500000);
  const [paymentTermMotor, setPaymentTermMotor] = useState<15 | 30 | 31>(30);
  const [paymentTermNonMotor, setPaymentTermNonMotor] = useState<number>(45);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Restore draft from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.agentType) setAgentType(parsed.agentType);
        if (parsed.guarantor) setGuarantor(parsed.guarantor);
        if (parsed.collateral) setCollateral(parsed.collateral);
        if (parsed.requestedCreditLimit) setRequestedCreditLimit(parsed.requestedCreditLimit);
      }
    } catch {
      // ignore
    }
  }, []);

  // Autosave to localStorage debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            agentType,
            profile,
            guarantor,
            collateral,
            requestedCreditLimit,
            paymentTermMotor,
            paymentTermNonMotor,
          })
        );
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [agentType, profile, guarantor, collateral, requestedCreditLimit, paymentTermMotor, paymentTermNonMotor]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const saved = await apiClient.saveDraft({
        agentType,
        branchCode: currentUser.branchCode,
        branchName: currentUser.branchName,
        profile,
        guarantor,
        collateral,
        attachments,
        requestedCreditLimit,
        paymentTermMotorDays: paymentTermMotor,
        paymentTermNonMotorDays: paymentTermNonMotor,
      });

      showToast({
        type: 'success',
        title: 'บันทึกแบบร่างสำเร็จ',
        message: `บันทึกข้อมูลแบบร่างเลขที่ ${saved.applicationNumber} เรียบร้อยแล้ว`,
      });
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      router.push('/');
    } catch (err) {
      showToast({
        type: 'error',
        title: 'บันทึกแบบร่างไม่สำเร็จ',
        message: String(err),
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save draft first
      const draft = await apiClient.saveDraft({
        agentType,
        branchCode: currentUser.branchCode,
        branchName: currentUser.branchName,
        profile,
        guarantor,
        collateral,
        attachments,
        requestedCreditLimit,
        paymentTermMotorDays: paymentTermMotor,
        paymentTermNonMotorDays: paymentTermNonMotor,
      });

      // 2. Submit application
      const submitted = await apiClient.submitApplication(draft.id);

      showToast({
        type: 'success',
        title: 'ยื่นใบสมัครสำเร็จ (Submitted)',
        message: `ยื่นใบสมัครเลขที่ ${submitted.applicationNumber} ส่งต่อไปยังสำนักงานใหญ่เรียบร้อยแล้ว`,
      });
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      router.push('/');
    } catch (err) {
      showToast({
        type: 'error',
        title: 'การยื่นใบสมัครล้มเหลว',
        message: String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Bar */}
      <div className="flex items-center space-x-3 p-4 rounded-2xl glass-panel">
        <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
          <FilePlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">ยื่นใบสมัครตัวแทน / โบรกเกอร์ใหม่ (Application Intake Wizard)</h2>
          <p className="text-xs text-slate-400">
            ระบบตรวจสอบ Modulo 11 เลขบัตร ปชช. และ Magic Byte ลายเซ็นไฟล์เอกสารแบบ Real-time
          </p>
        </div>
      </div>

      {/* 4-Step Stepper */}
      <WizardStepper currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* Step Content Card */}
      <div className="p-6 rounded-3xl glass-panel shadow-2xl">
        {currentStep === 1 && (
          <Step1ApplicantProfile
            agentType={agentType}
            setAgentType={setAgentType}
            profile={profile}
            setProfile={setProfile}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2GuarantorCollateral
            guarantor={guarantor}
            setGuarantor={setGuarantor}
            collateral={collateral}
            setCollateral={setCollateral}
            requestedCreditLimit={requestedCreditLimit}
            setRequestedCreditLimit={setRequestedCreditLimit}
            paymentTermMotor={paymentTermMotor}
            setPaymentTermMotor={setPaymentTermMotor}
            paymentTermNonMotor={paymentTermNonMotor}
            setPaymentTermNonMotor={setPaymentTermNonMotor}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3DocumentUpload
            agentType={agentType}
            hasGuarantor={Boolean(guarantor)}
            hasCollateral={Boolean(collateral && collateral.type !== 'None')}
            attachments={attachments}
            setAttachments={setAttachments}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <Step4ReviewSubmit
            agentType={agentType}
            profile={profile}
            guarantor={guarantor}
            collateral={collateral}
            attachments={attachments}
            requestedCreditLimit={requestedCreditLimit}
            paymentTermMotor={paymentTermMotor}
            paymentTermNonMotor={paymentTermNonMotor}
            branchName={currentUser.branchName}
            onBack={() => setCurrentStep(3)}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
          />
        )}
      </div>
    </div>
  );
}
