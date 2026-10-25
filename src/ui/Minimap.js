import { outerMoatProfile } from '../scene/palace/special/OuterMoat.js';
import { palaceWaterPolygons } from '../scene/palace/special/SouthWaterSystem.js';
import * as THREE from 'three';
import { PALACE_LAYOUT } from '../scene/Layout.js';
import { LAYOUT, TELEPORT } from '../config/constants.js';
import { hasShortcutModifier, isTextEntryTarget } from '../controls/InputTargets.js';
import { PlaceCatalog } from './PlaceCatalog.js';
import { PlaceInfoPanel } from './PlaceInfoPanel.js';

const MAP_HEADINGS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

/**
 * 小地图：按 M 键显示/隐藏，显示当前位置和建筑名称
 */

export class Minimap {
  constructor({ items = [], preview = false, onTeleport = null, onToggle = null, hasTeleportTarget = () => false, worldBounds = LAYOUT.BOUNDARY } = {}) {
    this.visible = false;
    this.compact = false;
    this.compactSectionState = new Map();
    this.onTeleport = onTeleport;
    this.hasTeleportTarget = hasTeleportTarget;
    this.selectedPlaceId = null;
    this.selection = null;
    this.selectionGeneration = 0;
    this.detailVisible = false;
    this.disposed = false;
    // Invalid content degrades to the same safe unknown-place selection.
    try { this.placeCatalog = new PlaceCatalog(); }
    catch (error) { console.warn(error.message); this.placeCatalog = null; }
    this.onToggle = onToggle;
    this.labels = [];
    this.placeFootprints = [];
    this.secondaryTaps = new Map();
    this.suppressedClicks = new Map();
    this.inputCleanup = [];
    this.previewEnabled = preview; // 移动端：右上角常驻小地图预览，点击展开全图
    this.lastPreviewDraw = 0;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.playerPosition = new THREE.Vector3();
    this.playerDir = new THREE.Vector3(0, 0, 1);
    this.items = items; // 两侧宫院：{ kind: 'hall'|'gate'|'corridor', name, x, z, w, d }
    
    // 地图范围：取场景边界 LAYOUT.BOUNDARY（宫城外廓 + 街面），竖长方形（与紫禁城南北长、东西窄的比例一致）
    const { minX, maxX, minZ, maxZ } = worldBounds;
    if (![minX,maxX,minZ,maxZ].every(Number.isFinite) || maxX<=minX || maxZ<=minZ) throw Error('Invalid map bounds');
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
    this.container.className = this.previewEnabled ? 'minimap-touch' : '';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', '故宫平面图');
    this.container.setAttribute('aria-describedby', 'minimap-help');
    this.container.style.cssText = `
      position: fixed;
      box-sizing: border-box;
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
    title.id = 'minimap-title';
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

    const presentation = document.createElement('div');
    presentation.id = 'minimap-presentation';
    const status = document.createElement('div');
    status.id = 'minimap-status';
    this.headingLabel = document.createElement('span');
    this.headingLabel.id = 'minimap-heading';
    this.headingLabel.textContent = '朝向 北';
    this.compactHint = document.createElement('span');
    this.compactHint.id = 'minimap-compact-hint';
    this.compactHint.textContent = '展开查看介绍或传送';
    status.append(this.headingLabel, this.compactHint);
    this.sizeToggle = document.createElement('button');
    this.sizeToggle.id = 'minimap-size-toggle';
    this.sizeToggle.type = 'button';
    this.sizeToggle.textContent = '收起到角落';
    this.sizeToggle.setAttribute('aria-label', '收起地图到角落，继续行走');
    this.sizeToggle.setAttribute('aria-controls', 'minimap-tools teleport-points place-list place-info');
    this.sizeToggle.setAttribute('aria-expanded', 'true');
    this.sizeToggle.addEventListener('click', e => {
      e.stopPropagation();
      this.setCompact(!this.compact);
    });
    presentation.append(status, this.sizeToggle);
    this.container.appendChild(presentation);
    
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
    const moatNotice = document.createElement('p');
    moatNotice.id = 'minimap-moat-status';
    moatNotice.textContent = '筒子河五段水面（工程拟合）；南侧中央保留陆地通道，非考证桥梁。飞行禁降沿实际水面保守判定。';
    moatNotice.style.cssText = 'font-size:11px;line-height:1.4;margin:4px 0';
    this.container.appendChild(moatNotice);
    this.ctx = this.canvas.getContext('2d');

    // 缩放工具条
    const bar = document.createElement('div');
    bar.id = 'minimap-tools';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin-top:8px';
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
    hint.id = 'minimap-help';
    hint.textContent = '滚轮/双指缩放 · 宫殿名优先，放大查看更多 · 拖动平移 · 点击名称看介绍，再点前往 · 方向键/WASD/摇杆继续走动，Q/E 转向 · 按 M 或关闭按钮退出 · 钦安殿保留地面观览落点，可沿两侧台阶进入虚拟展示；游戏入殿路线不代表现实开放';
    hint.style.cssText = `
      color: #999;
      font-size: 12px;
      text-align: center;
      margin-top: 8px;
    `;
    this.container.appendChild(hint);
    const quick = document.createElement('div');
    quick.id = 'teleport-points';
    quick.style.cssText = 'display:grid;gap:6px;margin-top:10px';
    quick.setAttribute('role', 'group');
    quick.setAttribute('aria-label', '快捷传送');
    const quickTitle = document.createElement('h2');
    quickTitle.id = 'teleport-heading';
    quickTitle.textContent = '快捷传送';
    this.container.appendChild(quickTitle);
    TELEPORT.POINTS.forEach((point, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.teleport = point.target;
      button.setAttribute('aria-label', `前往${point.name}`);
      button.textContent = `${index + 1} 前往${point.name}`;
      button.style.cssText = 'min-height:44px;padding:4px;color:#ffd764;background:#382d20;border:1px solid #9f804a;border-radius:6px;font-size:12px;touch-action:manipulation';
      button.addEventListener('click', () => { if (this.onTeleport?.(point.target)) this.toggle(); });
      quick.appendChild(button);
    });
    this.container.appendChild(quick);
    this.initPlaceInformation();
    this.mapSections = [title, this.canvas, bar, hint, quickTitle, quick, this.placeList, this.resumePlace];
    this.compactSections = [title, bar, hint, quickTitle, quick, this.placeList, this.resumePlace];
    
    document.body.appendChild(this.container);
    
    // 监听 M 键
    this._onKeyDown = (e) => {
      if (e.defaultPrevented || e.repeat || hasShortcutModifier(e) || isTextEntryTarget(e.target)) return;
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        this.toggle();
      } else if (this.visible && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        this.zoomBy(1.4);
      } else if (this.visible && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        this.zoomBy(1 / 1.4);
      }
    };
    this._onResize = () => { if (this.visible) { this.resizeCanvas(); this.drawMap(); } };
    window.addEventListener('resize', this._onResize);
    window.visualViewport?.addEventListener('resize', this._onResize);
    window.addEventListener('keydown', this._onKeyDown);
    
    // Cache the high-resolution base map; only a changed label scale rebuilds
    // it, so walking and panning do not redraw every building each frame.
    this.baseScale = this.previewEnabled ? 4 : 6;   // 放大查看时文字仍然清晰
    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.width = this.mapSize * this.baseScale;
    this.baseCanvas.height = this.mapHeight * this.baseScale;
    this.renderBase();
    
    if (this.previewEnabled) this.createPreview();
    const close = document.createElement('button');
    close.id = 'minimap-close';
    close.type = 'button';
    close.textContent = '关闭地图';
    close.style.cssText = 'display:block;margin:8px auto;min-height:44px;color:#ffd764;background:#33291e;border:1px solid #ffd764;border-radius:6px';
    close.addEventListener('click', () => this.toggle());
    this.closeButton = close;
    this.container.appendChild(close);
    this.bindSecondaryTaps(this.container);
    if (this.preview) this.bindSecondaryTaps(this.preview);
    this.bindViewInteraction();
    // 初始绘制
    this.resizeCanvas();
    this.drawMap();
  }

  initPlaceInformation() {
    this.placeList = document.createElement('section');
    this.placeList.id = 'place-list';
    const heading = document.createElement('h2');
    heading.textContent = '地点介绍';
    this.placeList.appendChild(heading);
    const search = document.createElement('input');
    search.id = 'place-search'; search.type = 'search'; search.value = '';
    search.placeholder = '搜索地点名称';
    search.setAttribute('aria-label', '搜索地点名称');
    search.setAttribute('aria-controls', 'place-directory');
    const resultCount = document.createElement('p'); resultCount.id = 'place-search-count';
    resultCount.setAttribute('role', 'status'); resultCount.setAttribute('aria-live', 'polite');
    const directory = document.createElement('div'); directory.id = 'place-directory';
    this.placeList.append(search, resultCount, directory);
    const entries = [];
    for (const place of this.placeCatalog?.places ?? []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = place.name;
      button.setAttribute('aria-label', `了解${place.name}`);
      button.addEventListener('click', () => this.showPlace(place.id));
      directory.appendChild(button);
      const names = [place.name, place.canonicalName, ...(place.aliases ?? []).map(alias => alias.name)];
      entries.push({button, names: names.filter(Boolean).map(name => name.normalize('NFKC').toLocaleLowerCase('zh-CN'))});
    }
    const filter = () => {
      const query = search.value.trim().normalize('NFKC').toLocaleLowerCase('zh-CN');
      let count = 0;
      for (const {button, names} of entries) {
        const match = names.some(name => name.includes(query)); button.hidden = button.inert = !match;
        if (match) count++;
      }
      resultCount.textContent = count ? `显示 ${count} / ${entries.length} 个地点` : '未找到匹配地点，请换个名称。';
    };
    search.addEventListener('input', filter); filter();
    this.resumePlace = document.createElement('button');
    this.resumePlace.id = 'place-resume';
    this.resumePlace.type = 'button';
    this.resumePlace.hidden = this.resumePlace.inert = true;
    this.resumePlace.addEventListener('click', () => {
      if (this.selection) this.selectMapLabel(this.selection);
    });
    this.placeHeader = document.createElement('div');
    this.placeHeader.id = 'place-header';
    this.placeHeader.hidden = this.placeHeader.inert = true;
    this.placeBack = document.createElement('button');
    this.placeBack.id = 'place-back';
    this.placeBack.type = 'button';
    this.placeBack.textContent = '返回地图';
    this.placeBack.addEventListener('click', () => this.backToMap());
    this.placeHeader.appendChild(this.placeBack);
    this.placePanel = new PlaceInfoPanel();
    this.placeAnnouncement = document.createElement('div');
    this.placeAnnouncement.id = 'place-announcement';
    this.placeAnnouncement.setAttribute('aria-live', 'polite');
    this.placeAnnouncement.setAttribute('aria-atomic', 'true');
    this.container.append(this.placeList, this.resumePlace, this.placeHeader, this.placePanel.element, this.placeAnnouncement);
  }

  showPlace(id) {
    const place = this.placeCatalog?.get(id);
    if (!place || !this.visible || this.compact || this.disposed) return false;
    this.selectMapLabel({ name: place.name, placeId: id });
    return true;
  }

  canTravelToPlace(name) {
    // Teleport intentionally stays keyed by name. Refuse an ambiguous map
    // identity before consulting it, including labels omitted by decluttering.
    const layouts = PALACE_LAYOUT.filter(item => ['palace', 'gate', 'garden'].includes(item.type) && item.name === name);
    const sides = this.items.filter(item => item.kind !== 'corridor' && item.name === name);
    return layouts.length + sides.length <= 1 && this.labels.filter(label => label.name === name).length <= 1 && this.hasTeleportTarget(name);
  }

  selectMapLabel(label) {
    if (!this.visible || this.compact || this.disposed) return;
    const place = this.placeCatalog?.get(label.placeId);
    // Never match a card by a global display name or an unverified stale ID.
    const selected = place?.name === label.name ? place : null;
    if (this.detailVisible && this.selection?.name === label.name && this.selectedPlaceId === (selected?.id ?? null)) return;
    if (!this.detailVisible) {
      this.mapScrollTop = this.container.scrollTop;
      this.mapReturnFocus = document.activeElement;
    }
    this.cancelMapGesture?.();
    this.secondaryTaps.clear();
    const generation = ++this.selectionGeneration;
    this.selection = { name: label.name, placeId: selected?.id ?? null };
    this.selectedPlaceId = selected?.id ?? null;
    this.detailVisible = true;
    const target = selected?.modelExperience.teleportTargetName ?? label.name;
    const canTravel = this.canTravelToPlace(target);
    const title = this.placePanel.render({ place: selected, name: label.name,
      sources: selected ? this.placeCatalog.sourcesFor(selected) : [], canTravel,
      onTravel: button => {
        if (this.disposed || !this.visible || this.compact || !this.detailVisible ||
            generation !== this.selectionGeneration || !button.isConnected || !this.placePanel.element.contains(button) ||
            !this.canTravelToPlace(target)) return;
        if (this.onTeleport?.(target)) this.toggle();
      },
    });
    for (const node of this.mapSections) node.hidden = node.inert = true;
    this.placeHeader.hidden = this.placeHeader.inert = false;
    this.placePanel.element.hidden = this.placePanel.element.inert = false;
    this.placeHeader.appendChild(this.closeButton);
    this.container.setAttribute('data-detail', 'true');
    this.container.scrollTop = 0;
    this.placeAnnouncement.textContent = `已选择${label.name}`;
    title.focus({ preventScroll: true });
  }

  backToMap(focus = true) {
    if (!this.detailVisible) return;
    this.selectionGeneration++;
    this.secondaryTaps.clear();
    this.detailVisible = false;
    this.placePanel.element.hidden = this.placePanel.element.inert = true;
    this.placeHeader.hidden = this.placeHeader.inert = true;
    this.container.appendChild(this.closeButton);
    for (const node of this.mapSections) node.hidden = node.inert = false;
    this.resumePlace.hidden = this.resumePlace.inert = !this.selection;
    this.resumePlace.textContent = this.selection ? `继续阅读${this.selection.name}` : '';
    this.container.setAttribute('data-detail', 'false');
    this.resizeCanvas(true);
    this.drawMap();
    this.container.scrollTop = this.mapScrollTop ?? 0;
    if (focus) (this.mapReturnFocus?.isConnected && this.container.contains(this.mapReturnFocus) ? this.mapReturnFocus : this.sizeToggle).focus({ preventScroll: true });
  }

  clearPlaceSelection() {
    this.backToMap(false);
    this.selectionGeneration++;
    this.selectedPlaceId = null;
    this.selection = null;
    this.resumePlace.hidden = this.resumePlace.inert = true;
    this.placeAnnouncement.textContent = '';
  }

  // ───────────────────────── 缩放 / 平移 ─────────────────────────

  /** 屏幕像素每地图单位（k=1 时整图恰好适配视口） */
  get pxPerUnit() {
    return Math.min(this.viewW / this.mapSize, this.viewH / this.mapHeight) * this.view.k;
  }

  /** 按容器实际宽度重算画布尺寸（竖长地图，限制高度不超过视口 62%） */
  resizeCanvas(preserveView = false) {
    if (this.detailVisible) return;
    let maxH = window.innerHeight * 0.66;
    this.canvas.hidden = false;
    this.container.setAttribute('data-compact-collapsed', 'false');
    if (this.compact) {
      const viewportH = Math.min(window.innerHeight, window.visualViewport?.height || window.innerHeight);
      const style = window.getComputedStyle?.(this.container);
      const panelH = Math.min(viewportH - (this.previewEnabled ? 200 : 16), parseFloat(style?.maxHeight) || Infinity);
      // Reserve the heading and all three 44px controls. On very short screens,
      // use an explicit control strip rather than clipping controls or touch lanes.
      maxH = Math.max(1, Math.min(144, panelH - 92));
      this.canvas.hidden = maxH < 64;
      this.container.setAttribute('data-compact-collapsed', String(this.canvas.hidden));
    } else if (this.previewEnabled) {
      const viewportH = Math.min(window.innerHeight, window.visualViewport?.height || window.innerHeight);
      const docked = window.innerWidth >= 520 && window.innerWidth > window.innerHeight;
      const panelH = this.container.clientHeight || Math.max(1, viewportH - (docked ? 16 : 208));
      const style = window.getComputedStyle?.(this.container);
      const padding = (parseFloat(style?.paddingTop) || 16) + (parseFloat(style?.paddingBottom) || 16);
      // The panel can scroll, but the interactive canvas itself must fit inside
      // its visible content height, even below the usual 120px mobile minimum.
      maxH = Math.max(1, Math.min(viewportH * 0.5, panelH - padding));
    }
    const w = this.canvas.clientWidth || this.mapSize;
    const minH = this.compact ? 1 : this.previewEnabled ? Math.min(120, maxH) : 220;
    const h = Math.max(minH, Math.min(w * this.mapHeight / this.mapSize, maxH));
    this.viewW = w;
    this.viewH = h;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    if (!preserveView) this.clampView();
  }

  setCompact(compact) {
    if (!this.visible || this.compact === compact) return;
    if (this.detailVisible) {
      this.sizeToggle.focus({ preventScroll: true });
      this.backToMap(false);
    }
    this.selectionGeneration++;
    this.cancelMapGesture();
    this.secondaryTaps.clear();
    this.compact = compact;
    this.container.setAttribute('data-compact', String(compact));
    this.container.setAttribute('aria-describedby', compact ? 'minimap-compact-hint' : 'minimap-help');
    this.sizeToggle.textContent = compact ? '展开地图' : '收起到角落';
    this.sizeToggle.setAttribute('aria-expanded', String(!compact));
    this.sizeToggle.setAttribute('aria-label', compact ? '展开地图，查看详情和传送点' : '收起地图到角落，继续行走');
    for (const element of this.compactSections) {
      if (compact) {
        this.compactSectionState.set(element, { hidden: element.hidden, inert: element.inert });
        if (element.contains(document.activeElement)) this.sizeToggle.focus({ preventScroll: true });
        element.hidden = element.inert = true;
      } else {
        Object.assign(element, this.compactSectionState.get(element));
      }
    }
    if (!compact) this.compactSectionState.clear();
    this.container.scrollTop = 0;
    // This is presentation only: no open/close callback or walking-state change.
    this.resizeCanvas(true);
    this.drawMap();
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

  // A second finger must be able to use map buttons while the first owns the
  // joystick. Native single-contact clicks and keyboard activation stay native.
  bindSecondaryTaps(root) {
    const listen = (type, fn, options) => {
      root.addEventListener(type, fn, options);
      this.inputCleanup.push(() => root.removeEventListener(type, fn, options));
    };
    listen('touchstart', e => {
      if (e.touches.length < 2) return;
      for (const touch of e.changedTouches) {
        const button = touch.target?.closest?.('button, a');
        if (!button || !root.contains(button) || button.id === 'structural-preview-button') continue;
        this.secondaryTaps.set(touch.identifier, { button, x: touch.clientX, y: touch.clientY, time: performance.now() });
      }
    }, { passive: true });
    listen('touchmove', e => {
      for (const touch of e.changedTouches) {
        const tap = this.secondaryTaps.get(touch.identifier);
        if (tap && Math.hypot(touch.clientX - tap.x, touch.clientY - tap.y) > 10) this.secondaryTaps.delete(touch.identifier);
      }
    }, { passive: true });
    const end = e => {
      for (const touch of e.changedTouches) {
        const tap = this.secondaryTaps.get(touch.identifier);
        if (!tap) continue;
        this.secondaryTaps.delete(touch.identifier);
        if (e.type !== 'touchend' || !root.contains(tap.button) || tap.button.closest('[hidden], [inert]') || performance.now() - tap.time > 600 ||
            Math.hypot(touch.clientX - tap.x, touch.clientY - tap.y) > 10) continue;
        e.preventDefault();
        this.suppressedClicks.set(tap.button, performance.now() + 750);
        tap.button.focus();
        tap.button.click();
      }
    };
    listen('touchend', end, { passive: false });
    listen('touchcancel', end, { passive: false });
    listen('click', e => {
      const button = e.target?.closest?.('button, a');
      const until = this.suppressedClicks.get(button);
      if (e.detail > 0 && until !== undefined && performance.now() <= until) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
  }

  bindViewInteraction() {
    const cv = this.canvas;
    const pointers = new Map();
    let dragMoved = 0, lastPinch = 0, multiContact = false;
    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const listen = (type, fn, options) => {
      cv.addEventListener(type, fn, options);
      this.inputCleanup.push(() => cv.removeEventListener(type, fn, options));
    };
    const release = id => {
      if (cv.hasPointerCapture?.(id)) cv.releasePointerCapture(id);
    };
    this.cancelMapGesture = () => {
      const ids = [...pointers.keys()];
      pointers.clear();
      dragMoved = lastPinch = 0;
      multiContact = false;
      cv.style.cursor = 'grab';
      ids.forEach(release);
    };
    listen('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const p = local(e);
      this.zoomAt(e.deltaY < 0 ? 1.25 : 1 / 1.25, p.x, p.y);
    }, { passive: false });
    listen('pointerdown', (e) => {
      if (!this.visible || pointers.has(e.pointerId)) return;
      e.stopPropagation();
      if (pointers.size === 0) { dragMoved = 0; multiContact = false; }
      else multiContact = true;
      pointers.set(e.pointerId, local(e));
      cv.setPointerCapture?.(e.pointerId);
      lastPinch = 0;
      cv.style.cursor = 'grabbing';
    });
    listen('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      const cur = local(e);
      pointers.set(e.pointerId, cur);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch > 0) this.zoomAt(dist / lastPinch, (a.x + b.x) / 2, (a.y + b.y) / 2);
        lastPinch = dist;
        return;
      }
      if (pointers.size > 2) return;
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      const s = this.pxPerUnit;
      this.view.cx -= dx / s;
      this.view.cy -= dy / s;
      this.clampView();
      this.drawMap();
    });
    const end = (e) => {
      if (!pointers.has(e.pointerId)) return;
      const canTap = e.type === 'pointerup' && pointers.size === 1 && !multiContact && dragMoved < 6;
      pointers.delete(e.pointerId);
      if (e.type !== 'pointerup') multiContact = true;
      lastPinch = 0;
      cv.style.cursor = pointers.size ? 'grabbing' : 'grab';
      release(e.pointerId);
      if (canTap) this.handleMapClick(local(e));
      if (pointers.size === 0) multiContact = false;
    };
    listen('pointerup', end);
    listen('pointercancel', end);
    listen('lostpointercapture', end);
    listen('dblclick', (e) => {
      e.stopPropagation();
      const p = local(e);
      this.zoomAt(2, p.x, p.y);
    });
    listen('click', (e) => e.stopPropagation());
  }

  handleMapClick(p) {
    // A small navigation map must not turn an imprecise tap into travel.
    if (!this.visible || this.compact || this.detailVisible || this.disposed) return;
    const m = this.screenToMap(p.x, p.y);
    const tol = 3 / this.view.k;
    const label = [...this.labels].reverse().find(it =>
      Math.abs(m.x - it.x) <= it.width / 2 + tol && Math.abs(m.y - it.y) <= it.height / 2 + tol);
    if (label) { this.selectMapLabel(label); return; }
    // Label decluttering must not make a visible building unselectable. Only
    // exact source-bound footprints may open a card; an ambiguous overlap does
    // nothing. Selection still never travels without the separate card action.
    const hits = this.placeFootprints.filter(it =>
      m.x >= it.x && m.x <= it.x + it.width && m.y >= it.y && m.y <= it.y + it.height);
    const places = new Map(hits.map(it => [it.placeId, it]));
    if (places.size === 1) this.selectMapLabel(places.values().next().value);
  }
  
  /**
   * 右上角常驻小地图预览（以玩家为中心，北朝上），点击展开全图
   */
  createPreview() {
    const SIZE = 118;
    this.previewSize = SIZE;
    this.previewView = 120; // 预览窗口覆盖的地图像素范围（约 120 米宽）
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    
    this.preview = document.createElement('button');
    this.preview.type = 'button';
    this.preview.id = 'minimap-preview';
    this.preview.setAttribute('aria-label', '打开故宫平面图');
    this.preview.setAttribute('aria-controls', 'minimap');
    this.preview.setAttribute('aria-expanded', 'false');
    this.preview.style.cssText = `
      padding: 0;
      cursor: pointer;
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
    if (this.visible && this.compact) this.setCompact(false);
    this.visible = !this.visible;
    if (this.visible) this.previousFocus = document.activeElement;
    else {
      this.cancelMapGesture();
      this.secondaryTaps.clear();
      this.clearPlaceSelection();
    }
    this.preview?.setAttribute('aria-expanded', String(this.visible));
    this.onToggle?.(this.visible);
    this.container.style.display = this.visible ? 'block' : 'none';
    if (this.preview) this.preview.style.display = this.visible ? 'none' : 'block';
    document.body.classList.toggle('map-open', this.visible);
    if (this.visible) {
      this.resizeCanvas();
      this.focusPlayer(2);   // 打开即放大到当前位置，文字可读；点「全图」查看整体
    } else if (this.previousFocus?.isConnected) {
      this.previousFocus.focus();
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

  drawLabel(text, x, y, bold, size = 10, targetName = text, mode, placeId = null, unitScale = 1) {
    if (this.labelQueue) {
      this.labelQueue.push({ text, x, y, bold, size, targetName, mode, placeId });
      return;
    }
    const ctx = this.ctx;
    ctx.font = `${bold ? 'bold ' : ''}${size * unitScale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    const tw = Math.max(...lines.map(line => ctx.measureText(line).width)) / unitScale;
    const textHeight = size * lines.length;
    const pad = 1 / unitScale;
    const label = { name: targetName, placeId, x, y, width: tw + 4 * pad, height: textHeight + 2 * pad, ...(mode ? { mode } : {}) };
    this.labels.push(label);
    const paint = { ...label, text, bold, size };
    this.labelPaintRecords?.push(paint);
    if (!this.deferLabelPaint) this.paintLabel(ctx, paint, x, y, 1);
  }

  paintLabel(ctx, label, x, y, scale) {
    const size = label.size * scale, lines = label.text.split('\n');
    ctx.font = `${label.bold ? 'bold ' : ''}${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fillRect(x - label.width * scale / 2, y - label.height * scale / 2, label.width * scale, label.height * scale);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    lines.forEach((line, index) => ctx.fillText(line, x, y + (index - (lines.length - 1) / 2) * size));
  }

  drawLabels(ctx, toScreen, scale, width, height) {
    for (const label of this.labelPaintRecords ?? []) {
      const p = toScreen(label.x, label.y);
      const halfW = label.width * scale / 2, halfH = label.height * scale / 2;
      if (p.x + halfW < 0 || p.x - halfW > width || p.y + halfH < 0 || p.y - halfH > height) continue;
      // Paint at screen resolution, never enlarge glyphs baked into the map.
      this.paintLabel(ctx, label, p.x, p.y, scale);
    }
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
      if (it.historicalSite) {
        const point = this.worldToMap(it.x, it.z);
        ctx.strokeStyle = stroke; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2); ctx.stroke();
        continue;
      }
      const place = this.placeCatalog?.forMapItem(it, this.items);
      for (const footprint of it.footprints ?? [it]) {
        const [x, y, w, h] = this.rectOf(footprint.x, footprint.z, footprint.w, footprint.d);
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, Math.max(w, 1.5), Math.max(h, 1.5));
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.6;
        ctx.strokeRect(x, y, Math.max(w, 1.5), Math.max(h, 1.5));
        if (place && [x, y, w, h].every(Number.isFinite) && w > 0 && h > 0) {
          this.placeFootprints.push({ name: it.name, placeId: place.id, x, y, width: Math.max(w, 1.5), height: Math.max(h, 1.5) });
        }
      }
    }
    // Keep every candidate. Palace/gate priority and measured text collisions
    // are resolved together, after all building footprints have been painted.
    for (const it of this.items) {
      if (!it.name || it.kind === 'corridor') continue;
      const [x, y, w, h] = this.rectOf(it.x, it.z, it.w, it.d);
      const anchor = it.labelAnchor ? this.worldToMap(it.labelAnchor.x, it.labelAnchor.z) : { x: x + w / 2, y: y + h / 2 };
      const cx = anchor.x, cy = anchor.y;
      const mode = it.navigation?.mode;
      this.drawLabel(it.historicalSite ? `${it.name}（旧址）` : mode === 'exterior-view' ? `${it.name}（外观）` : it.name, cx, cy, it.kind === 'hall', it.kind === 'hall' ? 9 : 8, it.name, mode, this.placeCatalog?.forMapItem(it, this.items)?.id);
    }
  }
  
