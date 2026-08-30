'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskNationalId, maskBankAccount } from '../../services/fileValidation';

interface PiiMaskedFieldProps {
  value?: string;
  type?: 'nationalId' | 'bankAccount';
  className?: string;
}

export const PiiMaskedField: React.FC<PiiMaskedFieldProps> = ({
  value,
  type = 'nationalId',
  className = '',
}) => {
  const [isUnmasked, setIsUnmasked] = useState(false);

  if (!value) return <span className="text-gray-400">-</span>;

  const displayValue = isUnmasked
    ? value
    : type === 'nationalId'
    ? maskNationalId(value)
    : maskBankAccount(value);

  return (
    <span className={`inline-flex items-center space-x-1.5 font-mono text-xs text-gray-800 ${className}`}>
      <span>{displayValue}</span>
      <button
        type="button"
        onClick={() => setIsUnmasked(!isUnmasked)}
        className="text-gray-400 hover:text-primary transition-colors p-0.5 rounded focus:outline-none"
        title={isUnmasked ? 'ซ่อนข้อมูลส่วนบุคคล' : 'แสดงข้อมูลส่วนบุคคล'}
      >
        {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
};
