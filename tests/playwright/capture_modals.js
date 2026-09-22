const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../../docs/screenshots');
const ARTIFACT_DIR = path.resolve('C:/Users/teerapat.ti/.gemini/antigravity-ide/brain/c8d8a110-be07-4f9f-9427-b48272e522f0/screenshots');

async function capture(page, filename, description) {
  console.log(`[Capture] ${filename} - ${description}`);
  await page.waitForTimeout(800);
  const localPath = path.join(OUTPUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
}

async function setRole(page, roleKey) {
  const personas = {
    branch_officer: { userId: 'usr-branch-01', username: 'branch.bangkok', fullName: 'นารี สาขากรุงเทพฯ', role: 'branch_officer', roleDisplayName: 'เจ้าหน้าที่ฝ่ายธุรกิจสาขา', branchCode: '001', branchName: 'สำนักงานใหญ่ (สาขาธุรกิจกรุงเทพฯ)', email: 'naree.bkk@deves.co.th' },
    ho_reviewer: { userId: 'usr-ho-01', username: 'ho.reviewer', fullName: 'ปิยะชาติ ฝ่ายธุรกิจ สนญ.', role: 'ho_reviewer', roleDisplayName: 'ฝ่ายธุรกิจสำนักงานใหญ่ (ตรวจรับเอกสาร & คัดกรอง ปปง./คปภ.)', branchCode: '001', branchName: 'สำนักงานใหญ่ (Headquarters)', email: 'piyachat.ho@deves.co.th' },
    auditor_legal: { userId: 'usr-legal-01', username: 'legal.auditor', fullName: 'ทรรศนีย์ สำนักนิติกรรม', role: 'auditor_legal', roleDisplayName: 'ฝ่ายกฎหมาย / สำนักนิติกรรม (จัดเก็บสัญญาฉบับจริง)', branchCode: '001', branchName: 'สำนักงานใหญ่ (Headquarters)', email: 'tatsanee.legal@deves.co.th' },
  };
  await page.evaluate((p) => {
    localStorage.setItem('agent_broker_current_user', JSON.stringify(p));
  }, personas[roleKey] || personas.branch_officer);
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 920 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

    // 1. Capture HO Review Modal
    console.log('Capturing HO Review Modal...');
    await setRole(page, 'ho_reviewer');
    await page.goto(`${BASE_URL}/review`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const hoBtn = page.locator('button:has-text("ตรวจรับ")').first();
    if (await hoBtn.isVisible()) {
      await hoBtn.click();
      await page.waitForTimeout(1000);
      await capture(page, '09_ho_review_detail_modal.png', 'หน้าต่างตรวจรับใบสมัครและผลการคัดกรอง ปปง./คปภ.');
      const closeBtn = page.locator('button:has-text("ปิด"), button:has-text("ยกเลิก")').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
      await page.waitForTimeout(400);
    }

    // 2. Capture Legal Box Modal
    console.log('Capturing Legal Box Modal...');
    await setRole(page, 'auditor_legal');
    await page.goto(`${BASE_URL}/archive`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const boxBtn = page.locator('button:has-text("ลงทะเบียนจัดเก็บกล่อง")').first();
    if (await boxBtn.isVisible()) {
      await boxBtn.click();
      await page.waitForTimeout(1000);
      await capture(page, '15_legal_vault_box_modal.png', 'หน้าต่างลงทะเบียนหมายเลขกล่องจัดเก็บเอกสารและเปิดสิทธิ์ถาวร');
      const closeBoxModal = page.locator('button:has-text("ยกเลิก"), button:has-text("ปิด")').first();
      if (await closeBoxModal.isVisible()) await closeBoxModal.click();
      await page.waitForTimeout(400);
    }

    // 3. Capture Full Detail Modal on Dashboard
    console.log('Capturing Full Detail Modal on Dashboard...');
    await setRole(page, 'branch_officer');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const row = page.locator('table tbody tr').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(1000);
      await capture(page, '16_agent_full_lifecycle_modal.png', 'หน้าต่างแสดงประวัติสถานะตัวแทนแบบครบวงจรและ Audit Trail');
    }

    console.log('✅ Modals captured successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
