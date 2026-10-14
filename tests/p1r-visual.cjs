const { browserExecutablePath } = require('./lib/browser-path.cjs');
// 六点同页对照：原SSAO与源网格绘制，对比优化后深度SSAO和跨组批次。
const { chromium } = require('playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.setDefaultTimeout(240000);
  await page.goto(process.env.PALACE_URL);
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none');
  const points = [[0, -470], [0, -74], [0, 195.3], [-120.8, 382.6], [-293.2, 164.1], [0, 433.7]];
  for (let i = 0; i < points.length; i++) {
    await page.evaluate(async ([x, z]) => {
      const a = window.__forbiddenCityApp;
      cancelAnimationFrame(a.animationFrame); a.disposed = true;
      document.querySelector('#welcome-overlay').style.display = 'none';
      a.camera.position.set(x, 1.7, z); a.camera.lookAt(x, 1.7, z + 10); a.camera.updateMatrixWorld(true);
      a.zoneManager.ensureLoadedAt(x, z);
      for (let n = 0; n < 30; n++) a.zoneManager.update({ x, z });
      a.environment.update(a.camera, 0.016);
      a.shadowSetup.updateShadowLOD(a.camera, a.shadowObjects, 150);
      a.postProcessing.render();
    }, points[i]);
    await page.screenshot({ path: path.join('/tmp', `p1r-optimized-${i + 1}.png`) });
    await page.evaluate(async () => {
      const a = window.__forbiddenCityApp;
      const { SSAOPass } = await import('/node_modules/three/examples/jsm/postprocessing/SSAOPass.js');
      const pp = a.postProcessing, composer = pp.composer, modern = pp.ssaoPass;
      const old = new SSAOPass(a.scene, a.camera, modern.width, modern.height);
      for (const key of ['kernelRadius', 'minDistance', 'maxDistance', 'output']) old[key] = modern[key];
      old.kernel = modern.kernel; old.ssaoMaterial.uniforms.kernel.value = modern.kernel;
      old.ssaoMaterial.uniforms.tNoise.value = modern.noiseTexture;
      const index = composer.passes.indexOf(modern); composer.passes[index] = old;
      composer.render();
      composer.passes[index] = modern;
      old.noiseTexture.dispose(); old.ssaoMaterial.dispose(); old.dispose();
    });
    await page.screenshot({ path: path.join('/tmp', `p1r-reference-${i + 1}.png`) });
    console.log(`机位${i + 1} 对照截图完成`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
