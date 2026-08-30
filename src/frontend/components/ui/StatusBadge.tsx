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
        return 'badge-pending';
      case 'DeficiencyPendingBranch':
        return 'badge-returned';
      case 'PendingExecutiveApproval':
        return 'badge-pending font-semibold';
      case 'ExecutiveRejected':
        return 'badge-rejected';
      case 'ReviewPremium':
      case 'CoreAutoProvisioning':
        return 'badge-normal';
      case 'ActiveTemporary':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Suspended30D':
        return 'badge-urgent';
      case 'Terminated90D':
        return 'bg-gray-800 text-white border border-gray-900 font-bold';
      case 'ActivePermanent':
        return 'badge-approved font-semibold';
      default:
        return 'badge-draft';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getBadgeClass(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {STATUS_LABELS_TH[status] || status}
    </span>
  );
};
