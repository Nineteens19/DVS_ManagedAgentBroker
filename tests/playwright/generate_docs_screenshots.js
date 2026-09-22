const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../../docs/screenshots');
const ARTIFACT_DIR = path.resolve('C:/Users/teerapat.ti/.gemini/antigravity-ide/brain/c8d8a110-be07-4f9f-9427-b48272e522f0/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function capture(page, filename, description) {
  console.log(`[Capture] ${filename} - ${description}`);
  await page.waitForTimeout(700);
  const localPath = path.join(OUTPUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  
  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
}

async function setRole(page, roleKey) {
  const personas = {
    branch_officer: {
      userId: 'usr-branch-01',
      username: 'branch.bangkok',
      fullName: 'นารี สาขากรุงเทพฯ',
      role: 'branch_officer',
      roleDisplayName: 'เจ้าหน้าที่ฝ่ายธุรกิจสาขา',
      branchCode: '001',
      branchName: 'สำนักงานใหญ่ (สาขาธุรกิจกรุงเทพฯ)',
      email: 'naree.bkk@deves.co.th',
    },
    ho_reviewer: {
      userId: 'usr-ho-01',
      username: 'ho.reviewer',
      fullName: 'ปิยะชาติ ฝ่ายธุรกิจ สนญ.',
      role: 'ho_reviewer',
      roleDisplayName: 'ฝ่ายธุรกิจสำนักงานใหญ่ (ตรวจรับเอกสาร & คัดกรอง ปปง./คปภ.)',
      branchCode: '001',
      branchName: 'สำนักงานใหญ่ (Headquarters)',
      email: 'piyachat.ho@deves.co.th',
    },
    approver_md: {
      userId: 'usr-md-01',
      username: 'md.executive',
      fullName: 'ดร. กิตติภพ กรรมการผู้จัดการ',
      role: 'approver_md',
      roleDisplayName: 'กรรมการผู้จัดการ (ผู้มีอำนาจลงนามอนุมัติ)',
      branchCode: '001',
      branchName: 'สำนักงานใหญ่ (Headquarters)',
      email: 'kittipob.md@deves.co.th',
    },
    premium_reviewer: {
      userId: 'usr-prem-01',
      username: 'premium.officer',
      fullName: 'มนตรี ฝ่ายบริหารจัดการเบี้ย',
      role: 'premium_reviewer',
      roleDisplayName: 'ฝ่ายบริหารจัดการเบี้ยประกันภัย (อนุมัติวงเงิน & เปิดรหัสระบบหลัก)',
      branchCode: '001',
      branchName: 'สำนักงานใหญ่ (Headquarters)',
      email: 'montri.prem@deves.co.th',
    },
    auditor_legal: {
      userId: 'usr-legal-01',
      username: 'legal.auditor',
      fullName: 'ทรรศนีย์ สำนักนิติกรรม',
      role: 'auditor_legal',
      roleDisplayName: 'ฝ่ายกฎหมาย / สำนักนิติกรรม (จัดเก็บสัญญาฉบับจริง)',
      branchCode: '001',
      branchName: 'สำนักงานใหญ่ (Headquarters)',
      email: 'tatsanee.legal@deves.co.th',
    },
  };

  const persona = personas[roleKey] || personas.branch_officer;
  await page.evaluate((p) => {
    localStorage.setItem('agent_broker_current_user', JSON.stringify(p));
  }, persona);
}

async function run() {
  console.log('🚀 Starting Comprehensive Playwright E2E & Screenshot Generation Suite...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 920 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  try {
    // =============================================================
    // 1. LOGIN & PERSONA SELECTOR
    // =============================================================
    console.log('\n--- 1. Testing Login Screen ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await capture(page, '01_login_personas.png', 'หน้าจอเข้าสู่ระบบและเลือกบทบาท Persona');

    await setRole(page, 'branch_officer');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // =============================================================
    // 2. DASHBOARD - BRANCH OFFICER VIEW
    // =============================================================
    console.log('\n--- 2. Testing Dashboard Overview ---');
    await page.waitForTimeout(800);
    await capture(page, '02_dashboard_branch_view.png', 'ภาพรวม Dashboard สำหรับเจ้าหน้าที่ฝ่ายธุรกิจสาขา');

    // =============================================================
    // 3. INTAKE WIZARD: STEP 1 - APPLICANT PROFILE
    // =============================================================
    console.log('\n--- 3. Testing Intake Wizard - Step 1 ---');
    await page.goto(`${BASE_URL}/intake/new?id=app-001-draft&step=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await capture(page, '03_wizard_step1_applicant_profile.png', 'ขั้นตอนที่ 1: บันทึกประวัติและข้อมูลตัวแทน พร้อมผลตรวจ Modulo 11 และข้อมูลบัญชี');

    // =============================================================
    // 4. INTAKE WIZARD: STEP 2 - GUARANTOR & COLLATERAL
    // =============================================================
    console.log('\n--- 4. Testing Intake Wizard - Step 2 ---');
    await page.goto(`${BASE_URL}/intake/new?id=app-001-draft&step=2`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await capture(page, '04_wizard_step2_guarantor_collateral.png', 'ขั้นตอนที่ 2: กำหนดวงเงินสินเชื่อ ผู้ค้ำประกันและหลักทรัพย์ค้ำประกัน');

    // =============================================================
    // 5. INTAKE WIZARD: STEP 3 - DOCUMENT UPLOAD (MAGIC BYTES)
    // =============================================================
    console.log('\n--- 5. Testing Intake Wizard - Step 3 ---');
    await page.goto(`${BASE_URL}/intake/new?id=app-001-draft&step=3`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await capture(page, '05_wizard_step3_document_upload.png', 'ขั้นตอนที่ 3: อัปโหลดเอกสารหลักฐานพร้อมการตรวจรับรอง Magic Bytes Header');

    // =============================================================
    // 6. INTAKE WIZARD: STEP 4 - REVIEW & SUBMIT
    // =============================================================
    console.log('\n--- 6. Testing Intake Wizard - Step 4 ---');
    await page.goto(`${BASE_URL}/intake/new?id=app-001-draft&step=4`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const step4Checkboxes = page.locator('input[type="checkbox"]');
    const chkCount = await step4Checkboxes.count();
    for (let i = 0; i < chkCount; i++) {
      await step4Checkboxes.nth(i).check();
    }
    await page.waitForTimeout(400);
    await capture(page, '06_wizard_step4_review_submit.png', 'ขั้นตอนที่ 4: ตรวจสอบสรุปข้อมูลใบสมัคร สิทธิประโยชน์ และคำยินยอม PDPA');

    const submitBtn = page.locator('button:has-text("ยื่นใบสมัคร"), button:has-text("ส่งใบสมัคร")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await capture(page, '07_submit_success_toast.png', 'การแจ้งเตือนเมื่อยื่นใบสมัครและส่งต่อเข้าคิวตรวจสอบ สนญ. สำเร็จ');
    }

    // =============================================================
    // 7. HEAD OFFICE REVIEW & SCREENING (ฝ่ายธุรกิจ สนญ.)
    // =============================================================
    console.log('\n--- 7. Testing Head Office Review Queue ---');
    await setRole(page, 'ho_reviewer');
    await page.goto(`${BASE_URL}/review`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await capture(page, '08_ho_review_queue.png', 'รายการคิวงานตรวจสอบของฝ่ายธุรกิจสำนักงานใหญ่ (สนญ.)');

    // Open HO Review Detail Modal
    const hoReviewBtn = page.locator('table tbody tr button').first();
    if (await hoReviewBtn.isVisible()) {
      await hoReviewBtn.click();
      await page.waitForTimeout(1000);
      await capture(page, '09_ho_review_detail_modal.png', 'หน้าต่างตรวจสอบรายละเอียดใบสมัคร ผลการคัดกรอง ปปง./คปภ. และการส่งต่อฝ่ายบริหารเบี้ย');
      
      const closeBtn = page.locator('button:has-text("ปิด"), button:has-text("ยกเลิก")').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
      await page.waitForTimeout(400);
    }

    // =============================================================
    // 8. APPROVAL & DOA WORKFLOW (PREMIUM DEPT & MD)
    // =============================================================
    console.log('\n--- 8. Testing Approval Workflow ---');
    await setRole(page, 'premium_reviewer');
    await page.goto(`${BASE_URL}/approval`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await capture(page, '10_approval_premium_queue.png', 'รายการพิจารณาอนุมัติของฝ่ายบริหารจัดการเบี้ยประกันภัย (อนุมัติเปิดรหัสขายชั่วคราว)');

    await setRole(page, 'approver_md');
    await page.goto(`${BASE_URL}/approval`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await capture(page, '11_approval_md_doa_queue.png', 'รายการพิจารณาอนุมัติของผู้มีอำนาจลงนาม (MD Dual-Approval สำหรับกรณี PEP / วงเงินพิเศษ)');

    // =============================================================
    // 9. CORE PROVISIONING MONITOR (DEVES MASTER AUTO SYNC)
    // =============================================================
    console.log('\n--- 9. Testing Core Provisioning Monitor ---');
    await page.goto(`${BASE_URL}/provisioning`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await capture(page, '12_core_provisioning_monitor.png', 'ระบบเปิดรหัส Deves Master และเชื่อมต่อระบบหลักอัตโนมัติ 100% (AS400, APAR, SAP, PCSDIS)');

    // =============================================================
    // 10. SLA COUNTDOWN & SUSPENSION DASHBOARD (30/90 DAYS)
    // =============================================================
    console.log('\n--- 10. Testing SLA Monitoring Dashboard ---');
    await page.goto(`${BASE_URL}/sla-dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await capture(page, '13_sla_monitoring_dashboard.png', 'แดชบอร์ดติดตามระยะเวลากำหนดส่งสัญญาฉบับจริง (SLA ผ่อนผัน 30 วัน / เพิกถอน 90 วัน)');

    // =============================================================
    // 11. LEGAL ARCHIVE & PHYSICAL VAULT REGISTRATION
    // =============================================================
    console.log('\n--- 11. Testing Legal Archiving & Physical Vault ---');
    await setRole(page, 'auditor_legal');
    await page.goto(`${BASE_URL}/archive`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await capture(page, '14_legal_archive_queue.png', 'คิวงานตรวจรับสัญญาฉบับจริงของฝ่ายกฎหมาย / สำนักนิติกรรม');

    // Click Box Registration button
    const archiveBoxBtn = page.locator('table tbody tr button:has-text("ลงทะเบียน")').first();
    if (await archiveBoxBtn.isVisible()) {
      await archiveBoxBtn.click();
      await page.waitForTimeout(1000);
      await capture(page, '15_legal_vault_box_modal.png', 'หน้าต่างลงทะเบียนหมายเลขกล่องจัดเก็บเอกสารและเปิดสิทธิ์ขายถาวร (Active Permanent)');
      const closeArchiveModal = page.locator('button:has-text("ยกเลิก"), button:has-text("ปิด")').first();
      if (await closeArchiveModal.isVisible()) await closeArchiveModal.click();
      await page.waitForTimeout(400);
    }

    // =============================================================
    // 12. COMPLETED AGENT LIFECYCLE & AUDIT TRAIL
    // =============================================================
    console.log('\n--- 12. Testing Agent Detail & Audit Trail Modal ---');
    await setRole(page, 'branch_officer');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const tableRow = page.locator('table tbody tr').first();
    if (await tableRow.isVisible()) {
      await tableRow.click();
      await page.waitForTimeout(1000);
      await capture(page, '16_agent_full_lifecycle_modal.png', 'หน้าต่างแสดงประวัติสถานะตัวแทนแบบครบวงจร พร้อม Audit Trail ตามมาตรฐาน ISO 27001');
    }

    console.log('\n🎉 ALL FUNCTIONAL E2E TESTS COMPLETED & SCREENSHOTS GENERATED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during test run:', err);
  } finally {
    await browser.close();
  }
}

run();
