// P1-Z-axis 开发探针：在页面里执行一段表达式并打印结果（JSON）。
// 用法：PORT=5190 tools/run-with-vite.sh node tests/p1zaxis-probe.cjs "<async 函数体，可用 a=app、THREE、imp(path)>"
const { chromium } = require('playwright');

(async () => {
  const body = process.argv[2];
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  const out = await page.evaluate(async src => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true;
    const THREE = await import('/node_modules/three/build/three.module.js');
    const imp = p => import(p);
    // eslint-disable-next-line no-new-func
    const fn = new Function('a', 'THREE', 'imp', `return (async () => { ${src} })();`);
    return fn(a, THREE, imp);
  }, body);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
