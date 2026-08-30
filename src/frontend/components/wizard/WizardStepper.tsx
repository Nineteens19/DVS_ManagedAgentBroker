import React from 'react';
import { User, ShieldCheck, UploadCloud, CheckCircle } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { number: 1, label: 'ข้อมูลผู้สมัคร (Profile)', icon: <User className="w-4 h-4" /> },
    { number: 2, label: 'ผู้ค้ำประกัน & สินเชื่อ (Guarantor)', icon: <ShieldCheck className="w-4 h-4" /> },
    { number: 3, label: 'อัปโหลดเอกสาร (Documents)', icon: <UploadCloud className="w-4 h-4" /> },
    { number: 4, label: 'ตรวจสอบ & ยื่นใบสมัคร (Review)', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-cyan-400 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div
              key={step.number}
              onClick={() => onStepClick && isCompleted && onStepClick(step.number)}
              className={`relative z-10 flex flex-col items-center group ${
                isCompleted ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xl ${
                  isActive
                    ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 scale-110 shadow-sky-500/40'
                    : isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold text-center transition-colors ${
                  isActive
                    ? 'text-sky-400 font-bold'
                    : isCompleted
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
