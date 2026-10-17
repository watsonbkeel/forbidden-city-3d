const { browserExecutablePath } = require('./lib/browser-path.cjs');
const { gateProbeSamples } = require('./lib/gate-probes.cjs');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const ANCHORS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/anchors.json'), 'utf8'));

// 测试点位（P0c-2 起为真实米制，全部从 LAYOUT / anchors.json 推导；原点太和殿中心，+Z 北，x 负=东）
async function loadPoints() {
  const { LAYOUT } = await import(pathToFileURL(path.join(ROOT, 'src/config/constants.js')).href);
  const qinan = ANCHORS['钦安殿'];
  const gates = [LAYOUT.WUMEN_Z, LAYOUT.TAIHE_GATE_Z, LAYOUT.QIANQING_GATE_Z, LAYOUT.SHENWU_Z];
  return {
    // 四座门楼（午门 / 太和门 / 乾清门 / 神武门）中轴门洞：x=0、门中心 ±GATE_SAMPLE_HALF 逐 0.5m 采样
    gates,
    // 神武门中心542 + 18恰为世界北边界560；该点测试的是边界墙，而非门洞。
    // 仅裁去玩家半径越界的采样点，保留两侧门面和所有合法的0.5m采样；锚点超差仍由anchor-check独立报错。
    gateSamples: gates.map(z => gateProbeSamples(z, GATE_SAMPLE_HALF, LAYOUT.BOUNDARY)),
    // 午门：侧墙实体与雁翅楼间空地（相对午门中心的偏移见 src/scene/palace/gate.js 头注释）
    wumenZ: LAYOUT.WUMEN_Z,
    // 金水河：中桥 x=0，侧桥间距 = 河宽×0.15（Layout.js 河宽 100 → 15m），x=10 落在中桥与第一座侧桥之间的水面
    riverZ: LAYOUT.JINSHUI_RIVER_Z,
    // 御花园钦安殿（亭台底座碰撞）
    pavilion: [qinan.x, qinan.z],
    // 桌面截图机位：金水桥南 20m 望太和殿（P0b 机位 z=-120 即旧桥南 20m）
    shotZ: LAYOUT.JINSHUI_RIVER_Z - 20,
  };
}

const GATE_SAMPLE_HALF = 18;     // 门洞采样半长（m），覆盖午门进深 25 + 前后余量
const WUMEN_SIDE_WALL_DX = 15;   // 午门中门洞与东/西掖门之间的实体墙（gate.js：中门 ±4.5、掖门 ±[15,20]）
// 午门凹口中部空地（相对午门中心 dx, dz；世界 (25, −439.6)）。R2：P1-Z-axis 凹形墩台翼内皮 ±38.5 会吃掉原 [40,−14]；
// R2 原提 [30,−20] 在 main 几何下落在估值朝房（x 29–39，P1-Z-axis A1 移除）内，取 25 两边都是空地。
const WUMEN_WING_GAP = [25, -20];
const RIVER_WATER_X = 10;        // 金水河水面（中桥半宽 2.4 与 x=15 侧桥之间）
const BRIDGE_RAIL_X = 2.5;       // 中桥东侧桥栏（桥宽 5，栏杆位于 ±(2.5−0.1)）

