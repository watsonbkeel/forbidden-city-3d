// 御花园四亭取点验证探针：测试新锚点坐标下四条路线的可走性
// 用法：PORT=5190 tools/run-with-vite.sh node tests/garden-pavilion-probe.cjs
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..');
const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/anchors.json'), 'utf8'));

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });

  const result = await page.evaluate(async (anchors) => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true;

    const wanchun = anchors['万春亭'];
    const qianqiu = anchors['千秋亭'];
    const fubi = anchors['浮碧亭'];
    const chengrui = anchors['澄瑞亭'];
    
    // 御花园南园墙 z（从 constants.js IMPERIAL_GARDEN_Z - 95.6/2）
    const gz0 = 470.5 - 95.6 / 2; // 422.7
    const GARDEN_S_ROAD = 7;
    const GARDEN_PATH_X = 17;
    const PAVILION_APPROACH = 15;
    
    // 测试四条路线的关键取点
    const testPoints = [
      // 路线 20：御花园→万春亭（东侧）
      { name: '万春亭南接近点', x: wanchun.x, z: wanchun.z - PAVILION_APPROACH },
      { name: '万春亭', x: wanchun.x, z: wanchun.z },
      
      // 路线 21：御花园→千秋亭（西侧）
      { name: '千秋亭南接近点', x: qianqiu.x, z: qianqiu.z - PAVILION_APPROACH },
      { name: '千秋亭', x: qianqiu.x, z: qianqiu.z },
      
      // 路线 22：御花园→浮碧亭（东北池中）
      { name: '浮碧亭南接近点', x: fubi.x, z: gz0 + GARDEN_S_ROAD },
      { name: '浮碧亭', x: fubi.x, z: fubi.z },
      
      // 路线 23：御花园→澄瑞亭（西北池中）
      { name: '澄瑞亭南接近点', x: chengrui.x, z: gz0 + GARDEN_S_ROAD },
      { name: '澄瑞亭', x: chengrui.x, z: chengrui.z },
    ];

    const results = [];
    for (const pt of testPoints) {
      a.controls.setPosition(pt.x, 1.7, pt.z);
      a.controls.update(0.016);
      const y = a.controls.camera.position.y;
      const walkable = y > 0.5 && y < 10; // 合理的站立高度
      results.push({
        name: pt.name,
        x: Math.round(pt.x * 10) / 10,
        z: Math.round(pt.z * 10) / 10,
        footY: Math.round(y * 100) / 100,
        walkable
      });
    }

    return results;
  }, A);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
