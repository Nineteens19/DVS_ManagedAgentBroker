# Frontend Domain Entities & UI Component Models — Unit 6: Next.js Enterprise Web Portal

## Overview
This document specifies the TypeScript data structures, UI state models, form schemas, and component entity contracts for the **Next.js 14+ Enterprise Web Portal & Operational Dashboards**.

---

## 1. Persona & Authentication State Models

```typescript
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
  avatarUrl?: string;
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  activePersona: UserRole;
}
```

---

## 2. Application Intake Wizard State Models

```typescript
export type AgentType = 'Individual' | 'Corporate';
export type CollateralType = 'None' | 'LandTitleDeed' | 'BankGuarantee' | 'CashDeposit';

export interface ApplicantProfileForm {
  agentType: AgentType;
  titleTh: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn?: string;
  lastNameEn?: string;
  nationalIdOrTaxId: string;
  isNationalIdValid: boolean;
  dateOfBirth?: string;
  phoneNumber: string;
  email: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
}

export interface GuarantorCollateralForm {
  // Guarantor (Optional / Mandatory based on credit limit)
  hasGuarantor: boolean;
  guarantorTitleTh?: string;
  guarantorFirstNameTh?: string;
  guarantorLastNameTh?: string;
  guarantorNationalId?: string;
  guarantorRelationship?: string;
  guarantorEmployerName?: string;
  guarantorPosition?: string;
  guarantorMonthlySalary?: number;
  guarantorContactPhone?: string;

  // Collateral (Optional)
  collateralType: CollateralType;
  collateralDocumentRefNumber?: string;
  collateralAppraisedValue?: number;
  collateralDescription?: string;

  // Credit Request
  requestedCreditLimit: number;
  paymentTermMotorDays: 15 | 30 | 31;
  paymentTermNonMotorDays: number; // Max 45
}

export interface UploadedAttachmentItem {
  id: string;
  file: File | null;
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
  documentType: 'IdCardCopy' | 'HouseRegistration' | 'BankBook' | 'LicenseCopy' | 'CompanyAffidavit' | 'GuarantorIdCard' | 'CollateralDeed' | 'Other';
  status: 'Pending' | 'Validating' | 'Uploaded' | 'Error';
  magicByteVerified: boolean;
  errorMessage?: string;
  previewUrl?: string;
}

export interface ApplicationWizardState {
  currentStep: 1 | 2 | 3 | 4;
  isSubmitting: boolean;
  isDraftSaving: boolean;
  applicationId?: string;
  applicationNumber?: string;
  profile: ApplicantProfileForm;
  guarantorCollateral: GuarantorCollateralForm;
  attachments: UploadedAttachmentItem[];
}
```

---

## 3. Application Summary & Queue Table Entity Models

```typescript
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

export interface ApplicationListItem {
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
  sla90DayDeadline?: string;
  slaDaysRemaining?: number;
  requiresDirectorApproval?: boolean;
  agentCode?: string;
  sourceCode?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Compliance & Approval Decision Entity Models

```typescript
export interface ComplianceScreeningView {
  id: string;
  applicationId: string;
  amloStatus: 'Clear' | 'PepOrange' | 'DesignatedSanction';
  oicBlacklistStatus: 'Clear' | 'Found';
  requiresDirectorApproval: boolean;
  matchedEntitiesJson?: string;
  screenedAt: string;
  screenedBy: string;
}

export interface ExecutiveDecisionModalState {
  isOpen: boolean;
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  branchName: string;
  requestedCreditLimit: number;
  complianceView: ComplianceScreeningView | null;
  decision: 'Approve' | 'Reject' | null;
  remarks: string;
  isSubmitting: boolean;
}
```

---

## 5. Provisioning & SLA Status Models

```typescript
export interface CoreSyncTransactionView {
  id: string;
  targetSystem: 'AS400' | 'APAR' | 'SAP' | 'PCSDIS';
  status: 'Pending' | 'Success' | 'Failed';
  errorMessage?: string;
  completedAt?: string;
}

export interface ProvisioningConsoleState {
  applicationId: string;
  applicationNumber: string;
  approvedCreditLimit: number;
  commissionPercentage: number;
  isProvisioningInProgress: boolean;
  agentCode?: string;
  sourceCode?: string;
  syncTransactions: CoreSyncTransactionView[];
}

export interface SlaTrackerMetrics {
  totalActiveTemporary: number;
  nearDeadline7Days: number;
  totalSuspended30D: number;
  totalTerminated90D: number;
  totalActivePermanent: number;
}
```
