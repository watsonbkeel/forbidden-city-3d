import * as THREE from 'three';
import { PALACE_LAYOUT } from '../scene/Layout.js';
import { LAYOUT, TELEPORT } from '../config/constants.js';

/**
 * 小地图：按 M 键显示/隐藏，显示当前位置和建筑名称
 */

export class Minimap {
  constructor({ items = [], preview = false, onTeleport = null, onToggle = null } = {}) {
    this.visible = false;
    this.onTeleport = onTeleport;
    this.onToggle = onToggle;
    this.labels = [];
    this.previewEnabled = preview; // 移动端：右上角常驻小地图预览，点击展开全图
    this.lastPreviewDraw = 0;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.playerPosition = new THREE.Vector3();
    this.playerDir = new THREE.Vector3(0, 0, 1);
    this.items = items; // 两侧宫院：{ kind: 'hall'|'gate'|'corridor', name, x, z, w, d }
    
    // 地图范围：取场景边界 LAYOUT.BOUNDARY（宫城外廓 + 街面），竖长方形（与紫禁城南北长、东西窄的比例一致）
    const { minX, maxX, minZ, maxZ } = LAYOUT.BOUNDARY;
    this.worldBounds = { minX, maxX, minZ, maxZ };
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    this.mapSize = 400; // 宽
    this.mapHeight = Math.round(this.mapSize * (spanZ / spanX) * 0.82);
    this.scaleX = this.mapSize / spanX;
    this.scaleZ = this.mapHeight / spanZ;
    
    this.init();
  }
  
