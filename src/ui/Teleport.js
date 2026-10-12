import * as THREE from 'three';
import { PALACE_LAYOUT } from '../scene/Layout.js';
import { ZONES } from '../../data/zones/index.js';
import { TELEPORT, PLAYER } from '../config/constants.js';

const rotations = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };

export class Teleport {
  constructor(controls, zoneManager, collisionManager) {
    this.controls = controls;
    this.zoneManager = zoneManager;
    this.collisionManager = collisionManager;
    this.targets = new Map();
    for (const item of PALACE_LAYOUT) {
      if (!['palace', 'gate', 'garden'].includes(item.type)) continue;
      this.targets.set(item.name, { name: item.name, x: item.position.x, z: item.position.z, d: item.dimensions.depth });
    }
    for (const zone of ZONES) {
      for (const item of zone.items) {
        if (['hall', 'gate'].includes(item.kind) && item.name) this.targets.set(item.name, item);
      }
    }
    this.overlay = document.createElement('div');
    this.overlay.id = 'teleport-overlay';
    this.overlay.setAttribute('role', 'status');
    this.overlay.style.cssText = 'display:none;position:fixed;left:50%;top:25%;transform:translateX(-50%);padding:16px 24px;background:#251c16e8;color:#ffd764;border-radius:8px;z-index:2000;pointer-events:none';
    document.body.appendChild(this.overlay);
  }

  landingFor(name) {
    const target = this.targets.get(name);
    if (!target) throw new Error(`未知传送目标：${name}`);
    const rot = typeof target.rot === 'number' ? target.rot : rotations[target.rot ?? 'south'];
    const distance = (target.d ?? target.t ?? 0) / 2 + TELEPORT.DOOR_DISTANCE;
    return { name, x: target.x - Math.sin(rot) * distance, z: target.z - Math.cos(rot) * distance, lookAtX: target.x, lookAtZ: target.z };
  }

  go(name) {
    const point = this.landingFor(name);
    this.overlay.textContent = `前往 ${name}…`;
    this.overlay.style.display = 'block';
    clearTimeout(this.overlayTimer);
    this.overlayTimer = setTimeout(() => { this.overlay.style.display = 'none'; }, TELEPORT.OVERLAY_MS);
    this.zoneManager.ensureLoadedAt(point.x, point.z);
    const ground = this.collisionManager.getGroundHeight(point.x, point.z, Infinity);
    if (this.collisionManager.checkCollision(new THREE.Vector3(point.x, ground + PLAYER.HEIGHT, point.z))) {
      this.overlay.textContent = `${name}门前受阻，暂不能传送`;
      return null;
    }
    this.controls.teleportTo(point.x, point.z, point.lookAtX, point.lookAtZ);
    this.zoneManager.update(this.controls.getPosition());
    this.lastPoint = { ...point, y: this.controls.getFeetY(), zone: this.zoneManager.getCurrentId() };
    return this.lastPoint;
  }

  dispose() {
    clearTimeout(this.overlayTimer);
    this.overlay.remove();
  }
}
