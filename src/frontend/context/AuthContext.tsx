'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
    email: 'naree.bkk@deves.co.th',
  },
  ho_reviewer: {
    userId: 'usr-ho-01',
    username: 'ho.reviewer',
    fullName: 'ปิยะชาติ ตรวจสอบสนญ.',
    role: 'ho_reviewer',
    roleDisplayName: 'เจ้าหน้าที่ตรวจรับ สนญ. (HO Reviewer)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'piyachat.ho@deves.co.th',
  },
  approver_md: {
    userId: 'usr-md-01',
    username: 'md.executive',
    fullName: 'ดร. กิตติภพ กรรมการผู้จัดการ',
    role: 'approver_md',
    roleDisplayName: 'กรรมการผู้จัดการ (Managing Director)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'kittipob.md@deves.co.th',
  },
  premium_reviewer: {
    userId: 'usr-prem-01',
    username: 'premium.officer',
    fullName: 'มนตรี ฝ่ายสินเชื่อและตั้งรหัส',
    role: 'premium_reviewer',
    roleDisplayName: 'ฝ่ายสินเชื่อ & รหัสตัวแทน (Premium Reviewer)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'montri.prem@deves.co.th',
  },
  auditor_legal: {
    userId: 'usr-legal-01',
    username: 'legal.auditor',
    fullName: 'ทรรศนีย์ ฝ่ายกฎหมาย & สัญญา',
    role: 'auditor_legal',
    roleDisplayName: 'ฝ่ายกฎหมายจัดเก็บเอกสาร (Legal Auditor)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'tatsanee.legal@deves.co.th',
  },
  admin: {
    userId: 'usr-admin-01',
    username: 'sysadmin',
    fullName: 'ผู้ดูแลระบบสูงสุด (System Admin)',
    role: 'admin',
    roleDisplayName: 'ผู้ดูแลระบบ (Administrator)',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    email: 'admin@deves.co.th',
  },
};

interface AuthContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  loginAsPersona: (role: UserRole) => void;
  logout: () => void;
  canCreateApplication: boolean;
  canReviewCompliance: boolean;
  canApproveExecutive: boolean;
  canProvisionCore: boolean;
  canArchiveLegal: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'deves_auth_persona';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_PERSONAS.branch_officer);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Restore saved role on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved && PRESET_PERSONAS[saved as UserRole]) {
        setCurrentUser(PRESET_PERSONAS[saved as UserRole]);
      }
    } catch {
      // ignore
    }
  }, []);

  const loginAsPersona = (role: UserRole) => {
    const persona = PRESET_PERSONAS[role] || PRESET_PERSONAS.branch_officer;
    setCurrentUser(persona);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, role);
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
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
        isAuthenticated,
        loginAsPersona,
        logout,
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
