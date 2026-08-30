'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole, UserProfile } from '../types/domain';

export const PRESET_PERSONAS: Record<UserRole, UserProfile> = {
  branch_officer: {
    userId: 'usr-branch-01',
    username: 'branch.bangkok',
    fullName: 'นารี สาขากรุงเทพฯ',
    role: 'branch_officer',
    roleDisplayName: 'เจ้าหน้าที่สาขา (Branch Officer)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'naree.bkk@insurance-broker.com',
  },
  ho_reviewer: {
    userId: 'usr-ho-01',
    username: 'ho.reviewer',
    fullName: 'ปิยะชาติ ตรวจสอบสนญ.',
    role: 'ho_reviewer',
    roleDisplayName: 'เจ้าหน้าที่ตรวจรับ สนญ. (HO Reviewer)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'piyachat.ho@insurance-broker.com',
  },
  approver_md: {
    userId: 'usr-md-01',
    username: 'md.executive',
    fullName: 'ดร. กิตติภพ กรรมการผู้จัดการ (MD)',
    role: 'approver_md',
    roleDisplayName: 'ผู้บริหารผู้อนุมัติ (Executive Approver / MD)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'kittipob.md@insurance-broker.com',
  },
  premium_reviewer: {
    userId: 'usr-prem-01',
    username: 'premium.officer',
    fullName: 'มนตรี ฝ่ายสินเชื่อและตั้งรหัส',
    role: 'premium_reviewer',
    roleDisplayName: 'ฝ่ายสินเชื่อ & รหัสตัวแทน (Premium Reviewer)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'montri.prem@insurance-broker.com',
  },
  auditor_legal: {
    userId: 'usr-legal-01',
    username: 'legal.auditor',
    fullName: 'ทรรศนีย์ ฝ่ายกฎหมาย & สัญญา',
    role: 'auditor_legal',
    roleDisplayName: 'ฝ่ายกฎหมายจัดเก็บเอกสาร (Legal Auditor)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'tatsanee.legal@insurance-broker.com',
  },
  admin: {
    userId: 'usr-admin-01',
    username: 'sysadmin',
    fullName: 'ผู้ดูแลระบบสูงสุด (System Admin)',
    role: 'admin',
    roleDisplayName: 'ผู้ดูแลระบบ (Administrator)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'admin@insurance-broker.com',
  },
};

interface AuthContextType {
  currentUser: UserProfile;
  switchPersona: (role: UserRole) => void;
  canCreateApplication: boolean;
  canReviewCompliance: boolean;
  canApproveExecutive: boolean;
  canProvisionCore: boolean;
  canArchiveLegal: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_PERSONAS.branch_officer);

  const switchPersona = (role: UserRole) => {
    setCurrentUser(PRESET_PERSONAS[role]);
  };

  const canCreateApplication = currentUser.role === 'branch_officer' || currentUser.role === 'admin';
  const canReviewCompliance = currentUser.role === 'ho_reviewer' || currentUser.role === 'admin';
  const canApproveExecutive = currentUser.role === 'approver_md' || currentUser.role === 'admin';
  const canProvisionCore = currentUser.role === 'premium_reviewer' || currentUser.role === 'admin';
  const canArchiveLegal = currentUser.role === 'auditor_legal' || currentUser.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchPersona,
        canCreateApplication,
        canReviewCompliance,
        canApproveExecutive,
        canProvisionCore,
        canArchiveLegal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
