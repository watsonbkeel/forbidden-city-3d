import * as THREE from 'three';
import { PALACE_LAYOUT } from '../scene/Layout.js';

/**
 * 小地图：按 M 键显示/隐藏，显示当前位置和建筑名称
 */

export class Minimap {
  constructor({ items = [] } = {}) {
    this.visible = false;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.playerPosition = new THREE.Vector3();
    this.playerDir = new THREE.Vector3(0, 0, 1);
    this.items = items; // 两侧宫院：{ kind: 'hall'|'gate'|'corridor', name, x, z, w, d }
    
    // 地图范围：宫城 + 筒子河，竖长方形（与紫禁城南北长、东西窄的比例一致）
    this.worldBounds = { minX: -200, maxX: 200, minZ: -240, maxZ: 470 };
    this.mapSize = 400; // 宽
    this.mapHeight = Math.round(this.mapSize * (710 / 400) * 0.82);
    this.scaleX = this.mapSize / 400;
    this.scaleZ = this.mapHeight / 710;
    
    this.init();
  }
  
  init() {
    // 创建小地图容器
    this.container = document.createElement('div');
    this.container.id = 'minimap';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${this.mapSize}px;
      max-height: 96vh;
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
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.mapSize;
    this.canvas.height = this.mapHeight;
    this.canvas.style.cssText = `
      display: block;
      background: rgba(240, 235, 220, 0.95);
      border: 1px solid rgba(100, 80, 60, 0.4);
    `;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // 提示文字
    const hint = document.createElement('div');
    hint.textContent = '按 M 键关闭';
    hint.style.cssText = `
      color: #999;
      font-size: 12px;
      text-align: center;
      margin-top: 8px;
    `;
    this.container.appendChild(hint);
    
    document.body.appendChild(this.container);
    
    // 监听 M 键
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggle();
      }
    });
    
    // 初始绘制
    this.drawMap();
  }
  
  toggle() {
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
    if (this.visible) {
      this.drawMap();
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

  drawLabel(text, x, y, bold, size = 10) {
    const ctx = this.ctx;
    ctx.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
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
      const [x, y, w, h] = this.rectOf(it.x, it.z, it.w, it.d);
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, Math.max(w, 1.5), Math.max(h, 1.5));
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x, y, Math.max(w, 1.5), Math.max(h, 1.5));
    }
    // 只标有名字的主要殿宇与门（字号小，避免互相遮挡）
    const placed = [];
    for (const it of this.items) {
      if (!it.name || it.kind === 'corridor') continue;
      const [x, y, w, h] = this.rectOf(it.x, it.z, it.w, it.d);
      const cx = x + w / 2, cy = y + h / 2;
      if (placed.some(p => Math.abs(p.x - cx) < 22 && Math.abs(p.y - cy) < 9)) continue;
      placed.push({ x: cx, y: cy });
      this.drawLabel(it.name, cx, cy, it.kind === 'hall', it.kind === 'hall' ? 9 : 8);
    }
  }
  
  drawMap() {
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

    // 玩家位置（红点 + 朝向箭头）
    const pm = this.worldToMap(this.playerPosition.x, this.playerPosition.z);
    ctx.fillStyle = 'rgba(255, 60, 60, 0.95)';
    ctx.beginPath();
    ctx.arc(pm.x, pm.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 视线方向（世界）→ 地图：x 翻转、z 向上
    const len = Math.hypot(this.playerDir.x, this.playerDir.z) || 1;
    const ax = pm.x - (this.playerDir.x / len) * 14;
    const ay = pm.y - (this.playerDir.z / len) * 14;
    ctx.strokeStyle = 'rgba(255, 60, 60, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pm.x, pm.y);
    ctx.lineTo(ax, ay);
    ctx.stroke();
  }
  
  update(camera) {
    this.playerPosition.copy(camera.position);
    camera.getWorldDirection(this.playerDir);
    
    if (this.visible) {
      this.drawMap();
    }
  }
  
  dispose() {
    this.container?.remove();
  }
}
