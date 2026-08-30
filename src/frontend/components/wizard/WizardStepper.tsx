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
    <div className="w-full py-2 mb-6">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div
              key={step.number}
              onClick={() => onStepClick && isCompleted && onStepClick(step.number)}
              className={`relative z-10 flex flex-col items-center ${
                isCompleted ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isActive
                    ? 'bg-primary text-secondary ring-4 ring-primary/20 scale-110 shadow-md font-bold'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : isCompleted
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-gray-400 hidden sm:inline">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
