const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../../docs/screenshots');
const ARTIFACT_DIR = path.resolve('C:/Users/teerapat.ti/.gemini/antigravity-ide/brain/c8d8a110-be07-4f9f-9427-b48272e522f0/screenshots');

async function capture(page, filename, description) {
  console.log(`[Capture] ${filename} - ${description}`);
  await page.waitForTimeout(600);
  const localPath = path.join(OUTPUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 920 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  try {
    // 1. HO Review Modal
    console.log('1. Opening /review and clicking action button...');
    await page.goto(`${BASE_URL}/review`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const hoReviewBtn = page.locator('table tbody tr button').first();
    await hoReviewBtn.click();
    await page.waitForTimeout(800);
    await capture(page, '09_ho_review_detail_modal.png', 'หน้าต่างตรวจรับใบสมัครและผลการคัดกรอง ปปง./คปภ.');

    // 2. Legal Box Modal
    console.log('2. Opening /archive and clicking register box button...');
    await page.goto(`${BASE_URL}/archive`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const boxBtn = page.locator('table tbody tr button:has-text("ลงทะเบียน")').first();
    await boxBtn.click();
    await page.waitForTimeout(800);
    await capture(page, '15_legal_vault_box_modal.png', 'หน้าต่างลงทะเบียนหมายเลขกล่องจัดเก็บเอกสารและเปิดสิทธิ์ถาวร');

    // 3. Agent Full Lifecycle Modal
    console.log('3. Opening / and clicking first table row...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const tableRow = page.locator('table tbody tr').first();
    await tableRow.click();
    await page.waitForTimeout(800);
    await capture(page, '16_agent_full_lifecycle_modal.png', 'หน้าต่างแสดงประวัติสถานะตัวแทนแบบครบวงจรและ Audit Trail');

    console.log('🎉 ALL 3 MODALS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error capturing modals:', err);
  } finally {
    await browser.close();
  }
}

run();
