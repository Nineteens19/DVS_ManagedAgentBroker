export type UserRole =
  | 'branch_officer'
  | 'ho_reviewer'
  | 'approver_md'
  | 'premium_reviewer'
  | 'auditor_legal'
  | 'admin';

export interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleDisplayName: string;
  branchCode: string;
  branchName: string;
  email: string;
}

export type AgentType = 'Individual' | 'Corporate';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'PendingHeadOfficeReview'
  | 'DeficiencyPendingBranch'
  | 'PendingExecutiveApproval'
  | 'ExecutiveRejected'
  | 'ReviewPremium'
  | 'CoreAutoProvisioning'
  | 'ActiveTemporary'
  | 'Suspended30D'
  | 'Terminated90D'
  | 'ActivePermanent';

export type CollateralType = 'None' | 'LandTitleDeed' | 'BankGuarantee' | 'CashDeposit';

export interface AgentProfileDto {
  titleTh?: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn?: string;
  lastNameEn?: string;
  nationalIdOrTaxId: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
}

export interface GuarantorDto {
  titleTh?: string;
  firstNameTh: string;
  lastNameTh: string;
  nationalId: string;
  relationship?: string;
  employerName?: string;
  position?: string;
  monthlySalary?: number;
  contactPhone?: string;
}

export interface CollateralDto {
  type: CollateralType;
  documentRefNumber?: string;
  appraisedValue?: number;
  description?: string;
}

export interface AttachmentDto {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
  documentType: string;
  uploadedAt: string;
}

export interface ComplianceRecordDto {
  amloStatus: 'Clear' | 'PepOrange' | 'DesignatedSanction';
  oicBlacklistStatus: 'Clear' | 'Found';
  requiresDirectorApproval: boolean;
  screenedAt: string;
  screenedBy: string;
}

export interface CoreSyncTransactionDto {
  id: string;
  targetSystem: 'AS400' | 'APAR' | 'SAP' | 'PCSDIS';
  status: 'Pending' | 'Success' | 'Failed';
  errorMessage?: string;
  completedAt?: string;
}

export interface PhysicalContractRecordDto {
  status: 'Pending' | 'Archived';
  archiveBoxNumber?: string;
  legalAuditorNotes?: string;
  receivedAtLegalAt?: string;
}

export interface AgentApplicationDetailDto {
  id: string;
  applicationNumber: string;
  agentType: AgentType;
  branchCode: string;
  branchName: string;
  status: ApplicationStatus;
  statusDisplayNameTh: string;
  requestedCreditLimit: number;
  approvedCreditLimit?: number;
  commissionPercentage?: number;
  paymentTermMotorDays: number;
  paymentTermNonMotorDays: number;
  agentCode?: string;
  sourceCode?: string;
  unitExecutiveCode?: string;
  sla30DayDeadline?: string;
  sla90DayDeadline?: string;
  slaDaysRemaining?: number;
  suspendedAt?: string;
  suspensionReason?: string;
  createdAt: string;
  submittedAt?: string;
  profile: AgentProfileDto;
  guarantor?: GuarantorDto;
  collateral?: CollateralDto;
  complianceRecord?: ComplianceRecordDto;
  physicalContractRecord?: PhysicalContractRecordDto;
  attachments: AttachmentDto[];
  syncTransactions: CoreSyncTransactionDto[];
}

export interface ApplicationListItemDto {
  id: string;
  applicationNumber: string;
  agentType: AgentType;
  applicantName: string;
  nationalIdOrTaxId: string;
  branchCode: string;
  branchName: string;
  requestedCreditLimit: number;
  approvedCreditLimit?: number;
  status: ApplicationStatus;
  statusDisplayNameTh: string;
  sla30DayDeadline?: string;
  slaDaysRemaining?: number;
  requiresDirectorApproval?: boolean;
  agentCode?: string;
  sourceCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlaDashboardMetricsDto {
  totalApplications: number;
  activeTemporaryCount: number;
  nearDeadline7DaysCount: number;
  suspended30DCount: number;
  terminated90DCount: number;
  activePermanentCount: number;
}