  init() {
    // 创建小地图容器
    this.container = document.createElement('div');
    this.container.id = 'minimap';
    this.container.style.cssText = `
      position: fixed;
      top: ${this.previewEnabled ? '42%' : '50%'};
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${this.previewEnabled ? this.mapSize + 'px' : 'min(94vw, 780px)'};
      box-sizing: border-box;
      max-width: 94vw;
      max-height: ${this.previewEnabled ? '68vh' : '96vh'};
      overflow: auto;
      background: rgba(20, 20, 20, 0.92);
      border: 3px solid rgba(255, 215, 100, 0.8);
      border-radius: 8px;
      padding: 16px;
      display: none;
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    `;
    
    // 标题
    const title = document.createElement('div');
    title.textContent = '故宫平面图';
    title.style.cssText = `
      color: #ffd764;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    `;
    this.container.appendChild(title);
    
    // Canvas 地图
    // 视图状态：k = 相对"整图适配"的放大倍数，(cx, cy) = 视口中心对应的地图坐标（地图像素单位）
    this.view = { k: 1, cx: this.mapSize / 2, cy: this.mapHeight / 2 };
    this.viewW = this.mapSize;
    this.viewH = this.mapHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.MAX_K = 8;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.mapSize;
    this.canvas.height = this.mapHeight;
    this.canvas.style.cssText = `
      display: block;
      width: 100%;
      height: ${this.mapHeight}px;
      background: rgba(240, 235, 220, 0.95);
      border: 1px solid rgba(100, 80, 60, 0.4);
      touch-action: none;
      cursor: grab;
    `;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // 缩放工具条
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:6px;justify-content:center;align-items:center;margin-top:8px';
    const mkBtn = (text, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.title = title;
      b.style.cssText = 'min-width:44px;min-height:36px;padding:2px 10px;color:#ffd764;background:#382d20;border:1px solid #9f804a;border-radius:6px;font-size:14px;touch-action:manipulation;cursor:pointer';
      b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
      bar.appendChild(b);
      return b;
    };
    mkBtn('＋', '放大', () => this.zoomBy(1.6));
    mkBtn('－', '缩小', () => this.zoomBy(1 / 1.6));
    mkBtn('定位我', '放大并定位到当前位置', () => this.focusPlayer(3));
    mkBtn('全图', '显示整张平面图', () => this.resetView());
    this.zoomLabel = document.createElement('span');
    this.zoomLabel.style.cssText = 'color:#bbb;font-size:12px;min-width:44px;text-align:center';
    bar.appendChild(this.zoomLabel);
    this.container.appendChild(bar);
    
    // 提示文字
    const hint = document.createElement('div');
    hint.textContent = '滚轮/双指缩放 · 拖动平移 · 点击建筑名称传送 · W/A/S/D 继续走动，Q/E 转向 · 按 M 关闭 · 钦安殿仅设地面外观观览点';
    hint.style.cssText = `
      color: #999;
      font-size: 12px;
      text-align: center;
      margin-top: 8px;
    `;
    this.container.appendChild(hint);
    const quick = document.createElement('div');
    quick.id = 'teleport-points';
    quick.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px';
    TELEPORT.POINTS.forEach((point, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.teleport = point.target;
      button.setAttribute('aria-label', `传送到${point.name}`);
      button.textContent = `${index + 1} ${point.name}`;
      button.style.cssText = 'min-height:44px;padding:4px;color:#ffd764;background:#382d20;border:1px solid #9f804a;border-radius:6px;font-size:12px;touch-action:manipulation';
      button.addEventListener('click', () => { if (this.onTeleport?.(point.target)) this.toggle(); });
      quick.appendChild(button);
    });
    this.container.appendChild(quick);
    
    document.body.appendChild(this.container);
    
    // 监听 M 键
    this._onKeyDown = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggle();
      } else if (this.visible && (e.key === '+' || e.key === '=')) {
        this.zoomBy(1.4);
      } else if (this.visible && (e.key === '-' || e.key === '_')) {
        this.zoomBy(1 / 1.4);
      }
    };
    this._onResize = () => { if (this.visible) { this.resizeCanvas(); this.drawMap(); } };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('keydown', this._onKeyDown);
    
    // 底图只画一次到高分辨率离屏画布，全图和预览都从这里取，避免每帧重绘全部建筑
    this.baseScale = this.previewEnabled ? 4 : 6;   // 放大查看时文字仍然清晰
    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.width = this.mapSize * this.baseScale;
    this.baseCanvas.height = this.mapHeight * this.baseScale;
    this.renderBase();
    
    if (this.previewEnabled) {
      this.createPreview();
      const close = document.createElement('button');
      close.textContent = '关闭地图';
      close.style.cssText = 'display:block;margin:8px auto;min-height:44px;color:#ffd764;background:#33291e;border:1px solid #ffd764;border-radius:6px';
      close.addEventListener('click', () => this.toggle());
      this.container.appendChild(close);
    }
    
    this.bindViewInteraction();
    // 初始绘制
    this.resizeCanvas();
    this.drawMap();
  }

  // ───────────────────────── 缩放 / 平移 ─────────────────────────

  /** 屏幕像素每地图单位（k=1 时整图恰好适配视口） */
  get pxPerUnit() {
    return Math.min(this.viewW / this.mapSize, this.viewH / this.mapHeight) * this.view.k;
  }

  /** 按容器实际宽度重算画布尺寸（竖长地图，限制高度不超过视口 62%） */
  resizeCanvas() {
    const w = this.canvas.clientWidth || this.mapSize;
    const maxH = this.previewEnabled ? window.innerHeight * 0.5 : window.innerHeight * 0.66;
    const h = Math.max(220, Math.min(w * this.mapHeight / this.mapSize, maxH));
    this.viewW = w;
    this.viewH = h;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.clampView();
  }

  clampView() {
    const v = this.view;
    v.k = Math.min(this.MAX_K, Math.max(1, v.k));
    const s = this.pxPerUnit;
    const halfW = this.viewW / 2 / s, halfH = this.viewH / 2 / s;
    // 地图小于视口时居中；否则不允许拖出地图边缘
    v.cx = halfW * 2 >= this.mapSize ? this.mapSize / 2 : Math.min(this.mapSize - halfW, Math.max(halfW, v.cx));
    v.cy = halfH * 2 >= this.mapHeight ? this.mapHeight / 2 : Math.min(this.mapHeight - halfH, Math.max(halfH, v.cy));
  }

  screenToMap(px, py) {
    const s = this.pxPerUnit;
    return { x: (px - this.viewW / 2) / s + this.view.cx, y: (py - this.viewH / 2) / s + this.view.cy };
  }

  mapToScreen(mx, my) {
    const s = this.pxPerUnit;
    return { x: (mx - this.view.cx) * s + this.viewW / 2, y: (my - this.view.cy) * s + this.viewH / 2 };
  }

  /** 以屏幕点 (px, py) 为锚点缩放，保持该点下的地图位置不变 */
  zoomAt(factor, px = this.viewW / 2, py = this.viewH / 2) {
    const before = this.screenToMap(px, py);
    this.view.k = Math.min(this.MAX_K, Math.max(1, this.view.k * factor));
    const s = this.pxPerUnit;
    this.view.cx = before.x - (px - this.viewW / 2) / s;
    this.view.cy = before.y - (py - this.viewH / 2) / s;
    this.clampView();
    this.drawMap();
  }

  zoomBy(factor) { this.zoomAt(factor); }

  resetView() {
    this.view = { k: 1, cx: this.mapSize / 2, cy: this.mapHeight / 2 };
    this.clampView();
    this.drawMap();
  }

  focusPlayer(k = 3) {
    const pm = this.worldToMap(this.playerPosition.x, this.playerPosition.z);
    this.view.k = k;
    this.view.cx = pm.x;
    this.view.cy = pm.y;
    this.clampView();
    this.drawMap();
  }

  bindViewInteraction() {
    const cv = this.canvas;
    const pointers = new Map();
    let dragMoved = 0, lastPinch = 0;
    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const p = local(e);
      this.zoomAt(e.deltaY < 0 ? 1.25 : 1 / 1.25, p.x, p.y);
    }, { passive: false });

    cv.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      cv.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, local(e));
      dragMoved = 0;
      lastPinch = 0;
      cv.style.cursor = 'grabbing';
    });

    cv.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      const cur = local(e);
      pointers.set(e.pointerId, cur);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch > 0) this.zoomAt(dist / lastPinch, (a.x + b.x) / 2, (a.y + b.y) / 2);
        lastPinch = dist;
        dragMoved += 10;
        return;
      }
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      const s = this.pxPerUnit;
      this.view.cx -= dx / s;
      this.view.cy -= dy / s;
      this.clampView();
      this.drawMap();
    });

    const end = (e) => {
      const wasSingle = pointers.size === 1;
      pointers.delete(e.pointerId);
      lastPinch = 0;
      cv.style.cursor = 'grab';
      // 几乎没有拖动 → 视为点击：命中建筑名称则传送
      if (e.type === 'pointerup' && wasSingle && dragMoved < 6) this.handleMapClick(local(e));
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const p = local(e);
      this.zoomAt(2, p.x, p.y);
    });
    cv.addEventListener('click', (e) => e.stopPropagation());
  }

  handleMapClick(p) {
    const m = this.screenToMap(p.x, p.y);
    const tol = 3 / this.view.k;
    const label = [...this.labels].reverse().find(it =>
      Math.abs(m.x - it.x) <= it.width / 2 + tol && Math.abs(m.y - it.y) <= it.height / 2 + tol);
    if (label && this.onTeleport?.(label.name)) this.toggle();
  }
  
  /**
   * 右上角常驻小地图预览（以玩家为中心，北朝上），点击展开全图
   */
  createPreview() {
    const SIZE = 118;
    this.previewSize = SIZE;
    this.previewView = 120; // 预览窗口覆盖的地图像素范围（约 120 米宽）
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    
    this.preview = document.createElement('div');
    this.preview.id = 'minimap-preview';
    this.preview.setAttribute('role', 'button');
    this.preview.style.cssText = `
      position: fixed;
      top: calc(16px + env(safe-area-inset-top, 0px));
      right: calc(16px + env(safe-area-inset-right, 0px));
      width: ${SIZE}px;
      height: ${SIZE}px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(255, 215, 100, 0.85);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
      background: #f0ebdc;
      opacity: 0.92;
      z-index: 1000;
      touch-action: manipulation;
    `;
    this.previewCanvas = document.createElement('canvas');
    this.previewCanvas.width = SIZE * dpr;
    this.previewCanvas.height = SIZE * dpr;
    this.previewCanvas.style.cssText = `display: block; width: ${SIZE}px; height: ${SIZE}px; pointer-events: none;`;
    this.previewCtx = this.previewCanvas.getContext('2d');
    this.preview.appendChild(this.previewCanvas);
    
    const tag = document.createElement('div');
    tag.textContent = '点开全图';
    tag.style.cssText = `
      position: absolute; left: 0; right: 0; bottom: 0;
      padding: 2px 0; text-align: center; font-size: 10px;
      color: #fff; background: rgba(0, 0, 0, 0.45); pointer-events: none;
    `;
    this.preview.appendChild(tag);
    
    this._onPreviewClick = (e) => {
      e.stopPropagation();
      this.toggle();
    };
    this.preview.addEventListener('click', this._onPreviewClick);
    document.body.appendChild(this.preview);
    this.drawPreview();
  }
  
  toggle() {
    this.visible = !this.visible;
    this.onToggle?.(this.visible);
    this.container.style.display = this.visible ? 'block' : 'none';
    if (this.preview) this.preview.style.display = this.visible ? 'none' : 'block';
    document.body.classList.toggle('map-open', this.visible);
    if (this.visible) {
      this.resizeCanvas();
      this.focusPlayer(2);   // 打开即放大到当前位置，文字可读；点「全图」查看整体
    }
  }
  
  /**
   * 世界坐标转地图像素坐标
   */
  worldToMap(x, z) {
    const { minX, maxX, minZ, maxZ } = this.worldBounds;
    // 场景中 -X 是东：地图上北在上、东在右，所以 x 要翻转
    const u = (maxX - x) / (maxX - minX);
    const v = (z - minZ) / (maxZ - minZ);
    return {
      x: u * this.mapSize,
      y: (1 - v) * this.mapHeight,
    };
  }

  /** 世界轴对齐矩形 → 画布矩形（已处理 x 翻转） */
  rectOf(cx, cz, w, d) {
    const a = this.worldToMap(cx + w / 2, cz + d / 2);
    const b = this.worldToMap(cx - w / 2, cz - d / 2);
    return [Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)];
  }

  drawLabel(text, x, y, bold, size = 10, targetName = text, mode) {
    const ctx = this.ctx;
    ctx.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    this.labels.push({ name: targetName, x, y, width: tw + 4, height: size + 2, ...(mode ? { mode } : {}) });
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fillRect(x - tw / 2 - 2, y - size / 2 - 1, tw + 4, size + 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillText(text, x, y);
  }

  drawSideItems() {
    const ctx = this.ctx;
    const style = {
      hall: ['rgba(180, 50, 50, 0.75)', 'rgba(120, 30, 30, 0.9)'],
      gate: ['rgba(215, 120, 60, 0.85)', 'rgba(140, 60, 30, 0.95)'],
      corridor: ['rgba(170, 110, 90, 0.45)', 'rgba(120, 70, 60, 0.6)'],
    };
    for (const it of this.items) {
      const [fill, stroke] = style[it.kind] ?? style.hall;
      for (const footprint of it.footprints ?? [it]) {
        const [x, y, w, h] = this.rectOf(footprint.x, footprint.z, footprint.w, footprint.d);
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, Math.max(w, 1.5), Math.max(h, 1.5));
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.6;
        ctx.strokeRect(x, y, Math.max(w, 1.5), Math.max(h, 1.5));
      }
    }
    // 只标有名字的主要殿宇与门（字号小，避免互相遮挡）
    const placed = [];
    for (const it of this.items) {
      if (!it.name || it.kind === 'corridor') continue;
      const [x, y, w, h] = this.rectOf(it.x, it.z, it.w, it.d);
      const anchor = it.labelAnchor ? this.worldToMap(it.labelAnchor.x, it.labelAnchor.z) : { x: x + w / 2, y: y + h / 2 };
      const cx = anchor.x, cy = anchor.y;
      if (placed.some(p => Math.abs(p.x - cx) < 22 && Math.abs(p.y - cy) < 9)) continue;
      placed.push({ x: cx, y: cy });
      const mode = it.navigation?.mode;
      this.drawLabel(mode === 'exterior-view' ? `${it.name}（外观）` : it.name, cx, cy, it.kind === 'hall', it.kind === 'hall' ? 9 : 8, it.name, mode);
    }
  }
  
  /**
   * 静态底图（建筑/河道/文字）绘制到高分辨率离屏画布，只执行一次
   */
  renderBase() {
    this.labels = [];
    const mainCtx = this.ctx;
    const ctx = this.baseCanvas.getContext('2d');
    ctx.setTransform(this.baseScale, 0, 0, this.baseScale, 0, 0);
    this.ctx = ctx; // drawLabel / drawSideItems 复用 this.ctx
    try {
      this.drawStatic();
    } finally {
      this.ctx = mainCtx;
    }
  }

  drawMap() {
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    const s = this.pxPerUnit;              // 屏幕 css 像素 / 地图单位
    const d = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f0ebdc';
    ctx.fillRect(0, 0, cw, ch);
    // 只截取可见区域的底图（底图分辨率 = baseScale 倍），放大时文字依然清晰
    const bs = this.baseScale;
    const halfW = this.viewW / 2 / s, halfH = this.viewH / 2 / s;
    const sx = (this.view.cx - halfW) * bs, sy = (this.view.cy - halfH) * bs;
    const sw = halfW * 2 * bs, sh = halfH * 2 * bs;
    // 地图小于视口（整图适配的另一维度）时，目标区域要缩进
    const dx0 = Math.max(0, -sx) / bs * s * d, dy0 = Math.max(0, -sy) / bs * s * d;
    const csx = Math.max(0, sx), csy = Math.max(0, sy);
    const cex = Math.min(this.baseCanvas.width, sx + sw), cey = Math.min(this.baseCanvas.height, sy + sh);
    if (cex > csx && cey > csy) {
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.baseCanvas, csx, csy, cex - csx, cey - csy,
        dx0, dy0, (cex - csx) / bs * s * d, (cey - csy) / bs * s * d);
    }
    // 玩家标记：固定屏幕尺寸，不随缩放变大
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const pm = this.mapToScreen(...Object.values(this.worldToMap(this.playerPosition.x, this.playerPosition.z)));
    this.drawPlayer(ctx, pm, 5, 14);
    if (this.zoomLabel) this.zoomLabel.textContent = `${Math.round(this.view.k * 100)}%`;
  }

  /**
   * 预览：以玩家为中心裁一块底图，北朝上
   */
  drawPreview() {
    if (!this.previewCtx) return;
    const ctx = this.previewCtx;
    const cw = this.previewCanvas.width;
    const ch = this.previewCanvas.height;
    const view = this.previewView;
    const pm = this.worldToMap(this.playerPosition.x, this.playerPosition.z);
    const s = this.baseScale;
    ctx.fillStyle = '#f0ebdc';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(this.baseCanvas, (pm.x - view / 2) * s, (pm.y - view / 2) * s, view * s, view * s, 0, 0, cw, ch);
    const k = cw / this.previewSize;
    ctx.save();
    ctx.scale(k, k);
    this.drawPlayer(ctx, { x: this.previewSize / 2, y: this.previewSize / 2 }, 5, 16);
    ctx.fillStyle = 'rgba(120, 30, 30, 0.9)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('北', this.previewSize / 2, 3);
    ctx.restore();
  }

  drawPlayer(ctx, pm, radius, arrowLen) {
    // 视线方向（世界）→ 地图：x 翻转、z 向上
    const len = Math.hypot(this.playerDir.x, this.playerDir.z) || 1;
    const dx = -this.playerDir.x / len;
    const dy = -this.playerDir.z / len;
    // 视野扇形
    const ang = Math.atan2(dy, dx);
    ctx.fillStyle = 'rgba(255, 60, 60, 0.18)';
    ctx.beginPath();
    ctx.moveTo(pm.x, pm.y);
    ctx.arc(pm.x, pm.y, arrowLen * 1.8, ang - 0.6, ang + 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 60, 60, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pm.x, pm.y);
    ctx.lineTo(pm.x + dx * arrowLen, pm.y + dy * arrowLen);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 60, 60, 0.95)';
    ctx.beginPath();
    ctx.arc(pm.x, pm.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawStatic() {
    const ctx = this.ctx;
    const w = this.mapSize;
    const h = this.mapHeight;
    
    // 清空背景
    ctx.fillStyle = '#f0ebdc';
    ctx.fillRect(0, 0, w, h);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(150, 140, 120, 0.2)';
    ctx.lineWidth = 0.5;
    const gridSize = w / 10;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(w, i * gridSize);
      ctx.stroke();
    }
    
    // 绘制中轴建筑（PALACE_LAYOUT）
    for (const item of PALACE_LAYOUT) {
      const { type, position: p, dimensions: d, name } = item;

      if (type === 'moat') {
        const [ox, oy, ow, oh] = this.rectOf(p.x, p.z, d.width, d.depth);
        const [ix, iy, iw, ih] = this.rectOf(p.x, p.z, d.width - d.riverWidth * 2, d.depth - d.riverWidth * 2);
        ctx.fillStyle = 'rgba(80, 140, 200, 0.5)';
        ctx.fillRect(ox, oy, ow, oh);
        ctx.fillStyle = '#f0ebdc';
        ctx.fillRect(ix, iy, iw, ih);
        ctx.strokeStyle = 'rgba(60, 110, 170, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, ow, oh);
        ctx.strokeRect(ix, iy, iw, ih);
        continue;
      }
      if (type === 'outer_wall') {
        const [x, y, rw, rh] = this.rectOf(p.x, p.z, d.width, d.depth);
        ctx.strokeStyle = 'rgba(140, 60, 60, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, rw, rh);
        continue;
      }

      const [x, y, mapW, mapH] = this.rectOf(p.x, p.z, d.width, d.depth);
      let fillColor, strokeColor, showLabel = false;
      if (type === 'palace') {
        fillColor = 'rgba(180, 50, 50, 0.8)'; strokeColor = 'rgba(120, 30, 30, 0.95)'; showLabel = true;
      } else if (type === 'gate') {
        fillColor = 'rgba(200, 80, 80, 0.75)'; strokeColor = 'rgba(140, 50, 50, 0.9)'; showLabel = true;
      } else if (type === 'wall') {
        fillColor = 'rgba(160, 60, 60, 0.5)'; strokeColor = 'rgba(120, 50, 50, 0.7)';
      } else if (type === 'river') {
        fillColor = 'rgba(100, 150, 200, 0.6)'; strokeColor = 'rgba(70, 120, 170, 0.8)';
      } else if (type === 'garden') {
        fillColor = 'rgba(120, 180, 120, 0.6)'; strokeColor = 'rgba(80, 140, 80, 0.8)'; showLabel = true;
      } else {
        fillColor = 'rgba(140, 140, 140, 0.4)'; strokeColor = 'rgba(100, 100, 100, 0.6)';
      }
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, mapW, mapH);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, mapW, mapH);
      if (name && showLabel) this.drawLabel(name, x + mapW / 2, y + mapH / 2, type === 'palace', type === 'palace' ? 11 : 10);
    }

    // 两侧宫院
    this.drawSideItems();

    // 方位
    ctx.fillStyle = 'rgba(100, 40, 40, 0.85)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('北', w / 2, 10);
    ctx.fillText('南', w / 2, h - 10);
    ctx.fillText('东', w - 10, h / 2);
    ctx.fillText('西', 10, h / 2);
  }
  
  update(camera) {
    this.playerPosition.copy(camera.position);
    camera.getWorldDirection(this.playerDir);
    
    if (this.visible) {
      this.drawMap();
    } else if (this.preview) {
      // 预览约 15 fps 刷新就够，省手机性能
      const now = performance.now();
      if (now - this.lastPreviewDraw >= 66) {
        this.lastPreviewDraw = now;
        this.drawPreview();
      }
    }
  }
  
  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
    this.preview?.removeEventListener('click', this._onPreviewClick);
    this.preview?.remove();
    this.container?.remove();
  }
}
