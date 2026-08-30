import { AgentApplicationDetailDto, ApplicationListItemDto, SlaDashboardMetricsDto, ApplicationStatus } from '../types/domain';

export const STATUS_LABELS_TH: Record<ApplicationStatus, string> = {
  Draft: 'แบบร่าง',
  Submitted: 'ยื่นแล้ว',
  PendingHeadOfficeReview: 'รอ สนญ. ตรวจ',
  DeficiencyPendingBranch: 'ส่งกลับแก้ไข',
  PendingExecutiveApproval: 'รอ MD อนุมัติ',
  ExecutiveRejected: 'ไม่อนุมัติ',
  ReviewPremium: 'รอตั้งวงเงิน',
  CoreAutoProvisioning: 'กำลัง Sync Core',
  ActiveTemporary: 'Active ชั่วคราว (30D)',
  Suspended30D: 'ระงับสิทธิ์ (SLA)',
  Terminated90D: 'เพิกถอนสิทธิ์',
  ActivePermanent: 'Active ถาวร',
};

let MOCK_APPLICATIONS: AgentApplicationDetailDto[] = [
  {
    id: 'app-001-draft',
    applicationNumber: 'APP-20260830-0001',
    agentType: 'Individual',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    status: 'Draft',
    statusDisplayNameTh: STATUS_LABELS_TH['Draft'],
    requestedCreditLimit: 500000,
    paymentTermMotorDays: 30,
    paymentTermNonMotorDays: 45,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    profile: {
      titleTh: 'นาย',
      firstNameTh: 'สมชาย',
      lastNameTh: 'ใจดีมั่นคง',
      firstNameEn: 'Somchai',
      lastNameEn: 'Jaidee',
      nationalIdOrTaxId: '1100400011223',
      dateOfBirth: '1985-05-15',
      phoneNumber: '0812345678',
      email: 'somchai.j@example.com',
      address: '123/45 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
      bankName: 'ธนาคารกสิกรไทย',
      bankAccountNumber: '0452345678',
      bankAccountName: 'นายสมชาย ใจดีมั่นคง',
      licenseNumber: 'AG-6701-0987',
      licenseExpiryDate: '2027-12-31',
    },
    guarantor: {
      titleTh: 'นาง',
      firstNameTh: 'สมศรี',
      lastNameTh: 'ใจดีมั่นคง',
      nationalId: '1100400022334',
      relationship: 'ภรรยา',
      employerName: 'บริษัท ทีพีเจ แอสเซท จำกัด',
      position: 'ผู้จัดการฝ่ายการเงิน',
      monthlySalary: 65000,
      contactPhone: '0898765432',
    },
    collateral: {
      type: 'LandTitleDeed',
      documentRefNumber: 'โฉนดที่ดิน 45892 อ.บางพลี',
      appraisedValue: 1200000,
      description: 'ที่ดินพร้อมสิ่งปลูกสร้าง 50 ตร.ว.',
    },
    attachments: [
      { id: 'att-1', fileName: 'id_card_somchai.pdf', fileSizeBytes: 1048576, contentType: 'application/pdf', documentType: 'IdCardCopy', uploadedAt: new Date().toISOString() },
      { id: 'att-2', fileName: 'bank_book_kbank.jpg', fileSizeBytes: 2048576, contentType: 'image/jpeg', documentType: 'BankBook', uploadedAt: new Date().toISOString() },
    ],
    syncTransactions: []
  },
  {
    id: 'app-002-submitted',
    applicationNumber: 'APP-20260830-0002',
    agentType: 'Individual',
    branchCode: '002',
    branchName: 'สาขาเชียงใหม่ (Chiang Mai)',
    status: 'Submitted',
    statusDisplayNameTh: STATUS_LABELS_TH['Submitted'],
    requestedCreditLimit: 300000,
    paymentTermMotorDays: 15,
    paymentTermNonMotorDays: 30,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    submittedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    profile: {
      titleTh: 'นางสาว',
      firstNameTh: 'พรทิพย์',
      lastNameTh: 'สง่างาม',
      nationalIdOrTaxId: '3501200045678',
      phoneNumber: '0861112233',
      email: 'porntip.s@example.com',
      address: '99/1 ถนนนิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200',
      bankName: 'ธนาคารไทยพาณิชย์',
      bankAccountNumber: '4012349999',
      bankAccountName: 'น.ส. พรทิพย์ สง่างาม',
      licenseNumber: 'AG-6702-5544',
    },
    attachments: [
      { id: 'att-3', fileName: 'id_card_porntip.pdf', fileSizeBytes: 890000, contentType: 'application/pdf', documentType: 'IdCardCopy', uploadedAt: new Date().toISOString() }
    ],
    syncTransactions: []
  },
  {
    id: 'app-003-pending-approval',
    applicationNumber: 'APP-20260830-0003',
    agentType: 'Corporate',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    status: 'PendingExecutiveApproval',
    statusDisplayNameTh: STATUS_LABELS_TH['PendingExecutiveApproval'],
    requestedCreditLimit: 2000000,
    paymentTermMotorDays: 31,
    paymentTermNonMotorDays: 45,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    submittedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    profile: {
      titleTh: 'บจก.',
      firstNameTh: 'สยามอินชัวร์ อินชัวรันส์ โบรกเกอร์',
      lastNameTh: '(สำนักงานใหญ่)',
      nationalIdOrTaxId: '0105558099881',
      phoneNumber: '022345678',
      email: 'contact@siaminsure-broker.co.th',
      address: '888 อาคารสยามทาวเวอร์ ชั้น 18 ถนนสีลม เขตบางรัก กรุงเทพฯ 10500',
      bankName: 'ธนาคารกรุงเทพ',
      bankAccountNumber: '1010998877',
      bankAccountName: 'บจก. สยามอินชัวร์ อินชัวรันส์ โบรกเกอร์',
      licenseNumber: 'BR-6701-0012',
    },
    complianceRecord: {
      amloStatus: 'PepOrange',
      oicBlacklistStatus: 'Clear',
      requiresDirectorApproval: true,
      screenedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      screenedBy: 'ho.reviewer'
    },
    attachments: [
      { id: 'att-4', fileName: 'company_affidavit.pdf', fileSizeBytes: 3100000, contentType: 'application/pdf', documentType: 'CompanyAffidavit', uploadedAt: new Date().toISOString() },
      { id: 'att-5', fileName: 'director_id_card.pdf', fileSizeBytes: 1200000, contentType: 'application/pdf', documentType: 'IdCardCopy', uploadedAt: new Date().toISOString() }
    ],
    syncTransactions: []
  },
  {
    id: 'app-004-review-premium',
    applicationNumber: 'APP-20260830-0004',
    agentType: 'Individual',
    branchCode: '003',
    branchName: 'สาขาขอนแก่น (Khon Kaen)',
    status: 'ReviewPremium',
    statusDisplayNameTh: STATUS_LABELS_TH['ReviewPremium'],
    requestedCreditLimit: 1000000,
    approvedCreditLimit: 1000000,
    commissionPercentage: 18.0,
    paymentTermMotorDays: 30,
    paymentTermNonMotorDays: 45,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    profile: {
      titleTh: 'นาย',
      firstNameTh: 'เกียรติศักดิ์',
      lastNameTh: 'รุ่งเรืองกิจ',
      nationalIdOrTaxId: '1409900012345',
      phoneNumber: '0819998888',
      email: 'kiattisak.r@example.com',
      bankName: 'ธนาคารกรุงไทย',
      bankAccountNumber: '5012345678',
      bankAccountName: 'นายเกียรติศักดิ์ รุ่งเรืองกิจ',
      licenseNumber: 'AG-6703-1200',
    },
    complianceRecord: {
      amloStatus: 'Clear',
      oicBlacklistStatus: 'Clear',
      requiresDirectorApproval: false,
      screenedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
      screenedBy: 'ho.reviewer'
    },
    attachments: [],
    syncTransactions: []
  },
  {
    id: 'app-005-active-temporary',
    applicationNumber: 'APP-20260830-0005',
    agentType: 'Individual',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    status: 'ActiveTemporary',
    statusDisplayNameTh: STATUS_LABELS_TH['ActiveTemporary'],
    requestedCreditLimit: 500000,
    approvedCreditLimit: 500000,
    commissionPercentage: 15.0,
    paymentTermMotorDays: 30,
    paymentTermNonMotorDays: 45,
    agentCode: 'AG202600015',
    sourceCode: 'SRC-B001-0015',
    unitExecutiveCode: 'UE-B001-01',
    sla30DayDeadline: new Date(Date.now() + 86400000 * 24).toISOString(), // 24 days left
    sla90DayDeadline: new Date(Date.now() + 86400000 * 84).toISOString(),
    slaDaysRemaining: 24,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    profile: {
      titleTh: 'นาย',
      firstNameTh: 'ธนากร',
      lastNameTh: 'เจริญทรัพย์',
      nationalIdOrTaxId: '1100500098765',
      phoneNumber: '0854443322',
      email: 'thanakorn.c@example.com',
      bankName: 'ธนาคารกสิกรไทย',
      bankAccountNumber: '0331234567',
      bankAccountName: 'นายธนากร เจริญทรัพย์',
      licenseNumber: 'AG-6701-4455',
    },
    attachments: [],
    syncTransactions: [
      { id: 'sync-1', targetSystem: 'AS400', status: 'Success', completedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: 'sync-2', targetSystem: 'APAR', status: 'Success', completedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: 'sync-3', targetSystem: 'SAP', status: 'Success', completedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: 'sync-4', targetSystem: 'PCSDIS', status: 'Success', completedAt: new Date(Date.now() - 86400000 * 6).toISOString() }
    ],
    physicalContractRecord: {
      status: 'Pending'
    }
  },
  {
    id: 'app-006-suspended-30d',
    applicationNumber: 'APP-20260830-0006',
    agentType: 'Individual',
    branchCode: '004',
    branchName: 'สาขาหาดใหญ่ (Hat Yai)',
    status: 'Suspended30D',
    statusDisplayNameTh: STATUS_LABELS_TH['Suspended30D'],
    requestedCreditLimit: 400000,
    approvedCreditLimit: 400000,
    commissionPercentage: 14.0,
    paymentTermMotorDays: 15,
    paymentTermNonMotorDays: 30,
    agentCode: 'AG202600008',
    sourceCode: 'SRC-B004-0008',
    unitExecutiveCode: 'UE-B004-01',
    sla30DayDeadline: new Date(Date.now() - 86400000 * 2).toISOString(), // Breached 2 days ago
    sla90DayDeadline: new Date(Date.now() + 86400000 * 58).toISOString(),
    slaDaysRemaining: -2,
    suspendedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    suspensionReason: '30-Day SLA breach: Missing original hard-copy contract documents',
    createdAt: new Date(Date.now() - 86400000 * 32).toISOString(),
    profile: {
      titleTh: 'นาย',
      firstNameTh: 'วิชาญ',
      lastNameTh: 'แซ่ลิ้ม',
      nationalIdOrTaxId: '1909800045612',
      phoneNumber: '0875556677',
      email: 'wichan.s@example.com',
      bankName: 'ธนาคารไทยพาณิชย์',
      bankAccountNumber: '5552341234',
      bankAccountName: 'นายวิชาญ แซ่ลิ้ม',
      licenseNumber: 'AG-6704-0033',
    },
    attachments: [],
    syncTransactions: [
      { id: 'sync-5', targetSystem: 'AS400', status: 'Success' },
      { id: 'sync-6', targetSystem: 'APAR', status: 'Success' },
      { id: 'sync-7', targetSystem: 'SAP', status: 'Success' },
      { id: 'sync-8', targetSystem: 'PCSDIS', status: 'Success' }
    ],
    physicalContractRecord: {
      status: 'Pending'
    }
  },
  {
    id: 'app-007-active-permanent',
    applicationNumber: 'APP-20260830-0007',
    agentType: 'Individual',
    branchCode: '001',
    branchName: 'สำนักงานใหญ่ (Headquarters)',
    status: 'ActivePermanent',
    statusDisplayNameTh: STATUS_LABELS_TH['ActivePermanent'],
    requestedCreditLimit: 1500000,
    approvedCreditLimit: 1500000,
    commissionPercentage: 18.0,
    paymentTermMotorDays: 30,
    paymentTermNonMotorDays: 45,
    agentCode: 'AG202600001',
    sourceCode: 'SRC-B001-0001',
    unitExecutiveCode: 'UE-B001-01',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    profile: {
      titleTh: 'นาย',
      firstNameTh: 'ประเสริฐ',
      lastNameTh: 'ศรีสวัสดิ์',
      nationalIdOrTaxId: '1100200055443',
      phoneNumber: '0818887766',
      email: 'prasert.s@example.com',
      bankName: 'ธนาคารกสิกรไทย',
      bankAccountNumber: '0981234567',
      bankAccountName: 'นายประเสริฐ ศรีสวัสดิ์',
      licenseNumber: 'AG-6701-0001',
    },
    attachments: [],
    syncTransactions: [],
    physicalContractRecord: {
      status: 'Archived',
      archiveBoxNumber: 'BOX-2026-HQ-001',
      legalAuditorNotes: 'เอกสารสัญญาฉบับจริงพร้อมสำเนาบัตรและหลักค้ำประกันตรวจรับเรียบร้อย',
      receivedAtLegalAt: new Date(Date.now() - 86400000 * 45).toISOString()
    }
  }
];

