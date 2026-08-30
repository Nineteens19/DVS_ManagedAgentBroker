import React from 'react';
import { ApplicationStatus } from '../../types/domain';
import { STATUS_LABELS_TH } from '../../services/mockDataEngine';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (st: ApplicationStatus) => {
    switch (st) {
      case 'Draft':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'Submitted':
      case 'PendingHeadOfficeReview':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse';
      case 'DeficiencyPendingBranch':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PendingExecutiveApproval':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse';
      case 'ExecutiveRejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ReviewPremium':
      case 'CoreAutoProvisioning':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'ActiveTemporary':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'Suspended30D':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold';
      case 'Terminated90D':
        return 'bg-rose-950 text-rose-500 border-rose-700 font-bold';
      case 'ActivePermanent':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {STATUS_LABELS_TH[status] || status}
    </span>
  );
};
