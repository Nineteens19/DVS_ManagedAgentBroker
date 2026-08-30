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
  slaDeadline,
}) => {
  if (status === 'ActivePermanent') {
    return (
      <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        สัญญาตัวจริงจัดเก็บแล้ว (Archived)
      </span>
    );
  }

  if (status === 'Suspended30D') {
    return (
      <span className="inline-flex items-center text-xs text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-500/40 animate-pulse">
        <XCircle className="w-3.5 h-3.5 mr-1" />
        ระงับสิทธิ์แล้ว (ขาดส่งสัญญา 30 วัน)
      </span>
    );
  }

  if (status === 'Terminated90D') {
    return (
      <span className="inline-flex items-center text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700 font-bold">
        เพิกถอนสิทธิ์ถาวร (90D Terminated)
      </span>
    );
  }

  if (status === 'ActiveTemporary') {
    if (daysRemaining === undefined || daysRemaining === null) return null;

    if (daysRemaining <= 3) {
      return (
        <span className="inline-flex items-center text-xs text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/50 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400" />
          วิกฤต: เหลืออีก {daysRemaining} วัน (30D SLA)
        </span>
      );
    }

    if (daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center text-xs text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-500/40">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
          เตือน: เหลืออีก {daysRemaining} วัน (30D SLA)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center text-xs text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-500/30">
        <Clock className="w-3.5 h-3.5 mr-1 text-teal-400" />
        เหลืออีก {daysRemaining} วัน (ส่งสัญญาตัวจริง)
      </span>
    );
  }

  return null;
};
