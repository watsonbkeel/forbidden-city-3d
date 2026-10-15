/**
 * S 档内景加载器（P1-I）。
 *
 * - 每座 S 档殿一份 data/interiors/<hallId>.json（见 data/interiors/schema.md），GLB 以殿身局部坐标建模
 *   （原点 = 殿中心、地面 y=0、正面朝 −Z）；加载后放到 frame(x, floorY, z, rot) 下。
 * - 玩家距殿身包围盒 ≤ preload.enter（默认 15 m）开始加载；≥ preload.exit（默认 40 m）卸载并释放显存。
 * - 加载期间保留 B 档（PalaceBuilder 程序化内景，始终存在），GLB 就绪后 300 ms 淡入叠加。
 * - 名字 COL_* 的 mesh 作碰撞代理（Box3，渲染隐藏），WALK_* 作可行走面；tag = `interior:<hallId>`，卸载时 removeByTag。
 * - 加载失败：保留 B 档并 console.warn，记入 stats.failed，不再重试（直到 unload 后再次进入）。
 *
 * 接入方式（main.js 由总控维护，见 REQUESTS）：
 *   this.interiors = new InteriorLoader(this.scene, this.collisionManager, { renderer: this.renderer });
 *   animate(): this.interiors.update({ x: cam.x, z: cam.z });
 * 或自驱：interiors.autoStart(() => camera.position)。
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { INTERIORS } from './registry.js';

const FADE_MS = 300;
const DEFAULT_ENTER = 15;
const DEFAULT_EXIT = 40;

export class InteriorLoader {
  /**
   * @param {THREE.Scene} scene
   * @param {import('../../utils/Collision.js').CollisionManager} collisionManager
   * @param {{ renderer?: THREE.WebGLRenderer, registry?: object, base?: string }} [opts]
   */
  constructor(scene, collisionManager, { renderer = null, registry = INTERIORS, base = '' } = {}) {
    this.scene = scene;
    this.cm = collisionManager;
    this.base = base;
    this.halls = new Map(); // hallId → { cfg, state: 'idle'|'loading'|'loaded'|'failed', group, lights, fade, token }
    for (const [id, cfg] of Object.entries(registry)) this.halls.set(id, { id, cfg, state: 'idle', group: null, token: 0 });

    this.stats = { loaded: [], loading: [], failed: [], lastHall: null, lastLoadMs: 0, lastTris: 0, lastBytes: 0 };
    /** 每座殿的加载记录 hallId → { ms, tris, bytes, ok } */
    this.history = {};

    this.gltf = new GLTFLoader();
    this.draco = new DRACOLoader().setDecoderPath(`${base}/draco/`);
    this.gltf.setDRACOLoader(this.draco);
    this.ktx2 = null;
    if (renderer) {
      this.ktx2 = new KTX2Loader().setTranscoderPath(`${base}/basis/`).detectSupport(renderer);
      this.gltf.setKTX2Loader(this.ktx2);
    }
    this._raf = 0;
    this._disposed = false;
  }

  /** 已注册的殿 id */
  ids() { return [...this.halls.keys()]; }

  /** 玩家点到殿身矩形（世界 XZ）的距离，殿内为 0 */
  distanceTo(hallId, pos) {
    const h = this.halls.get(hallId);
    if (!h) return Infinity;
    const f = h.cfg.frame;
    // 旋转框架：把点转到殿局部坐标再算到矩形的距离
    const c = Math.cos(-(f.rot ?? 0)), s = Math.sin(-(f.rot ?? 0));
    const dx0 = pos.x - f.x, dz0 = pos.z - f.z;
    const lx = dx0 * c - dz0 * s, lz = dx0 * s + dz0 * c;
    const ex = Math.max(0, Math.abs(lx) - f.w / 2), ez = Math.max(0, Math.abs(lz) - f.d / 2);
    return Math.hypot(ex, ez);
  }

  /** 每帧调用：按距离触发加载/卸载，推进淡入 */
  update(pos, now = performance.now()) {
    if (this._disposed) return;
    for (const h of this.halls.values()) {
      const enter = h.cfg.preload?.enter ?? DEFAULT_ENTER;
      const exit = h.cfg.preload?.exit ?? DEFAULT_EXIT;
      const dist = this.distanceTo(h.id, pos);
      if (dist <= enter && h.state === 'idle') this.load(h.id);
      else if (dist >= exit && h.state !== 'idle') this.unload(h.id);
      if (h.fade) this._stepFade(h, now);
    }
  }

  /** 自驱循环（不改 main.js 时用）：getPos 返回 {x, z} */
  autoStart(getPos) {
    const tick = () => {
      if (this._disposed) return;
      this._raf = requestAnimationFrame(tick);
      const p = getPos();
      if (p) this.update({ x: p.x, z: p.z });
    };
    tick();
  }

  /**
   * 加载一座殿的 GLB；返回 true=已就绪，false=失败/取消（B 档保留）。
   * 重复调用：已在加载中/已加载直接返回现有 Promise/true。
   */
  load(hallId) {
    const h = this.halls.get(hallId);
    if (!h) return Promise.resolve(false);
    if (h.state === 'loaded') return Promise.resolve(true);
    if (h.state === 'loading') return h.promise;
    if (h.state === 'failed') return Promise.resolve(false);

    h.state = 'loading';
    const token = ++h.token;
    this._syncStats();
    const t0 = performance.now();
    const url = `${this.base}${h.cfg.model}`;
    h.promise = new Promise(resolve => {
      this.gltf.load(url, gltf => {
        if (token !== h.token || this._disposed) { disposeObject(gltf.scene); return resolve(false); }
        try {
          this._install(h, gltf.scene, t0);
          resolve(true);
        } catch (err) {
          console.warn(`[InteriorLoader] ${h.cfg.hall} 安装失败，保留 B 档：`, err);
          if (h.id === 'kunning') {
            this.cm?.removeByTag(`interior:${h.id}`);
            if (h.group) this.scene.remove(h.group);
            disposeObject(h.group ?? gltf.scene);
            h.group = null; h.lights = []; h.fade = null;
          } else disposeObject(gltf.scene);
          this._fail(h, t0);
          resolve(false);
        }
      }, undefined, err => {
        if (token !== h.token) return resolve(false);
        console.warn(`[InteriorLoader] ${h.cfg.hall} GLB 加载失败（${url}），保留 B 档：`, err?.message ?? err);
        this._fail(h, t0);
        resolve(false);
      });
    });
    return h.promise;
  }

  _fail(h, t0) {
    h.state = 'failed';
    h.promise = null;
    this.history[h.id] = { ms: Math.round(performance.now() - t0), ok: false, tris: 0, bytes: 0 };
    this.stats.lastHall = h.id;
    this.stats.lastLoadMs = this.history[h.id].ms;
    this._syncStats();
  }

  _install(h, root, t0) {
    const cfg = h.cfg;
    // Validate the optional layer before a collider, light, fade or scene object is registered.
    if (h.id === 'kunning') validateKunningFurniture(root, cfg);
    const f = cfg.frame;
    const floorY = this._floorY(cfg);
    const group = new THREE.Group();
    group.name = `interior:${h.id}`;
    if (h.id === 'kunning') h.group = group; // rollback owns even a partially installed group
    group.position.set(f.x + (cfg.anchor?.x ?? 0), floorY + (cfg.anchor?.y ?? 0), f.z + (cfg.anchor?.z ?? 0));
    group.rotation.y = f.rot ?? 0;
    group.add(root);
    group.updateMatrixWorld(true);

    // 碰撞代理 / 可行走面
    const colliders = [], walkables = [];
    let tris = 0;
    const mats = new Set();
    root.traverse(o => {
      if (!o.isMesh) return;
      const name = o.name || '';
      if (name.startsWith('COL_') || name.startsWith('WALK_')) {
        const box = new THREE.Box3().setFromObject(o);
        o.visible = false;
        if (name.startsWith('COL_')) colliders.push(box); else walkables.push({ type: 'box', box, rescue: false });
        return;
      }
      o.castShadow = false;
      o.receiveShadow = true;
      o.frustumCulled = true;
      const g = o.geometry;
      if (g) tris += (g.index ? g.index.count : g.attributes.position?.count ?? 0) / 3;
      const list = Array.isArray(o.material) ? o.material : [o.material];
      list.forEach(m => m && mats.add(m));
    });
    const tag = `interior:${h.id}`;
    this.cm?.addColliders(colliders, tag);
    this.cm?.addWalkables(walkables, tag);

    // 补光
    h.lights = [];
    for (const l of cfg.lights ?? []) {
      if (l.type !== 'point') continue;
      const light = new THREE.PointLight(new THREE.Color(l.color ?? '#ffffff'), l.intensity ?? 1, l.distance ?? 30, 2);
      light.position.set(l.x, l.y, l.z);
      group.add(light);
      h.lights.push(light);
    }

    // 淡入：先透明再 300 ms 到 1
    h.fade = { t0: performance.now(), mats: [...mats], restore: new Map() };
    for (const m of h.fade.mats) {
      h.fade.restore.set(m, { transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite });
      m.transparent = true;
      m.opacity = 0;
    }

    this.scene.add(group);
    h.group = group;
    h.state = 'loaded';
    h.promise = null;
    const ms = Math.round(performance.now() - t0);
    this.history[h.id] = { ms, ok: true, tris: Math.round(tris), bytes: estimateBytes(root) };
    this.stats.lastHall = h.id;
    this.stats.lastLoadMs = ms;
    this.stats.lastTris = this.history[h.id].tris;
    this.stats.lastBytes = this.history[h.id].bytes;
    this._syncStats();
  }

  _stepFade(h, now) {
    const k = Math.min(1, (now - h.fade.t0) / FADE_MS);
    for (const m of h.fade.mats) m.opacity = k;
    if (k >= 1) {
      for (const m of h.fade.mats) {
        const r = h.fade.restore.get(m);
        m.transparent = r.transparent;
        m.opacity = r.opacity;
        m.depthWrite = r.depthWrite;
        m.needsUpdate = true;
      }
      h.fade = null;
    }
  }

  /** 卸载并释放显存；idle 态无操作 */
  unload(hallId) {
    const h = this.halls.get(hallId);
    if (!h || h.state === 'idle') return;
    h.token++; // 使在途加载作废
    h.promise = null;
    h.fade = null;
    if (h.group) {
      this.scene.remove(h.group);
      disposeObject(h.group);
      h.group = null;
    }
    h.lights = [];
    this.cm?.removeByTag(`interior:${h.id}`);
    h.state = 'idle';
    this._syncStats();
  }

  isLoaded(hallId) { return this.halls.get(hallId)?.state === 'loaded'; }
  getState(hallId) { return this.halls.get(hallId)?.state ?? null; }
  getGroup(hallId) { return this.halls.get(hallId)?.group ?? null; }

  /** 殿内地面世界高度：floor.mode = fixed 用 floor.y，否则从碰撞可行走面取（台基顶面） */
  _floorY(cfg) {
    if (cfg.floor?.mode === 'fixed' && Number.isFinite(cfg.floor.y)) return cfg.floor.y;
    if (this.cm?.getGroundHeight) return this.cm.getGroundHeight(cfg.frame.x, cfg.frame.z, 0, 999);
    return cfg.floor?.y ?? 0;
  }

  _syncStats() {
    const s = this.stats;
    s.loaded = []; s.loading = []; s.failed = [];
    for (const h of this.halls.values()) {
      if (h.state === 'loaded') s.loaded.push(h.id);
      else if (h.state === 'loading') s.loading.push(h.id);
      else if (h.state === 'failed') s.failed.push(h.id);
    }
  }

  /** 供 PerfHUD 显示的一行文字 */
  hudLine() {
    const s = this.stats;
    const last = s.lastHall ? `${s.lastHall} ${s.lastLoadMs}ms ${(s.lastTris / 1000).toFixed(0)}k` : '-';
    return `Interior: ${s.loaded.join(',') || '-'}${s.loading.length ? ` (loading ${s.loading.join(',')})` : ''} | last ${last}`;
  }

  dispose() {
    this._disposed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    for (const id of this.halls.keys()) this.unload(id);
    this.draco.dispose();
    this.ktx2?.dispose();
  }
}

