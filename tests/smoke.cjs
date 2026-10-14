const { browserExecutablePath } = require('./lib/browser-path.cjs');
// 冒烟：页面加载完成、无未捕获 JS 异常（pageerror）。console error/warning 只记录不判失败
// （已知：favicon 404、swiftshader "GPU stall due to ReadPixels"）。
// 输出 JSON：{ info, pageerrors, consoleErrors }；有 pageerror 时退出码 1。
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  const pageerrors = [];
  const consoleErrors = [];
  page.on('pageerror', e => pageerrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(m.text()); });
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 120000 });
  const info = await page.evaluate(() => { const a = window.__forbiddenCityApp; return { lib: a.library.loadedFromFile.size, normals: a.library.normals.size, colliders: a.collisionManager.colliders.length }; });
  console.log(JSON.stringify({ info, pageerrors, consoleErrors }, null, 1));
  await browser.close();
  process.exit(pageerrors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