export const MockDataEngine = {
  getApplications: async (role?: string, branchCode?: string): Promise<ApplicationListItemDto[]> => {
    return MOCK_APPLICATIONS.map(app => {
      let slaDaysRemaining = undefined;
      if (app.sla30DayDeadline) {
        const diffMs = new Date(app.sla30DayDeadline).getTime() - Date.now();
        slaDaysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      return {
        id: app.id,
        applicationNumber: app.applicationNumber,
        agentType: app.agentType,
        applicantName: `${app.profile.titleTh || ''} ${app.profile.firstNameTh} ${app.profile.lastNameTh}`.trim(),
        nationalIdOrTaxId: app.profile.nationalIdOrTaxId,
        branchCode: app.branchCode,
        branchName: app.branchName,
        requestedCreditLimit: app.requestedCreditLimit,
        approvedCreditLimit: app.approvedCreditLimit,
        status: app.status,
        statusDisplayNameTh: STATUS_LABELS_TH[app.status] || app.status,
        sla30DayDeadline: app.sla30DayDeadline,
        slaDaysRemaining,
        requiresDirectorApproval: app.complianceRecord?.requiresDirectorApproval,
        agentCode: app.agentCode,
        sourceCode: app.sourceCode,
        createdAt: app.createdAt,
        updatedAt: app.createdAt
      };
    });
  },

  getApplicationById: async (id: string): Promise<AgentApplicationDetailDto | null> => {
    const found = MOCK_APPLICATIONS.find(a => a.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  saveDraft: async (data: Partial<AgentApplicationDetailDto>): Promise<AgentApplicationDetailDto> => {
    if (data.id) {
      const existingIdx = MOCK_APPLICATIONS.findIndex((a) => a.id === data.id);
      if (existingIdx >= 0) {
        const existing = MOCK_APPLICATIONS[existingIdx];
        const updated: AgentApplicationDetailDto = {
          ...existing,
          agentType: data.agentType || existing.agentType,
          requestedCreditLimit: data.requestedCreditLimit ?? existing.requestedCreditLimit,
          paymentTermMotorDays: data.paymentTermMotorDays ?? existing.paymentTermMotorDays,
          paymentTermNonMotorDays: data.paymentTermNonMotorDays ?? existing.paymentTermNonMotorDays,
          profile: data.profile ? { ...existing.profile, ...data.profile } : existing.profile,
          guarantor: data.guarantor !== undefined ? data.guarantor : existing.guarantor,
          collateral: data.collateral !== undefined ? data.collateral : existing.collateral,
          attachments: data.attachments || existing.attachments,
        };
        MOCK_APPLICATIONS[existingIdx] = updated;
        return JSON.parse(JSON.stringify(updated));
      }
    }

    const newId = `app-${Date.now()}`;
    const newAppNumber = `APP-20260830-${String(MOCK_APPLICATIONS.length + 1).padStart(4, '0')}`;
    const newApp: AgentApplicationDetailDto = {
      id: newId,
      applicationNumber: newAppNumber,
      agentType: data.agentType || 'Individual',
      branchCode: data.branchCode || '001',
      branchName: data.branchName || 'สำนักงานใหญ่ (Headquarters)',
      status: 'Draft',
      statusDisplayNameTh: STATUS_LABELS_TH['Draft'],
      requestedCreditLimit: data.requestedCreditLimit || 0,
      paymentTermMotorDays: data.paymentTermMotorDays || 30,
      paymentTermNonMotorDays: data.paymentTermNonMotorDays || 45,
      createdAt: new Date().toISOString(),
      profile: data.profile || { firstNameTh: '', lastNameTh: '', nationalIdOrTaxId: '' },
      guarantor: data.guarantor,
      collateral: data.collateral,
      attachments: data.attachments || [],
      syncTransactions: [],
    };

    MOCK_APPLICATIONS.unshift(newApp);
    return JSON.parse(JSON.stringify(newApp));
  },

  submitApplication: async (id: string): Promise<AgentApplicationDetailDto> => {
    const app = MOCK_APPLICATIONS.find((a) => a.id === id);
    if (!app) throw new Error('Application not found');
    app.status = 'Submitted';
    app.statusDisplayNameTh = STATUS_LABELS_TH['Submitted'];
    app.submittedAt = new Date().toISOString();
    return JSON.parse(JSON.stringify(app));
  },

  runComplianceScreen: async (id: string): Promise<AgentApplicationDetailDto> => {
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    
    // Simulate AMLO / OIC Sanctions Screen
    const isPep = app.profile.firstNameTh.includes('สยาม') || app.requestedCreditLimit > 1000000;
    app.complianceRecord = {
      amloStatus: isPep ? 'PepOrange' : 'Clear',
      oicBlacklistStatus: 'Clear',
      requiresDirectorApproval: isPep,
      screenedAt: new Date().toISOString(),
      screenedBy: 'ho.reviewer'
    };
    return app;
  },

  forwardToExecutive: async (id: string): Promise<AgentApplicationDetailDto> => {
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    app.status = 'PendingExecutiveApproval';
    app.statusDisplayNameTh = STATUS_LABELS_TH['PendingExecutiveApproval'];
    return app;
  },

  processExecutiveDecision: async (id: string, isApproved: boolean, remarks: string): Promise<AgentApplicationDetailDto> => {
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    if (isApproved) {
      app.status = 'ReviewPremium';
      app.statusDisplayNameTh = STATUS_LABELS_TH['ReviewPremium'];
      app.approvedCreditLimit = app.requestedCreditLimit;
      app.commissionPercentage = 15.0;
    } else {
      app.status = 'ExecutiveRejected';
      app.statusDisplayNameTh = STATUS_LABELS_TH['ExecutiveRejected'];
    }
    return app;
  },

  triggerProvisioning: async (id: string, approvedLimit: number, commission: number): Promise<AgentApplicationDetailDto> => {
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    
    // Generate Codes
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    app.agentCode = app.agentType === 'Corporate' ? `BR2026${seq}` : `AG2026${seq}`;
    app.sourceCode = `SRC-B${app.branchCode}-${seq}`;
    app.unitExecutiveCode = `UE-B${app.branchCode}-01`;
    app.approvedCreditLimit = approvedLimit;
    app.commissionPercentage = commission;

    // Simulate 100% IT Automation multi-system provisioning
    app.syncTransactions = [
      { id: `sync-${Date.now()}-1`, targetSystem: 'AS400', status: 'Success', completedAt: new Date().toISOString() },
      { id: `sync-${Date.now()}-2`, targetSystem: 'APAR', status: 'Success', completedAt: new Date().toISOString() },
      { id: `sync-${Date.now()}-3`, targetSystem: 'SAP', status: 'Success', completedAt: new Date().toISOString() },
      { id: `sync-${Date.now()}-4`, targetSystem: 'PCSDIS', status: 'Success', completedAt: new Date().toISOString() },
    ];

    app.status = 'ActiveTemporary';
    app.statusDisplayNameTh = STATUS_LABELS_TH['ActiveTemporary'];
    app.sla30DayDeadline = new Date(Date.now() + 86400000 * 30).toISOString();
    app.sla90DayDeadline = new Date(Date.now() + 86400000 * 90).toISOString();
    app.slaDaysRemaining = 30;

    return app;
  },

  archivePhysicalContract: async (id: string, boxNumber: string, notes?: string): Promise<AgentApplicationDetailDto> => {
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    
    app.status = 'ActivePermanent';
    app.statusDisplayNameTh = STATUS_LABELS_TH['ActivePermanent'];
    app.suspendedAt = undefined;
    app.suspensionReason = undefined;
    app.physicalContractRecord = {
      status: 'Archived',
      archiveBoxNumber: boxNumber,
      legalAuditorNotes: notes,
      receivedAtLegalAt: new Date().toISOString()
    };
    return app;
  },

  getSlaMetrics: async (): Promise<SlaDashboardMetricsDto> => {
    const apps = MOCK_APPLICATIONS;
    return {
      totalApplications: apps.length,
      activeTemporaryCount: apps.filter(a => a.status === 'ActiveTemporary').length,
      nearDeadline7DaysCount: apps.filter(a => a.status === 'ActiveTemporary' && (a.slaDaysRemaining || 0) <= 7 && (a.slaDaysRemaining || 0) >= 0).length,
      suspended30DCount: apps.filter(a => a.status === 'Suspended30D').length,
      terminated90DCount: apps.filter(a => a.status === 'Terminated90D').length,
      activePermanentCount: apps.filter(a => a.status === 'ActivePermanent').length,
    };
  }
};
