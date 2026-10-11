import { ZoneBase } from './ZoneBase.js';

/**
 * 分区管理器：按玩家位置动态加载/卸载区域。
 * 
 * 流式策略：
 * - 玩家所在区 + neighbors 常驻
 * - 距离 ≤ 40m 预载
 * - 其余卸载（保留 silhouette 如果有）
 * - 构建时间切片（每帧 ≤ 8ms）
 * 
 * 启动时行为：
 * - 立即获取所有区的 regions 和 mapItems（供 Minimap 和位置显示用）
 * - 初始加载玩家所在区
 * 
 * URL 参数 ?zones=all：全部区常驻不卸载（验证零变化和调试）
 */
export class ZoneManager {
  constructor() {
    /** 已注册的 zone 配置：{ id, name, bounds, neighbors, items, BuilderClass } */
    this.zones = new Map();
    /** 已加载的 zone 实例：id → { builder, data } */
    this.loaded = new Map();
    /** 所有区的 regions（启动时收集） */
    this.allRegions = [];
    /** 所有区的 mapItems（启动时收集） */
    this.allMapItems = [];
    /** 当前玩家所在区 id */
    this.currentId = null;
    /** ?zones=all 参数：全部区常驻 */
    this.loadAll = new URLSearchParams(window.location.search).get('zones') === 'all';
    /** 待构建队列：[ { zoneId, priority } ]，priority 越小越优先 */
    this.buildQueue = [];
    /** 正在构建的 zone id（分帧构建中） */
    this.building = null;
    /** 构建开始时间（performance.now()） */
    this.buildStartTime = 0;
    /** 所有区的 rooms（启动时收集，供后续玩法使用） */
    this.allRooms = [];
    /** 单区构建耗时记录：id → ms（最近一次） */
    this.buildTimes = new Map();
    /** 可选回调：区加载/卸载时通知外部（如阴影 LOD 列表维护） */
    this.onLoad = null;
    this.onUnload = null;
  }

  /**
   * 注册一个 zone。
   * @param {object} zoneJson - zone 数据（含 id, name, bounds, neighbors, items）
   * @param {class} BuilderClass - 构建器类，默认 ZoneBase
   */
  register(zoneJson, BuilderClass = ZoneBase) {
    const { id } = zoneJson;
    if (this.zones.has(id)) {
      console.warn(`[ZoneManager] zone ${id} 已注册，跳过`);
      return;
    }
    this.zones.set(id, { ...zoneJson, BuilderClass });
  }

