import React from 'react';
import { User, ShieldCheck, UploadCloud, CheckCircle } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { number: 1, label: '1. ข้อมูลผู้สมัคร', desc: 'Applicant Profile', icon: <User className="w-4 h-4" /> },
    { number: 2, label: '2. ผู้ค้ำ & สินเชื่อ', desc: 'Guarantor & Terms', icon: <ShieldCheck className="w-4 h-4" /> },
    { number: 3, label: '3. อัปโหลดเอกสาร', desc: 'Magic Byte Upload', icon: <UploadCloud className="w-4 h-4" /> },
    { number: 4, label: '4. ตรวจสอบ & ยื่น', desc: 'Review & Submit', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-[#DEE2E6] p-4 shadow-sm">
      <div className="flex items-start max-w-2xl mx-auto">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step Item */}
              <div
                onClick={() => onStepClick && isCompleted && onStepClick(step.number)}
                className={`flex flex-col items-center flex-1 ${
                  isCompleted ? 'cursor-pointer' : ''
                }`}
              >
                {/* Circle Icon (w-10 h-10 -> 40px, center at 20px) */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#012169] text-[#FFCD00] ring-4 ring-[#012169]/15 shadow-md scale-105'
                      : isCompleted
                      ? 'bg-[#28A745] text-white shadow-xs'
                      : 'bg-[#F8F9FA] text-[#6C757D] border-2 border-[#DEE2E6]'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Step Labels */}
                <span
                  className={`mt-2 text-xs text-center leading-tight transition-colors ${
                    isActive
                      ? 'text-[#012169] font-bold'
                      : isCompleted
                      ? 'text-[#212529] font-semibold'
                      : 'text-[#6C757D]'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-[#6C757D] hidden sm:block mt-0.5">
                  {step.desc}
                </span>
              </div>

              {/* Symmetric Connector Bar */}
              {!isLast && (
                <div className="flex-1 self-start mt-5 px-1">
                  <div
                    className={`h-0.5 w-full rounded-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-[#012169]' : 'bg-[#DEE2E6]'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
