import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const BACKUPS_DIR = './backups';
const SCREENSHOTS_DIR = path.join(BACKUPS_DIR, 'screenshots');
const TODAY = new Date().toISOString().slice(0, 10);

fs.mkdirSync(BACKUPS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

console.log('=== Rudolph Schedule 백업 + 검증 시작 ===');

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 }
});
const page = await context.newPage();

console.log('\n[1/5] 페이지 접속 중...');
await page.goto(BASE_URL);
await page.waitForLoadState('networkidle');

console.log('\n[2/5] localStorage 데이터 추출 중...');
const localStorageData = await page.evaluate(() => {
  return {
    rudolph_schedule_data: localStorage.getItem('rudolph_schedule_data'),
    rudolph_dashboard_config: localStorage.getItem('rudolph_dashboard_config'),
    rudolph_theme: localStorage.getItem('rudolph_theme'),
    exportedAt: new Date().toISOString(),
    source: window.location.hostname
  };
});

const backupPath = path.join(BACKUPS_DIR, `localStorage_${TODAY}.json`);
fs.writeFileSync(backupPath, JSON.stringify(localStorageData, null, 2));

let projectCount = 0;
let scheduleCount = 0;
if (localStorageData.rudolph_schedule_data) {
  try {
    const parsed = JSON.parse(localStorageData.rudolph_schedule_data);
    if (Array.isArray(parsed)) {
      projectCount = parsed.length;
      scheduleCount = parsed.reduce((sum, p) => sum + (p.schedules?.length || 0), 0);
    } else {
      projectCount = parsed.projects?.length || 0;
      scheduleCount = parsed.schedules?.length
        || (parsed.projects?.reduce((s, p) => s + (p.schedules?.length || 0), 0) ?? 0);
    }
  } catch (e) {
    console.log(`  파싱 실패: ${e.message}`);
  }
}

console.log(`  프로젝트 수: ${projectCount}`);
console.log(`  일정 수: ${scheduleCount}`);
console.log(`  테마: ${localStorageData.rudolph_theme || '(설정 없음)'}`);
console.log(`  백업 파일: ${backupPath}`);

console.log('\n[3/5] 데스크탑 화면 캡처 중...');
await page.screenshot({
  path: path.join(SCREENSHOTS_DIR, '01-desktop-main.png'),
  fullPage: true
});

let darkmodeCaptured = false;
const themeToggle = page.locator('[aria-label*="다크 모드"], [aria-label*="라이트 모드"]').first();
if (await themeToggle.count() > 0) {
  try {
    await themeToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-desktop-darkmode.png'),
      fullPage: true
    });
    darkmodeCaptured = true;
    await themeToggle.click();
    await page.waitForTimeout(500);
  } catch (e) {
    console.log(`  다크모드 토글 실패: ${e.message}`);
  }
}

console.log('\n[4/5] 모달 화면 캡처 중...');
let modalCaptured = false;
const addBtn = page.locator('button:has-text("프로젝트"), button:has-text("추가"), button[aria-label*="추가"]').first();
if (await addBtn.count() > 0) {
  try {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-desktop-modal.png'),
      fullPage: true
    });
    modalCaptured = true;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' }).catch(() => {});
  } catch (e) {
    console.log(`  모달 캡처 실패: ${e.message}`);
  }
}

console.log('\n[5/5] 모바일 화면 캡처 중...');
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(SCREENSHOTS_DIR, '04-mobile-main.png'),
  fullPage: true
});

await browser.close();

console.log('\n=== 완료 ===');
console.log(`백업 파일: ${backupPath}`);
console.log(`스크린샷 디렉토리: ${SCREENSHOTS_DIR}/`);
console.log(`  - 01-desktop-main.png`);
console.log(`  - 02-desktop-darkmode.png ${darkmodeCaptured ? '' : '(스킵)'}`);
console.log(`  - 03-desktop-modal.png ${modalCaptured ? '' : '(스킵)'}`);
console.log(`  - 04-mobile-main.png`);

console.log(`\n__SUMMARY__`);
console.log(JSON.stringify({
  projectCount,
  scheduleCount,
  theme: localStorageData.rudolph_theme || null,
  darkmodeCaptured,
  modalCaptured,
  backupPath
}));