function disposeObject(root) {
  const mats = new Set(), texs = new Set();
  root.traverse(o => {
    if (o.isMesh) {
      o.geometry?.dispose();
      const list = Array.isArray(o.material) ? o.material : [o.material];
      list.forEach(m => m && mats.add(m));
    }
    if (o.isLight) o.dispose?.();
  });
  for (const m of mats) {
    for (const v of Object.values(m)) if (v && v.isTexture) texs.add(v);
    m.dispose();
  }
  for (const t of texs) t.dispose();
}

/** 粗略估算几何 + 贴图字节数（用于 HUD / 预算提示） */
function estimateBytes(root) {
  let bytes = 0;
  const texs = new Set();
  root.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry;
    if (g) {
      for (const a of Object.values(g.attributes)) bytes += a.array.byteLength;
      if (g.index) bytes += g.index.array.byteLength;
    }
    const list = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of list) if (m) for (const v of Object.values(m)) if (v && v.isTexture) texs.add(v);
  });
  for (const t of texs) {
    const img = t.image;
    if (img?.width && img?.height) bytes += img.width * img.height * 4 * 1.33;
  }
  return Math.round(bytes);
}

/** Kunning's permanent B owns architecture; S may supply only compatible furniture. */
function validateKunningFurniture(root, cfg) {
  const expected = cfg.architectureContract;
  const contracts = [];
  root.traverse(o => { if (o.name === 'KUNNING_CONTRACT') contracts.push(o.userData); });
  if (!expected || contracts.length !== 1) throw new Error('Kunning profile contract missing or duplicated');
  for (const key of ['profileId', 'profileRevision', 'profileHash', 'ownership']) {
    if (contracts[0][key] !== expected[key]) throw new Error(`Kunning profile contract mismatch: ${key}`);
  }
  if (expected.ownership !== 'furniture-only') throw new Error('Kunning S must be furniture-only');
  root.updateMatrixWorld(true);
  const toBox = b => new THREE.Box3(new THREE.Vector3(...b.min), new THREE.Vector3(...b.max));
  const regions = Object.fromEntries(Object.entries(cfg.placementRegions).map(([id, r]) => [id, toBox(r.bounds ?? r)]));
  const protectedBoxes = cfg.protectedVolumes.map(r => ({ id: r.id, box: toBox(r.bounds) }));
  const proxies = new Set(), triangle = new THREE.Triangle(), bounds = new THREE.Box3();
  let tris = 0;
  root.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry, position = g?.attributes.position;
    if (!position) throw new Error(`Kunning geometry missing: ${o.name}`);
    if (o.name.startsWith('WALK_')) throw new Error('Kunning S cannot own structural support');
    if (o.name.startsWith('COL_')) {
      const region = regions[cfg.furnitureProxies?.[o.name]];
      if (!region || proxies.has(o.name)) throw new Error(`Kunning unknown or duplicate furniture proxy: ${o.name}`);
      proxies.add(o.name);
      bounds.setFromObject(o);
      if (!region.clone().expandByScalar(0.002).containsBox(bounds)) throw new Error(`Kunning proxy outside placement region: ${o.name}`);
      for (const p of protectedBoxes) if (p.box.intersectsBox(bounds)) throw new Error(`Kunning proxy blocks protected volume: ${p.id}`);
      return;
    }
    const count = g.index?.count ?? position.count;
    tris += count / 3;
    for (let i = 0; i < count; i += 3) {
      for (const [j, vertex] of [triangle.a, triangle.b, triangle.c].entries()) {
        vertex.fromBufferAttribute(position, g.index ? g.index.getX(i + j) : i + j).applyMatrix4(o.matrixWorld);
        if (![vertex.x, vertex.y, vertex.z].every(Number.isFinite)) throw new Error('Kunning non-finite geometry');
      }
      bounds.setFromPoints([triangle.a, triangle.b, triangle.c]);
      if (!Object.values(regions).some(r => r.clone().expandByScalar(0.002).containsBox(bounds))) throw new Error(`Kunning mesh outside furniture regions: ${o.name}`);
      for (const p of protectedBoxes) if (p.box.intersectsTriangle(triangle)) throw new Error(`Kunning mesh blocks protected volume: ${p.id}`);
    }
  });
  if (proxies.size !== Object.keys(cfg.furnitureProxies).length) throw new Error('Kunning furniture proxy inventory incomplete');
  if (tris > cfg.budget.tris) throw new Error('Kunning renderable triangle budget exceeded');
  const textures = new Set();
  root.traverse(o => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
    if (m) for (const t of Object.values(m)) if (t?.isTexture) textures.add(t);
  } });
  let textureBytes = 0;
  for (const t of textures) {
    if (!t.image?.width || !t.image?.height) throw new Error('Kunning unmeasurable texture');
    textureBytes += t.image.width * t.image.height * 4 * 4 / 3;
  }
  if (textureBytes > cfg.budget.textureMB * 1024 * 1024) throw new Error('Kunning texture budget exceeded');
}
