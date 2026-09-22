import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { ApplicationStatus } from '../../types/domain';

interface SlaCountdownBadgeProps {
  status: ApplicationStatus;
  daysRemaining?: number;
  slaDeadline?: string;
}

export const SlaCountdownBadge: React.FC<SlaCountdownBadgeProps> = ({
  status,
  daysRemaining,
}) => {
  if (status === 'ActivePermanent') {
    return (
      <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
        จัดเก็บสัญญาแล้ว (เปิดขายถาวร)
      </span>
    );
  }

  if (status === 'Suspended30D') {
    return (
      <span className="inline-flex items-center text-xs text-white bg-red-600 px-2.5 py-1 rounded-md font-semibold animate-pulse shadow-sm">
        <XCircle className="w-3.5 h-3.5 mr-1" />
        ระงับการขายชั่วคราว (ขาดส่งสัญญาเกิน 30 วัน)
      </span>
    );
  }

  if (status === 'Terminated90D') {
    return (
      <span className="inline-flex items-center text-xs text-gray-700 bg-gray-200 px-2.5 py-1 rounded-md font-bold">
        เพิกถอนรหัสถาวร (ขาดส่งสัญญาเกิน 90 วัน)
      </span>
    );
  }

  if (status === 'ActiveTemporary') {
    if (daysRemaining === undefined || daysRemaining === null) return null;

    if (daysRemaining <= 3) {
      return (
        <span className="inline-flex items-center text-xs text-red-800 bg-red-100 px-2.5 py-1 rounded-md border border-red-300 font-bold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
          วิกฤต: เหลือเวลาอีก {daysRemaining} วัน (ครบ 30 วัน)
        </span>
      );
    }

    if (daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center text-xs text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300 font-semibold">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
          แจ้งเตือน: เหลือเวลาอีก {daysRemaining} วัน (ครบ 30 วัน)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center text-xs text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
        <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
        เหลือเวลาอีก {daysRemaining} วัน (ผ่อนผันส่งสัญญา)
      </span>
    );
  }

  return null;
};