  /**
   * 启动管理器：收集所有区的 regions/mapItems，校验边界重叠，加载初始区。
   * @param {object} scene - Three.js 场景
   * @param {object} library - 材质贴图库
   * @param {object} collisionManager - 碰撞管理器
   * @param {object} initialPos - 玩家初始位置 { x, z }
   */
  init(scene, library, collisionManager, initialPos) {
    this.scene = scene;
    this.library = library;
    this.collisionManager = collisionManager;

    // 收集所有区的 regions 和 mapItems（dry 模式：只构建不加入场景）
    console.log('[ZoneManager] 收集所有区的 regions 和 mapItems...');
    for (const [id, config] of this.zones) {
      const builder = new config.BuilderClass(this.library, config);
      const data = builder.build();
      this.allRegions.push(...data.regions);
      this.allMapItems.push(...data.mapItems);
      this.allRooms.push(...data.rooms);
      // 立即 dispose，不加入场景
      builder.dispose();
    }
    console.log(`[ZoneManager] 共 ${this.allRegions.length} 个 region, ${this.allMapItems.length} 个 mapItem`);

    // 校验边界重叠
    this.checkOverlaps();

    // 确定初始所在区
    this.currentId = this.findZone(initialPos.x, initialPos.z);
    if (!this.currentId) {
      console.warn('[ZoneManager] 玩家初始位置不在任何区内，默认加载所有区');
      this.currentId = this.zones.keys().next().value; // 取第一个区
    }

    // ?zones=all 模式：立即加载所有区
    if (this.loadAll) {
      console.log('[ZoneManager] ?zones=all 模式：加载所有区...');
      for (const id of this.zones.keys()) {
        this.loadZone(id);
      }
      return;
    }

    // 正常模式：初始区同步加载（出生点脚下的碰撞体必须第一帧就在），neighbors 进队列分帧加载
    const initial = this.zones.get(this.currentId);
    this.loadZone(this.currentId);
    for (const nid of initial.neighbors ?? []) {
      this.buildQueue.push({ zoneId: nid, priority: 1 });
    }
    this.buildQueue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 每帧更新：根据玩家位置调整加载状态，推进构建队列。
   * @param {object} playerPos - 玩家位置 { x, z }
   */
  update(playerPos) {
    if (this.loadAll) return; // ?zones=all 模式无需动态加载

    // 更新当前所在区
    const newId = this.findZone(playerPos.x, playerPos.z);
    if (newId && newId !== this.currentId) {
      this.currentId = newId;
      this.onEnterZone(newId);
    }

    // 预载：距离 ≤ 40m 的区（已在队列中的不重复入队）
    for (const [id, config] of this.zones) {
      if (this.loaded.has(id) || this.buildQueue.some(b => b.zoneId === id)) continue;
      const dist = this.distanceToZone(playerPos.x, playerPos.z, config.bounds);
      if (dist <= 40) {
        this.buildQueue.push({ zoneId: id, priority: dist });
      }
    }
    this.buildQueue.sort((a, b) => a.priority - b.priority);

    // 卸载：不在 current + neighbors 且距离 > 60m
    if (this.currentId) {
      const current = this.zones.get(this.currentId);
      const keep = new Set([this.currentId, ...(current.neighbors ?? [])]);
      for (const id of this.loaded.keys()) {
        if (keep.has(id)) continue;
        const dist = this.distanceToZone(playerPos.x, playerPos.z, this.zones.get(id).bounds);
        if (dist > 60) {
          this.unloadZone(id);
        }
      }
    }

    // 推进构建队列（时间切片：每帧 ≤ 8ms）
    this.processBuildQueue();
  }

  /**
   * 进入新区时触发：将该区 + neighbors 加入构建队列
   */
  onEnterZone(zoneId) {
    console.log(`[ZoneManager] 进入区域: ${zoneId}`);
    const config = this.zones.get(zoneId);
    if (!config) return;

    // 当前区优先级 0，neighbors 优先级 1
    if (!this.loaded.has(zoneId)) {
      this.buildQueue.push({ zoneId, priority: 0 });
    }
    for (const nid of config.neighbors ?? []) {
      if (!this.loaded.has(nid) && !this.buildQueue.find(b => b.zoneId === nid)) {
        this.buildQueue.push({ zoneId: nid, priority: 1 });
      }
    }
    this.buildQueue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 推进构建队列：每帧最多 8ms
   */
  processBuildQueue() {
    const frameStart = performance.now();
    const timeLimit = 8; // ms

    while (this.buildQueue.length > 0 && performance.now() - frameStart < timeLimit) {
      const { zoneId } = this.buildQueue.shift();
      if (this.loaded.has(zoneId)) continue;
      this.loadZone(zoneId);
      // 如果 loadZone 耗时超过 8ms，下一帧继续
      if (performance.now() - frameStart >= timeLimit) break;
    }
  }

  /**
   * 加载一个区：构建 + 加入场景 + 注册碰撞
   */
  loadZone(zoneId) {
    const config = this.zones.get(zoneId);
    if (!config || this.loaded.has(zoneId)) return;

    const start = performance.now();
    const builder = new config.BuilderClass(this.library, config);
    const data = builder.build();
    const elapsed = performance.now() - start;

    // 加入场景
    this.scene.add(data.group);

    // 注册碰撞（带 tag，用于卸载时删除）
    this.collisionManager.addColliders(data.colliders, zoneId);
    this.collisionManager.addWalkables(data.walkables, zoneId);

    this.loaded.set(zoneId, { builder, data });
    this.buildTimes.set(zoneId, +elapsed.toFixed(1));
    this.onLoad?.(zoneId, data.group);
    console.log(`[ZoneManager] 加载区域 ${zoneId}（${config.name}），耗时 ${elapsed.toFixed(1)}ms`);
  }

  /**
   * 卸载一个区：移除场景 + 删除碰撞 + dispose
   */
  unloadZone(zoneId) {
    const entry = this.loaded.get(zoneId);
    if (!entry) return;

    const { builder, data } = entry;
    this.onUnload?.(zoneId, data.group);
    data.group.removeFromParent();
    this.collisionManager.removeByTag(zoneId);
    builder.dispose();
    this.loaded.delete(zoneId);

    console.log(`[ZoneManager] 卸载区域 ${zoneId}`);
  }

  /**
   * 判断点 (x, z) 在哪个区内（返回区 id）
   */
  findZone(x, z) {
    for (const [id, config] of this.zones) {
      const { x0, x1, z0, z1 } = config.bounds;
      if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return id;
    }
    return null;
  }

  /**
   * 点到区边界的距离（点在区内返回 0）
   */
  distanceToZone(x, z, bounds) {
    const { x0, x1, z0, z1 } = bounds;
    if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return 0;
    const dx = Math.max(0, Math.max(x0 - x, x - x1));
    const dz = Math.max(0, Math.max(z0 - z, z - z1));
    return Math.hypot(dx, dz);
  }

  /**
   * 校验所有区的 bounds 是否重叠
   */
  checkOverlaps() {
    const list = Array.from(this.zones.entries());
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [id1, z1] = list[i];
        const [id2, z2] = list[j];
        const b1 = z1.bounds, b2 = z2.bounds;
        const overlap = !(b1.x1 < b2.x0 || b2.x1 < b1.x0 || b1.z1 < b2.z0 || b2.z1 < b1.z0);
        if (overlap) {
          console.warn(`[ZoneManager] 区域边界重叠: ${id1} (${z1.name}) 与 ${id2} (${z2.name})`);
        }
      }
    }
  }

  /**
   * 获取所有区的 regions（启动时收集，供 CollisionManager 使用）
   */
  getRegions() {
    return this.allRegions;
  }

  /**
   * 获取所有区的 mapItems（启动时收集，供 Minimap 使用）
   */
  getMapItems() {
    return this.allMapItems;
  }

  /**
   * 获取所有区的 rooms（启动时收集，替代原 SideCourts.getRooms()）
   */
  getRooms() {
    return this.allRooms;
  }

  /**
   * 获取当前已加载的区 id 列表
   */
  getLoadedIds() {
    return Array.from(this.loaded.keys());
  }

  /**
   * 获取当前所在区 id
   */
  getCurrentId() {
    return this.currentId;
  }

  /**
   * 释放所有资源
   */
  dispose() {
    for (const id of this.loaded.keys()) {
      this.unloadZone(id);
    }
    this.zones.clear();
    this.buildQueue.length = 0;
  }
}
