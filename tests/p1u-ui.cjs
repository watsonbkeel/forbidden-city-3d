const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const failures = [];
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext(mobile ? devices['iPhone 13'] : { viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.goto(process.env.PALACE_URL);
      await page.waitForFunction(() => window.__forbiddenCityApp?.teleport && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 120000 });
      await page.evaluate(() => {
        document.querySelector('#welcome-overlay').style.display = 'none';
        const app = window.__forbiddenCityApp;
        app.perfHUD?.dispose();
      });
      if (!mobile) {
        for (let index = 1; index <= 8; index++) {
          await page.keyboard.press(String(index));
          const passed = await page.evaluate(async index => {
            const { TELEPORT } = await import('/src/config/constants.js');
            return window.__forbiddenCityApp.teleport.lastPoint?.name === TELEPORT.POINTS[index - 1].target;
          }, index);
          if (!passed) failures.push(`数字键${index}`);
        }
        await page.keyboard.press('m');
        const click = await page.evaluate(() => {
          const map = window.__forbiddenCityApp.minimap;
          const label = map.labels.find(it => it.name === '太和殿');
          const rect = map.canvas.getBoundingClientRect();
          return { x: rect.left + label.x * rect.width / map.mapSize, y: rect.top + label.y * rect.height / map.mapHeight };
        });
        await page.mouse.click(click.x, click.y);
        assert.equal(await page.evaluate(() => window.__forbiddenCityApp.teleport.lastPoint.name), '太和殿');
      } else {
        await page.locator('#minimap-preview').tap();
        await page.locator('#teleport-points').scrollIntoViewIfNeeded();
        const boxes = await page.locator('#teleport-points button').evaluateAll(buttons => buttons.map(button => {
          const r = button.getBoundingClientRect();
          return { width: r.width, height: r.height };
        }));
        assert.equal(boxes.length, 8);
        assert.ok(boxes.every(box => box.width >= 44 && box.height >= 44));
        const joystickClear = await page.evaluate(() => {
          const map = document.querySelector('#minimap').getBoundingClientRect();
          const joystick = window.__forbiddenCityApp.controls.joystick.base.getBoundingClientRect();
          return map.bottom <= joystick.top;
        });
        assert.ok(joystickClear, '地图不能遮挡摇杆');
        await page.screenshot({ path: '/Users/watson/Documents/Codex/故宫/outputs/dev/p1u-mobile-map.png' });
        await page.locator('[data-teleport="景仁宫"]').tap();
        assert.equal(await page.evaluate(() => window.__forbiddenCityApp.teleport.lastPoint?.name), '景仁宫');
        await page.screenshot({ path: '/Users/watson/Documents/Codex/故宫/outputs/dev/p1u-mobile-landed.png' });
      }
      console.log(`${mobile ? '移动端' : '桌面端'}入口验证完成`);
      await context.close();
    }
    assert.deepEqual(failures, [], '快捷键传送失败');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
