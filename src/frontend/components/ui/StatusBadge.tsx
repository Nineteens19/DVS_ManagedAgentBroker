import React from 'react';
import { ApplicationStatus } from '../../types/domain';
import { STATUS_LABELS_TH } from '../../services/mockDataEngine';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeClass = (st: ApplicationStatus) => {
    switch (st) {
      case 'Draft':
        return 'badge-draft';
      case 'Submitted':
      case 'PendingHeadOfficeReview':
      case 'PendingExecutiveApproval':
        return 'badge-pending';
      case 'DeficiencyPendingBranch':
        return 'badge-returned';
      case 'ExecutiveRejected':
        return 'badge-rejected';
      case 'ReviewPremium':
      case 'CoreAutoProvisioning':
      case 'ActiveTemporary':
        return 'badge-normal';
      case 'Suspended30D':
      case 'Terminated90D':
        return 'badge-urgent';
      case 'ActivePermanent':
        return 'badge-approved font-semibold';
      default:
        return 'badge-draft';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${getBadgeClass(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {STATUS_LABELS_TH[status] || status}
    </span>
  );
};
