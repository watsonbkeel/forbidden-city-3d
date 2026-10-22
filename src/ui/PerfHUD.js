/**
 * 性能面板（F3 切换）：fps、整帧 draw calls / 三角面、显存中的几何体 / 贴图数量、当前 zone / 已加载 zone。
 *
 * 整帧计数：项目用 EffectComposer 多 pass 渲染（RenderPass → SSAO → Bloom → Output → FXAA），
 * renderer.info.autoReset=true 时每个 pass 的 renderer.render() 都会先清零，读到的只是最后一个 pass（FXAA 的 1 次 call）。
 * 所以这里关闭 autoReset，由 update() 在一帧所有 render 结束后读数、再手动 reset，calls/tris 即整帧合计（含阴影贴图 pass）。
 *
 * zoneProvider：可选回调，返回 { current: string, loaded: string[] }；未提供（ZoneManager 尚不存在）时显示 "-"。
 */
const DOM_INTERVAL_MS = 250;
const FPS_WINDOW_MS = 500;

export class PerfHUD {
  constructor(renderer, { zoneProvider = null, characterProvider = null, visible = Boolean(import.meta.env?.DEV), parent = document.body } = {}) {
    this.renderer = renderer;
    this.zoneProvider = zoneProvider;
    this.characterProvider = characterProvider;
    renderer.info.autoReset = false;
    renderer.info.reset();

    this.frame = 0;
    this.lastTime = null;
    this.frameMs = 0;
    this.fps = 0;
    this._fpsFrames = 0;
    this._fpsStart = null;
    this._lastDom = 0;
    this.stats = { calls: 0, tris: 0, geometries: 0, textures: 0 };

    this.el = document.createElement('div');
    this.el.id = 'perf-hud';
    this.el.style.cssText = `
      position: fixed; top: 8px; left: 50%; transform: translateX(-50%);
      padding: 6px 10px; background: rgba(0, 0, 0, 0.65); color: #9f9;
      font: 12px/1.45 Menlo, Consolas, monospace; white-space: pre;
      border-radius: 4px; z-index: 3000; pointer-events: none;
    `;
    parent.appendChild(this.el);
    this.setVisible(visible);

    this._onKeyDown = (event) => {
      if (event.code !== 'F3') return;
      event.preventDefault();
      this.toggle();
    };
    window.addEventListener('keydown', this._onKeyDown);
  }

  setVisible(visible) {
    this.visible = visible;
    this.el.style.display = visible ? 'block' : 'none';
    if (visible) this._render();
  }

  toggle() {
    this.setVisible(!this.visible);
  }

  /** 每帧在所有 render 完成之后调用一次 */
  update(now = performance.now()) {
    const info = this.renderer.info;
    this.stats.calls = info.render.calls;
    this.stats.tris = info.render.triangles;
    this.stats.geometries = info.memory.geometries;
    this.stats.textures = info.memory.textures;
    info.reset();

    this.frame++;
    if (this.lastTime !== null) this.frameMs = now - this.lastTime;
    this.lastTime = now;
    if (this._fpsStart === null) this._fpsStart = now;
    this._fpsFrames++;
    const span = now - this._fpsStart;
    if (span >= FPS_WINDOW_MS) {
      this.fps = (this._fpsFrames * 1000) / span;
      this._fpsFrames = 0;
      this._fpsStart = now;
    }

    if (this.visible && now - this._lastDom >= DOM_INTERVAL_MS) {
      this._lastDom = now;
      this._render();
    }
  }

  getZones() {
    const z = this.zoneProvider?.() ?? null;
    const current = z?.current || '-';
    const loaded = z?.loaded?.length ? z.loaded.join(', ') : '-';
    return { current, loaded };
  }

  /** 当前统计快照（返回新对象，调用方修改不影响面板） */
  snapshot() {
    return {
      frame: this.frame,
      frameMs: +this.frameMs.toFixed(2),
      fps: +this.fps.toFixed(1),
      calls: this.stats.calls,
      tris: this.stats.tris,
      geometries: this.stats.geometries,
      textures: this.stats.textures,
      ...this.getZones(),
      characters: this.characterProvider?.() ?? null,
    };
  }

  _render() {
    const s = this.stats;
    const { current, loaded } = this.getZones();
    this.el.textContent =
      `FPS   ${this.fps.toFixed(1)}  (${this.frameMs.toFixed(1)} ms)\n` +
      `Calls ${s.calls}   Tris ${s.tris.toLocaleString('en-US')}\n` +
      `Geom  ${s.geometries}   Tex ${s.textures}\n` +
      `Zone  ${current}\n` +
      `Loaded ${loaded}`;
    const c = this.characterProvider?.();
    if (c) this.el.textContent += `\nNPC ${c.registered} reg / ${c.loaded} loaded / ${c.visible} visible / ${c.near} near` +
      `\nCopies ${c.renderCopies} / batches ${c.batches} / tris~ ${c.trianglesEstimate}` +
      `\nCPU p50/p95 ${(c.updateP50Ms ?? 0).toFixed(2)}/${(c.updateP95Ms ?? 0).toFixed(2)} ms`;

  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    this.el.remove();
    this.renderer.info.autoReset = true;
  }
}