// 使用已有本地服务与系统 Chrome，不安装依赖或请求任何付费服务。
(async () => {
  const P = await loadPoints();
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const results = [];
  const errors = [];
  const check = (name, value) => { assert.ok(value, name); results.push({ name, passed: true }); };
  const outputDir = path.resolve(__dirname, '../../outputs');
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
    await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none');
    check('页面加载完成且只有一个画布', await page.evaluate(() => document.querySelectorAll('#scene-canvas').length === 1));
    // Exercise the actual menu click callback, not only app.toggleQuality().
    // The old callback assigned the selected setting and then inverted it again.
    await page.keyboard.press('Escape');
    await page.locator('#quality-toggle-btn').click();
    check('桌面设置按钮选择低画质后渲染与标签一致', await page.evaluate(() => {
      const a = window.__forbiddenCityApp;
      return a.currentQuality === 'low' && a.settingsMenu.currentQuality === 'low' &&
        document.querySelector('#quality-toggle-btn').textContent === '低画质' &&
        a.renderer.getPixelRatio() === 1 && a.postProcessing.ssaoPass === null &&
        a.environment.dirLight.shadow.mapSize.width === 512;
    }));
    await page.locator('#quality-toggle-btn').click();
    check('桌面设置按钮再次选择高画质后渲染与标签一致', await page.evaluate(() => {
      const a = window.__forbiddenCityApp;
      return a.currentQuality === 'high' && a.settingsMenu.currentQuality === 'high' &&
        document.querySelector('#quality-toggle-btn').textContent === '高画质' &&
        a.renderer.getPixelRatio() === 2 && a.postProcessing.ssaoPass !== null &&
        a.environment.dirLight.shadow.mapSize.width === 2048;
    }));
    await page.keyboard.press('Escape');
    const geometry = await page.evaluate(async ({ P, C }) => {
      const a = window.__forbiddenCityApp;
      const THREE = await import('/node_modules/three/build/three.module.js');
      const v = (x, z) => new THREE.Vector3(x, 1.7, z);
      // 分区流式加载：下面要查询远离出生点的碰撞（如御花园钦安殿），先确保这些点所在分区已加载
      for (const z of P.gates) a.zoneManager?.ensureLoadedAt(0, z);
      a.zoneManager?.ensureLoadedAt(P.pavilion[0], P.pavilion[1]);
      const through = P.gateSamples.every(samples => {
        for (const sample of samples) if (a.collisionManager.checkCollision(v(0, sample))) return false;
        return true;
      });
      const ray = new THREE.Raycaster(new THREE.Vector3(C.RIVER_WATER_X, 10, P.riverZ), new THREE.Vector3(0, -1, 0));
      const ground = a.environment.objects.find(o => o.isMesh && o !== a.environment.sky);
      const groundHits = ray.intersectObject(ground);
      const riverHits = ray.intersectObjects(a.scene.children, true).filter(hit => hit.object.material === a.palaceBuilder.materials.water);
      return {
        gates: through,
        wall: a.collisionManager.checkCollision(v(C.WUMEN_SIDE_WALL_DX, P.wumenZ)),
        wingGap: !a.collisionManager.checkCollision(v(C.WUMEN_WING_GAP[0], P.wumenZ + C.WUMEN_WING_GAP[1])),
        riverVisible: groundHits.length === 0 && riverHits.length > 0,
        waterBlocked: a.collisionManager.checkCollision(v(C.RIVER_WATER_X, P.riverZ)),
        bridge: !a.collisionManager.checkCollision(v(0, P.riverZ)),
        rail: a.collisionManager.checkCollision(v(C.BRIDGE_RAIL_X, P.riverZ)),
        pavilion: a.collisionManager.checkCollision(v(P.pavilion[0], P.pavilion[1])),
        trees: a.collisionManager.colliders.length > 50,
        textures: Object.values(a.palaceBuilder.textures).every(t => t.colorSpace === THREE.SRGBColorSpace),
        colliderCount: a.collisionManager.colliders.length,
      };
    }, { P, C: { GATE_SAMPLE_HALF, WUMEN_SIDE_WALL_DX, WUMEN_WING_GAP, RIVER_WATER_X, BRIDGE_RAIL_X } });
    for (const [key, name] of Object.entries({ gates: '四座门楼中轴通道可通过', wall: '门楼侧墙保持阻挡', wingGap: '午门翼楼旁空地无空气墙', riverVisible: '地面河道开孔且射线命中水面', waterBlocked: '桥外水域不能步行', bridge: '中央桥可通行', rail: '桥栏阻止横向穿过', pavilion: '御花园亭台底座参与碰撞', trees: '花园实体碰撞已注册', textures: '颜色纹理均声明sRGB' })) check(name, geometry[key]);
    const render = await page.evaluate(() => {
      const a = window.__forbiddenCityApp;
      let disposed = 0;
      a.postProcessing.composer.renderTarget1.addEventListener('dispose', () => disposed++);
      a.postProcessing.composer.renderTarget2.addEventListener('dispose', () => disposed++);
      a.toggleQuality();
      const low = a.renderer.getPixelRatio() === 1 && a.environment.dirLight.shadow.mapSize.width === 512 && a.postProcessing.ssaoPass === null && a.postProcessing.bloomPass === null;
      a.toggleQuality();
      a.onResize();
      const size = a.renderer.getSize(a.camera.position.clone());
      const dpr = a.renderer.getPixelRatio();
      const high = dpr === 2 && a.environment.dirLight.shadow.mapSize.width === 2048 && a.postProcessing.ssaoPass.normalRenderTarget.width === size.x * dpr;
      a.postProcessing.render();
      const stable = a.renderer.info.memory.textures;
      const samples = [];
      for (let i = 0; i < 6; i++) { a.toggleQuality(); a.postProcessing.render(); samples.push(a.renderer.info.memory.textures); }
      return { low, high, disposed, textureBefore: stable, textureAfter: a.renderer.info.memory.textures, samples };
    });
    check('低画质同步降低阴影和像素比并禁用昂贵效果', render.low);
    check('Retina尺寸在resize后保持正确', render.high);
    check('旧Composer两个渲染目标均被释放', render.disposed === 2);
    // 检查纹理数量不随重复切换线性累积，容许第一次渲染延迟创建。
    console.log('RENDER_RESOURCE_SAMPLES', JSON.stringify(render));
    check('重复画质切换无纹理数量线性累积', render.textureAfter <= render.textureBefore && render.samples[1] === render.samples[3] && render.samples[3] === render.samples[5]);
    const controls = await page.evaluate(() => {
      const c = window.__forbiddenCityApp.controls;
      c.controls.isLocked = true;
      c.onKeyDown({ code: 'KeyW' }); c.onKeyDown({ code: 'ArrowUp' }); c.onKeyUp({ code: 'KeyW' });
      const dualKey = c.moveForward;
      c.velocity.set(2, 0, 5);
      c.controls.dispatchEvent({ type: 'unlock' });
      c.controls.isLocked = false;
      return { dualKey, stopped: c.velocity.lengthSq() === 0 };
    });
    check('同方向多键松开一键仍可移动', controls.dualKey);
    check('解锁立即停止惯性移动', controls.stopped);
    await page.evaluate(({ shotZ }) => { const a = window.__forbiddenCityApp; a.controls.setPosition(0, 1.7, shotZ); a.controls.lookAt(0, 0); document.querySelector('#welcome-overlay').style.display = 'none'; a.environment.update(a.camera); a.postProcessing.render(); }, { shotZ: P.shotZ });
    // SwiftShader at desktop DPR=2 can need more than Playwright's 30s default.
    await page.screenshot({ path: path.join(outputDir, '故宫修复后-桌面.png'), timeout: 120000 });
    await context.close();

    const mobileContext = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile' });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
    await mobile.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none');
    check('移动端首次加载即使用低画质阴影与像素比', await mobile.evaluate(() => { const a = window.__forbiddenCityApp; return a.isMobile && a.currentQuality === 'low' && a.renderer.getPixelRatio() === 1 && a.environment.dirLight.shadow.mapSize.width === 512; }));
    await mobile.keyboard.press('Escape');
    check('移动端打开设置显示实际低画质', await mobile.evaluate(() => {
      const a = window.__forbiddenCityApp;
      return a.settingsMenu.currentQuality === a.currentQuality &&
        document.querySelector('#quality-toggle-btn').textContent === '低画质';
    }));
    await mobile.locator('#quality-toggle-btn').click();
    check('移动端设置按钮选择高画质实际生效', await mobile.evaluate(() => {
      const a = window.__forbiddenCityApp;
      return a.currentQuality === 'high' && a.settingsMenu.currentQuality === 'high' &&
        document.querySelector('#quality-toggle-btn').textContent === '高画质' &&
        a.renderer.getPixelRatio() === a.getPixelRatio('high') && a.postProcessing.ssaoPass !== null &&
        a.environment.dirLight.shadow.mapSize.width === 2048;
    }));
    await mobile.locator('#quality-toggle-btn').click();
    check('移动端设置按钮返回低画质实际生效', await mobile.evaluate(() => {
      const a = window.__forbiddenCityApp;
      return a.currentQuality === 'low' && a.settingsMenu.currentQuality === 'low' &&
        document.querySelector('#quality-toggle-btn').textContent === '低画质' &&
        a.renderer.getPixelRatio() === 1 && a.postProcessing.ssaoPass === null &&
        a.environment.dirLight.shadow.mapSize.width === 512;
    }));
    await mobile.keyboard.press('Escape');
    const session = await mobileContext.newCDPSession(mobile);
    const left = { x: 100, y: 320, id: 2 };
    const right = { x: 650, y: 180, id: 1 };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [right] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [right, left] });
    check('右手先转视角再左手摇杆仍可启动', await mobile.evaluate(() => window.__forbiddenCityApp.controls.joystick.isActive()));
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...right, x: 670 }, { ...left, y: 285 }] });
    check('双指同时操作保留左手移动偏移', await mobile.evaluate(() => window.__forbiddenCityApp.controls.joystick.getDelta().y < 0));
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [left] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...left, y: 285 }] });
    const before = await mobile.evaluate(() => ({ x: window.__forbiddenCityApp.controls.joystick.baseX, y: window.__forbiddenCityApp.controls.joystick.baseY, delta: window.__forbiddenCityApp.controls.joystick.getDelta().y }));
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...left, y: 285 }, right] });
    const after = await mobile.evaluate(() => ({ x: window.__forbiddenCityApp.controls.joystick.baseX, y: window.__forbiddenCityApp.controls.joystick.baseY, delta: window.__forbiddenCityApp.controls.joystick.getDelta().y }));
    check('左手先移动再加入右手不重置摇杆基点', JSON.stringify(before) === JSON.stringify(after));
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    check('松开手指摇杆清零', await mobile.evaluate(() => { const j = window.__forbiddenCityApp.controls.joystick; return !j.isActive() && j.getDelta().y === 0; }));
    await mobile.screenshot({ path: path.join(outputDir, '故宫修复后-移动端.png'), timeout: 120000 });
    check('销毁后控制界面和场景节点释放', await mobile.evaluate(() => { const a = window.__forbiddenCityApp; a.dispose(); return a.scene.children.length === 0 && !document.querySelector('.look-lock-button') && !document.querySelector('.joystick-base') && !document.querySelector('#scene-canvas'); }));
    await mobileContext.close();
    check('浏览器无未捕获JavaScript错误', errors.length === 0);
    fs.writeFileSync(path.join(outputDir, 'regression-results.json'), JSON.stringify({ results, geometry, render, errors }, null, 2));
    console.log(JSON.stringify({ passed: results.length, geometry, render, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
