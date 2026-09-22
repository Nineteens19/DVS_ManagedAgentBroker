'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { apiClient } from '../../../services/apiClient';
import { AgentType, AgentProfileDto, GuarantorDto, CollateralDto, AttachmentDto } from '../../../types/domain';
import { WizardStepper } from '../../../components/wizard/WizardStepper';
import { Step1ApplicantProfile } from '../../../components/wizard/Step1ApplicantProfile';
import { Step2GuarantorCollateral } from '../../../components/wizard/Step2GuarantorCollateral';
import { Step3DocumentUpload } from '../../../components/wizard/Step3DocumentUpload';
import { Step4ReviewSubmit } from '../../../components/wizard/Step4ReviewSubmit';
import { FilePlus, Edit3 } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'agent_broker_intake_draft';

function IntakeWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('appId');

  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [existingAppId, setExistingAppId] = useState<string | null>(editId);
  const [existingAppNumber, setExistingAppNumber] = useState<string | null>(null);

  const stepParam = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState<number>(stepParam ? parseInt(stepParam, 10) : 1);

  useEffect(() => {
    if (stepParam) {
      const parsed = parseInt(stepParam, 10);
      if (parsed >= 1 && parsed <= 4) setCurrentStep(parsed);
    }
  }, [stepParam]);
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

  // 1. If editId is present, load existing application from API/Mock engine
  useEffect(() => {
    if (editId) {
      apiClient.getApplicationById(editId).then((app) => {
        if (app) {
          setExistingAppId(app.id);
          setExistingAppNumber(app.applicationNumber);
          setAgentType(app.agentType);
          if (app.profile) setProfile(app.profile);
          if (app.guarantor) setGuarantor(app.guarantor);
          if (app.collateral) setCollateral(app.collateral);
          if (app.attachments) setAttachments(app.attachments);
          if (app.requestedCreditLimit) setRequestedCreditLimit(app.requestedCreditLimit);
          if (app.paymentTermMotorDays) {
            setPaymentTermMotor(app.paymentTermMotorDays as 15 | 30 | 31);
          }
          if (app.paymentTermNonMotorDays) {
            setPaymentTermNonMotor(app.paymentTermNonMotorDays);
          }
        }
      });
    } else {
      // 2. Otherwise restore draft from localStorage if available
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
    }
  }, [editId]);

  // Autosave to localStorage debounced (only for new unsaved drafts)
  useEffect(() => {
    if (existingAppId) return; // don't overwrite generic local draft if editing an existing ID
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
  }, [agentType, profile, guarantor, collateral, requestedCreditLimit, paymentTermMotor, paymentTermNonMotor, existingAppId]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const saved = await apiClient.saveDraft({
        id: existingAppId || undefined,
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

      setExistingAppId(saved.id);
      setExistingAppNumber(saved.applicationNumber);

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
      // 1. Save draft first to get/update the entity
      const draft = await apiClient.saveDraft({
        id: existingAppId || undefined,
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
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* 1. Title Banner */}
      <div className="deves-card p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#012169]/10 text-[#012169] flex-shrink-0">
            {existingAppNumber ? <Edit3 className="w-6 h-6" /> : <FilePlus className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#212529]">
              {existingAppNumber
                ? `แก้ไขและดำเนินการยื่นต่อ: ${existingAppNumber}`
                : 'ยื่นใบสมัครตัวแทน / โบรกเกอร์ใหม่ (Application Intake Wizard)'}
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              สาขา: <span className="font-semibold text-[#012169]">{currentUser.branchName}</span> | ตรวจสอบ Modulo 11 บัตร ปชช. และ Magic Byte ลายเซ็นไฟล์เอกสารแบบ Real-time
            </p>
          </div>
        </div>

        {existingAppNumber && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA] flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#856404]"></span>
            <span>กำลังแก้ไขแบบร่าง</span>
          </div>
        )}
      </div>

      {/* 2. Symmetrical 4-Step Stepper */}
      <WizardStepper currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* 3. Step Content */}
      <div className="pt-1">
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

export default function NewApplicationIntakePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">กำลังโหลดข้อมูลใบสมัคร...</div>}>
      <IntakeWizardContent />
    </Suspense>
  );
}