  /**
   * Cache the map until its screen scale changes. Labels remain readable CSS
   * sizes; zooming reveals details instead of enlarging a permanently culled set.
   */
  renderBase(labelScale = this.pxPerUnit) {
    this.labels = [];
    this.labelPaintRecords = [];
    this.placeFootprints = [];
    const mainCtx = this.ctx;
    const ctx = this.baseCanvas.getContext('2d');
    ctx.setTransform(this.baseScale, 0, 0, this.baseScale, 0, 0);
    this.ctx = ctx; // drawLabel / drawSideItems 复用 this.ctx
    this.labelQueue = [];
    try {
      this.drawStatic();
      const candidates = this.labelQueue;
      this.labelQueue = null;
      this.deferLabelPaint = true;
      // Main palace names precede subsidiary halls, then gates. Data order must
      // never let an entrance erase its palace, including in other side zones.
      const priority = label => label.bold ? (/后殿|配殿|庑房|值房|朝房|耳房/.test(label.targetName) ? 1 : 0) : 2;
      candidates.sort((a, b) => priority(a) - priority(b));
      for (const label of candidates) {
        // Keep access/history qualifiers visible without letting a long suffix
        // consume both neighbouring palace columns.
        const text = label.text.replace(/（(旧址|外观)）$/, '\n（$1）');
        const lines = text.split('\n');
        const size = (label.bold ? 13 : 12) / labelScale;
        ctx.font = `${label.bold ? 'bold ' : ''}${size * labelScale}px sans-serif`;
        const width = (Math.max(...lines.map(line => ctx.measureText(line).width)) + 4) / labelScale;
        const height = size * lines.length + 2 / labelScale;
        const gap = 2 / labelScale;
        if (this.labels.some(p => Math.abs(p.x - label.x) < (p.width + width) / 2 + gap &&
          Math.abs(p.y - label.y) < (p.height + height) / 2 + gap)) continue;
        this.drawLabel(text, label.x, label.y, label.bold, size, label.targetName, label.mode, label.placeId, labelScale);
      }
      this.baseLabelScale = labelScale;
    } finally {
      this.labelQueue = null;
      this.deferLabelPaint = false;
      this.ctx = mainCtx;
    }
  }

  drawMap() {
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    const s = this.pxPerUnit;              // 屏幕 css 像素 / 地图单位
    if (this.baseLabelScale !== s) this.renderBase(s);
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
    this.drawLabels(ctx, (x, y) => this.mapToScreen(x, y), s, this.viewW, this.viewH);
    const pm = this.mapToScreen(...Object.values(this.worldToMap(this.playerPosition.x, this.playerPosition.z)));
    this.drawPlayer(ctx, pm, 5, 14);
    if(this.vehicle){const v=this.worldToMap(this.vehicle.x,this.vehicle.z);this.drawHelicopter(ctx,this.mapToScreen(v.x,v.y));}
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
    const labelScale = this.previewSize / view;
    if (this.baseLabelScale !== labelScale) this.renderBase(labelScale);
    const pm = this.worldToMap(this.playerPosition.x, this.playerPosition.z);
    const s = this.baseScale;
    ctx.fillStyle = '#f0ebdc';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(this.baseCanvas, (pm.x - view / 2) * s, (pm.y - view / 2) * s, view * s, view * s, 0, 0, cw, ch);
    const k = cw / this.previewSize;
    ctx.save();
    ctx.scale(k, k);
    this.drawLabels(ctx, (x, y) => ({ x: this.previewSize / 2 + (x - pm.x) * labelScale,
      y: this.previewSize / 2 + (y - pm.y) * labelScale }), labelScale, this.previewSize, this.previewSize);
    this.drawPlayer(ctx, { x: this.previewSize / 2, y: this.previewSize / 2 }, 5, 16);
    if(this.vehicle){const v=this.worldToMap(this.vehicle.x,this.vehicle.z);this.drawHelicopter(ctx,{x:this.previewSize/2+(v.x-pm.x)*this.previewSize/view,y:this.previewSize/2+(v.y-pm.y)*this.previewSize/view});}
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
        const profile = outerMoatProfile(item);
        ctx.fillStyle = 'rgba(80, 140, 200, 0.5)';
        for (const strip of profile.strips) {
          const [x,y,w,h] = this.rectOf((strip.minX+strip.maxX)/2,(strip.minZ+strip.maxZ)/2,strip.maxX-strip.minX,strip.maxZ-strip.minZ);
          ctx.fillRect(x,y,w,h);
        }
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
        for (const polygon of palaceWaterPolygons(item)) { ctx.beginPath();
        polygon.forEach((point,index)=>{const mapped=this.worldToMap(point.x,point.z);if(index)ctx.lineTo(mapped.x,mapped.y);else ctx.moveTo(mapped.x,mapped.y);});
        ctx.closePath();ctx.fillStyle='rgba(100, 150, 200, 0.6)';ctx.strokeStyle='rgba(70, 120, 170, 0.8)';ctx.lineWidth=1.2;ctx.fill();ctx.stroke(); } continue;
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
      if (name && showLabel) this.drawLabel(name, x + mapW / 2, y + mapH / 2, type === 'palace', type === 'palace' ? 11 : 10, name, undefined, this.placeCatalog?.forBinding({ kind: 'layout', name })?.id);
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
  
  drawHelicopter(ctx,p) {
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(-Math.sin(this.vehicle.yaw),Math.cos(this.vehicle.yaw)));
    ctx.strokeStyle='#183f50';ctx.fillStyle=this.vehicle.occupied?'#18c7d9':'#db9a2b';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,0,4,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,7);ctx.lineTo(0,13);ctx.moveTo(-4,12);ctx.lineTo(4,12);ctx.stroke();ctx.restore();
  }

  update(camera,vehicle=null) {
    this.vehicle=vehicle;
    if(vehicle?.occupied){this.playerPosition.set(vehicle.x,vehicle.y,vehicle.z);this.playerDir.set(Math.sin(vehicle.yaw),0,Math.cos(vehicle.yaw));}
    else {this.playerPosition.copy(camera.position);camera.getWorldDirection(this.playerDir);}
    if (Math.hypot(this.playerDir.x, this.playerDir.z) > 1e-6) {
      const index = (Math.round(Math.atan2(-this.playerDir.x, this.playerDir.z) / (Math.PI / 4)) + 8) % 8;
      const heading = `朝向 ${MAP_HEADINGS[index]}`;
      if (this.headingLabel.textContent !== heading) this.headingLabel.textContent = heading;
    }
    
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
    this.disposed = true;
    this.clearPlaceSelection();
    this.placePanel.dispose();
    this.cancelMapGesture();
    this.secondaryTaps.clear();
    this.suppressedClicks.clear();
    this.inputCleanup.forEach(remove => remove());
    window.visualViewport?.removeEventListener('resize', this._onResize);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
    this.preview?.removeEventListener('click', this._onPreviewClick);
    this.preview?.remove();
    this.container?.remove();
  }
}
