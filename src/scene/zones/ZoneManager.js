import {getXiananConstructionBirth} from './ZoneBase.js';
import {getXiananManagedBirth,hasXiananRegistration} from '../palace/special/XiananContactSources.js';
import {ZoneLoadMetrics,beginZoneLoad,measureZonePhase,finishZoneLoad,beginZoneQueue,finishZoneQueue,kitMergeMs} from './ZoneLoadMetrics.js';
import {bindSishenEnvironmentWitness,unbindSishenEnvironmentWitness} from '../../controls/SishenEnvironmentWitness.js';
import {bindWestWellEnvironmentWitness,unbindWestWellEnvironmentWitness} from '../../controls/WestWellEnvironmentWitness.js';
import {bindEastWellEnvironmentWitness,unbindEastWellEnvironmentWitness} from '../../controls/EastWellEnvironmentWitness.js';
import {bindShoukangEntryEnvironmentWitness,unbindShoukangEntryEnvironmentWitness} from '../../controls/ShoukangEntryEnvironmentWitness.js';
import {bindYanshouCompoundEnvironmentWitness,unbindYanshouCompoundEnvironmentWitness} from '../../controls/YanshouCompoundEnvironmentWitness.js';
import {bindCiningGateEnvironmentWitness,unbindCiningGateEnvironmentWitness} from '../../controls/CiningGateEnvironmentWitness.js';
import {bindCiyinFacadeEnvironmentWitness,unbindCiyinFacadeEnvironmentWitness} from '../../controls/CiyinFacadeEnvironmentWitness.js';
import {bindShouanEntryEnvironmentWitness,unbindShouanEntryEnvironmentWitness} from '../../controls/ShouanEntryEnvironmentWitness.js';
import {bindXishangEnvironmentWitness,unbindXishangEnvironmentWitness} from '../../controls/XishangEnvironmentWitness.js';
import {bindChengqianEnvironmentWitness,unbindChengqianEnvironmentWitness} from '../../controls/ChengqianEnvironmentWitness.js';
import {InactiveZoneCache,zoneRetainedResourceCost} from './InactiveZoneCache.js';
import {buildingDetailQuality} from '../../render/BuildingDetailQuality.js';
import { ZoneBase } from './ZoneBase.js';
import { buildSilhouette } from '../../render/SilhouetteBuilder.js';

/**
 * 分区管理器：按玩家位置动态加载/卸载区域。
 * 
 * 流式策略：
 * - 当前区与已加载邻区保留；新增预载只排距玩家 40m 内的区
 * - 距离 ≤ 40m 预载
 * - 其余卸载（保留 silhouette 如果有）
 * - 队列在同步任务之间检查8ms预算；单个任务不可抢占
 * 
 * 启动时行为：
 * - 立即获取所有区的 regions 和 mapItems（供 Minimap 和位置显示用）
 * - 初始加载玩家所在区
 * 
 * URL 参数 ?zones=all：全部区常驻不卸载（验证零变化和调试）
 */
// Private synchronous provenance for the one source-bound Xianan component.
// Public loaded/prebuilt/cache maps are bookkeeping, never authorization.
const xiananManagers=new WeakMap(),xiananGroupWindows=new WeakMap(),xiananCMWindows=new WeakMap();
// Synchronous retirement claim: notifications may reenter the manager.
const unloadingEntries=new WeakSet();
const xiananConfig=c=>c?.id==='outer-west'&&c.items?.[30]?.name==='咸安门';
const xiananAdmissionError=()=>Object.assign(new Error('Untrusted Xianan managed admission'),{code:'XIANAN_UNTRUSTED_ADMISSION'});
function xiananManagerState(manager,config){
  if(!xiananConfig(config))return null;
  const state=xiananManagers.get(manager);if(!state)throw xiananAdmissionError();
  if(!state.cm){state.cm=new WeakRef(manager.collisionManager);state.scene=new WeakRef(manager.scene);state.library=new WeakRef(manager.library);}
  if(state.cm.deref()!==manager.collisionManager||state.scene.deref()!==manager.scene||state.library.deref()!==manager.library)throw xiananAdmissionError();
  return state;
}
function xiananEntry(builder,data,config,birth,status){return {builder:new WeakRef(builder),data:new WeakRef(data),group:new WeakRef(data.group),config:new WeakRef(config),birth,status};}
function sameXiananEntry(row,builder,data,config,birth){return row&&row.builder.deref()===builder&&row.data.deref()===data&&row.group.deref()===data.group&&row.config.deref()===config&&row.birth===birth;}
function rememberXiananPrebuilt(manager,config,builder,data){
  const state=xiananManagerState(manager,config);if(!state)return;
  const birth=getXiananManagedBirth(builder,data);if(birth)state.entries.set(data,xiananEntry(builder,data,config,birth,'prebuilt'));
}
function openXiananWindow(manager,state,row,phase,mode){
  const cm=manager.collisionManager,group=row.group.deref();
  if(state.window||xiananCMWindows.has(cm)||xiananGroupWindows.has(group))throw xiananAdmissionError();
  const token=Object.freeze({manager:new WeakRef(manager),cm:new WeakRef(cm),scene:new WeakRef(manager.scene),builder:row.builder,data:row.data,group:row.group,birth:row.birth,phase,mode});
  state.window=token;xiananCMWindows.set(cm,token);xiananGroupWindows.set(group,token);return {state,row,token};
}
function closeXiananWindow(control){
  if(!control)return;const {state,token}=control,cm=token.cm.deref(),group=token.group.deref();
  if(state.window===token)state.window=null;
  if(cm&&xiananCMWindows.get(cm)===token)xiananCMWindows.delete(cm);
  if(group&&xiananGroupWindows.get(group)===token)xiananGroupWindows.delete(group);
}
// Read-only and valid only during the real manager's internal sync window.
export function getXiananLifecycleTransition(group,birth,phase){
  const token=xiananGroupWindows.get(group),manager=token?.manager.deref(),cm=token?.cm.deref();
  return token&&token.birth===birth&&token.phase===phase&&token.group.deref()===group&&manager&&cm&&xiananManagers.get(manager)?.window===token&&xiananCMWindows.get(cm)===token&&manager.collisionManager===cm&&manager.scene===token.scene.deref()?token:null;
}
function beginXiananLoad(manager,config,builder,data,cached){
  const state=xiananManagerState(manager,config);if(!state)return null;
  const birth=getXiananManagedBirth(builder,data);if(!birth)return null;
  let row=state.entries.get(data),mode='cold';
  if(cached){
    if(!sameXiananEntry(row,builder,data,config,birth)||!['prebuilt','retained'].includes(row.status))throw xiananAdmissionError();
    mode=row.status;
  }else{row=xiananEntry(builder,data,config,birth,'loading');state.entries.set(data,row);}
  return openXiananWindow(manager,state,row,'load',mode);
}
function finishXiananLoad(manager,control){if(control){if(!hasXiananRegistration(manager.collisionManager,control.row.birth))throw xiananAdmissionError();control.row.status='active';}}
function forgetXiananEntry(manager,data){if(data)xiananManagers.get(manager)?.entries.delete(data);}
function beginXiananUnload(manager,config,builder,data){
  const state=xiananManagerState(manager,config);if(!state)return null;
  const birth=getXiananConstructionBirth(builder.kit);if(!birth)return null;
  const row=state.entries.get(data);if(!sameXiananEntry(row,builder,data,config,birth)||row.status!=='active')throw xiananAdmissionError();
  return openXiananWindow(manager,state,row,'unload','active');
}
function retainXiananEntry(manager,data,retained){const row=xiananManagers.get(manager)?.entries.get(data);if(row){if(retained)row.status='retained';else forgetXiananEntry(manager,data);}}

export class ZoneManager {
  constructor({reuseInactive=false}={}) {
    xiananManagers.set(this,{entries:new WeakMap(),window:null,cm:null,scene:null,library:null});
    this.loadMetrics = new ZoneLoadMetrics();
    this.inactiveCache = reuseInactive ? new InactiveZoneCache() : null;
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
    /** 旧准备耗时：id → ms，不含登记/通知；完整阶段见getLoadMetrics。 */
    this.buildTimes = new Map();
    /** 可选回调：区加载/卸载时通知外部（如阴影 LOD 列表维护） */
    this.lifecycleListeners = new Set();
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
    scene.userData.zoneManager = this;
    this.prebuilt = new Map();
    this.silhouettes = new Map();
    this.library = library;
    this.collisionManager = collisionManager;
    bindChengqianEnvironmentWitness(collisionManager,scene);
    bindXishangEnvironmentWitness(collisionManager,scene);
    bindShouanEntryEnvironmentWitness(collisionManager,scene);bindShoukangEntryEnvironmentWitness(collisionManager,scene);bindEastWellEnvironmentWitness(collisionManager,scene);bindWestWellEnvironmentWitness(collisionManager,scene);bindSishenEnvironmentWitness(collisionManager,scene);
    bindCiyinFacadeEnvironmentWitness(collisionManager,scene);
    bindCiningGateEnvironmentWitness(collisionManager,scene);bindYanshouCompoundEnvironmentWitness(collisionManager,scene);

    // 收集所有区的 regions 和 mapItems（dry 模式：只构建不加入场景）
    console.log('[ZoneManager] 收集所有区的 regions 和 mapItems...');
    for (const [id, config] of this.zones) {
      const trace = beginZoneLoad(this.loadMetrics,id,'startup');
      let builder, data, outcome='error';
      try {
      measureZonePhase(trace,'build',()=>{ builder = new config.BuilderClass(this.library, config); data = builder.build(); });
      rememberXiananPrebuilt(this,config,builder,data);
      this.allRegions.push(...data.regions);
      this.allMapItems.push(...data.mapItems);
      this.allRooms.push(...data.rooms);
      // 启动时预合并；流式加载只提交已完成的结果，不再重复构建。
      this.prebuilt.set(id, { builder, data, detailQuality: this.detailQualityFor(id), config });
      const silhouette = measureZonePhase(trace,'silhouette',()=>buildSilhouette(data.group));
      if (silhouette) {
        data.silhouette = silhouette;
        this.silhouettes.set(id, silhouette);
        silhouette.visible = true;
        scene.add(silhouette);
      }
      builder.releaseConstructionReferences?.();
      outcome='ok';
      } finally { finishZoneLoad(this.loadMetrics,trace,outcome,kitMergeMs(builder)); }
    }
    console.log(`[ZoneManager] 共 ${this.allRegions.length} 个 region, ${this.allMapItems.length} 个 mapItem`);

    // 校验边界重叠
    this.checkOverlaps();

    // 确定初始所在区
    this.currentId = this.findZone(initialPos.x, initialPos.z);
    if (!this.currentId) {
      console.warn('[ZoneManager] 玩家初始位置不在任何区内，当前区回退到首个注册区');
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

    // Initial current zone is synchronous. Only nearby declared neighbors enter
    // the first queue; adjacency can connect points hundreds of metres apart.
    const initial = this.zones.get(this.currentId);
    this.loadZone(this.currentId);
    for (const nid of initial.neighbors ?? []) {
      if (this.distanceToZone(initialPos.x, initialPos.z, this.zones.get(nid).bounds) <= 40) {
        this.buildQueue.push({ zoneId: nid, priority: 1 });
      }
    }
    this.buildQueue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 每帧更新：根据玩家位置调整加载状态，推进构建队列。
   * @param {object} playerPos - 玩家位置 { x, z }
   */
  update(playerPos) {
    this.inactiveCache?.prune();
    if (this.loadAll) return; // ?zones=all 模式无需动态加载

    // 更新当前所在区
    const newId = this.findZone(playerPos.x, playerPos.z);
    if (newId && newId !== this.currentId) {
      this.currentId = newId;
      this.onEnterZone(newId);
    }

    // A teleport can leave prefetch queued for the previous position. Retain
    // only still-relevant work and rank it from this frame's actual position;
    // discarding an ID must not consume its preserved prebuilt/cache owner.
    const queued = new Set();
    this.buildQueue = this.buildQueue.flatMap(({ zoneId }) => {
      const config = this.zones.get(zoneId);
      if (!config || this.loaded.has(zoneId) || queued.has(zoneId)) return [];
      const distance = this.distanceToZone(playerPos.x, playerPos.z, config.bounds);
      if (zoneId !== this.currentId && distance > 40) return [];
      queued.add(zoneId);
      return [{ zoneId, priority: zoneId === this.currentId ? 0 : distance }];
    });

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

    // 推进构建队列（同步任务之间检查8ms预算）
    this.processBuildQueue();
  }

  /**
   * 同步保证点 (x, z) 所在区及其邻区已加载（含碰撞）。
   * 用于传送/瞬移/测试：目标点可能远离当前已加载范围，不能等分帧队列。
   * @returns {string|null} 该点所在区 id
   */
  ensureLoadedAt(x, z) {
    const id = this.findZone(x, z);
    if (!id) return null;
    const ids = [id, ...(this.zones.get(id).neighbors ?? [])];
    for (const zid of ids) {
      this.loadZone(zid);
      this.buildQueue = this.buildQueue.filter(b => b.zoneId !== zid);
    }
    return id;
  }

  /** Read-only final check after synchronous source/spatial load callbacks. */
  assertLoadedForTarget(zoneId, item) {
    const config = this.zones.get(zoneId);
    if (!config || !config.items?.includes(item)) throw new Error('Teleport target owner is not registered');
    for (const id of [zoneId, ...(config.neighbors ?? [])]) {
      if (!this.zones.has(id) || !this.loaded.has(id)) throw new Error('Teleport target zone not admitted: ' + id);
    }
  }

  /** Admit an exact registered source target, not a nearest spatial guess. */
  ensureLoadedForTarget(zoneId, item) {
    const config = this.zones.get(zoneId);
    if (!config || !config.items?.includes(item)) throw new Error('Teleport target owner is not registered');
    const ids = [...new Set([zoneId, ...(config.neighbors ?? [])])];
    // Validate every declaration before performing partial admissions.
    for (const id of ids) if (!this.zones.has(id)) throw new Error('Teleport target neighbor is not registered: ' + id);
    for (const id of ids) {
      this.loadZone(id);
      if (!this.loaded.has(id)) throw new Error('Teleport target zone admission failed: ' + id);
      this.buildQueue = this.buildQueue.filter(b => b.zoneId !== id);
    }
    // Lifecycle notifications can reenter the manager while a neighbor loads.
    if (this.zones.get(zoneId) !== config || !config.items?.includes(item)) throw new Error('Teleport target registration changed during admission');
    for (const id of ids) if (!this.loaded.has(id)) throw new Error('Teleport target zone retired during admission: ' + id);
    return zoneId;
  }

  /**
   * Enter the current zone first. update() immediately queues all zones within
   * 40m of the actual player, rather than every distant topological neighbor.
   */
  onEnterZone(zoneId) {
    console.log(`[ZoneManager] 进入区域: ${zoneId}`);
    const config = this.zones.get(zoneId);
    if (!config) return;

    // Claim a cached destination before admitting the departing zone: this
    // transfers ownership without exceeding the idle budget or rebuilding.
    if (!this.loaded.has(zoneId) && this.inactiveCache?.has(zoneId,config,this.detailQualityFor(zoneId))) this.loadZone(zoneId);

    const visited = this.loaded.get(zoneId);
    if (visited) visited.lastUsedAt = performance.now();

    // Keep current-zone admission first, including a cached return above.
    if (!this.loaded.has(zoneId)) {
      this.buildQueue.push({ zoneId, priority: 0 });
    }
    this.buildQueue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 推进构建队列：任务之间检查8ms，单个同步加载可能超过预算
   */
  processBuildQueue() {
    if (!this.buildQueue.length) return;
    const trace=beginZoneQueue(this.loadMetrics); let processed=0, outcome='error';
    try {
    const frameStart = performance.now();
    const timeLimit = 8; // ms

    while (this.buildQueue.length > 0 && performance.now() - frameStart < timeLimit) {
      const { zoneId } = this.buildQueue.shift();
      if (this.loaded.has(zoneId)) continue;
      processed++;
      this.loadZone(zoneId);
      // 如果 loadZone 耗时超过 8ms，下一帧继续
      if (performance.now() - frameStart >= timeLimit) break;
    }
    outcome='ok';
    } finally { finishZoneQueue(this.loadMetrics,trace,outcome,processed,this.buildQueue.length); }
  }

  /**
   * 加载一个区：构建 + 加入场景 + 注册碰撞
   */
  // Geometry quality is build-time only. Never disturb a loaded zone/player.
  // Queued entries contain only IDs; their synchronous build reads the latest
  // policy when consumed, so no in-flight old builder can revive stale meshes.
  detailQualityFor(id) { return id === 'east-six' ? buildingDetailQuality(this.library) : 'independent'; }

  invalidateBuildingDetailPrebuilt() {
    const quality = buildingDetailQuality(this.library), removed = [];
    for (const id of ['east-six']) {
      this.inactiveCache?.has(id,this.zones.get(id),quality);
      const cached = this.prebuilt?.get(id);
      if (!cached || this.loaded.has(id) || cached.detailQuality === quality) continue;
      this.prebuilt.delete(id);
      cached.builder.dispose();
      removed.push(id);
    }
    return removed;
  }

  loadZone(zoneId) {
    const config = this.zones.get(zoneId);
    if (!config || this.loaded.has(zoneId)) return;
    xiananManagerState(this,config);

    const start = performance.now();
    const detailQuality = this.detailQualityFor(zoneId);
    const trace=beginZoneLoad(this.loadMetrics,zoneId,'cold');
    let cached, outcome='error';
    try { cached=measureZonePhase(trace,'cache',()=>this.prebuilt.get(zoneId) ?? this.inactiveCache?.take(zoneId,config,detailQuality)); }
    catch(error) { finishZoneLoad(this.loadMetrics,trace,'error',null); throw error; }
    try { if(trace) trace.mode=cached?(this.prebuilt.has(zoneId)?'prebuilt':'cached'):'cold'; } catch { /* Optional trace. */ }
    let builder = cached?.builder, data = cached?.data;
    const silhouette = this.silhouettes.get(zoneId);
    const notified = [], previousTime = this.buildTimes.get(zoneId);
    const hadTime = this.buildTimes.has(zoneId);
    let onLoadStarted = false;
    // Transfer ownership before building/registration. Failed admissions are
    // disposed, never returned to prebuilt or the inactive cache for reuse.
    this.prebuilt.delete(zoneId);
    try {
      if (!builder || !data) measureZonePhase(trace,'build',()=>{ builder ??= new config.BuilderClass(this.library, config); data ??= builder.build(); });
      if (!cached) builder.releaseConstructionReferences?.();
      const elapsed = performance.now() - start;
      const xiananLoad=beginXiananLoad(this,config,builder,data,!!cached);
      try {
        measureZonePhase(trace,'scene',()=>{ data.group.visible = true; this.scene.add(data.group); if (silhouette) silhouette.visible = false; });
        measureZonePhase(trace,'colliders',()=>this.collisionManager.addColliders(data.colliders, zoneId));
        measureZonePhase(trace,'walkables',()=>this.collisionManager.addWalkables(data.walkables, zoneId));
        finishXiananLoad(this,xiananLoad);
      } finally { closeXiananWindow(xiananLoad); }
      const entry = cached ?? { builder, data, config, detailQuality };
      entry.lastUsedAt = zoneId === this.currentId ? performance.now() : (entry.lastUsedAt ?? 0);
      this.loaded.set(zoneId, entry);
      this.buildTimes.set(zoneId, +elapsed.toFixed(1));
      measureZonePhase(trace,'notify',()=>{
      for (const listener of this.lifecycleListeners) {
        notified.push(listener);
        listener('load', zoneId, data);
      }
      if (this.onLoad) { onLoadStarted = true; this.onLoad(zoneId, data.group); }
      });
      console.log(`[ZoneManager] 加载区域 ${zoneId}（${config.name}），构建/复用准备 ${elapsed.toFixed(1)}ms（完整加载见F3）`);
      outcome='ok';
    } catch (error) {
      forgetXiananEntry(this,data);
      const cleanupErrors = [];
      measureZonePhase(trace,'rollback',()=>{
      const clean = fn => { try { fn(); } catch (e) { cleanupErrors.push(e); } };
      // Compensate only callbacks whose load notification started, including a
      // callback that partially changed its state and then threw. Keep the entry
      // claimed until cleanup completes to prevent callback-driven re-admission.
      if (onLoadStarted) clean(() => this.onUnload?.(zoneId, data.group));
      for (const listener of notified.reverse()) clean(() => listener('unload', zoneId, data));
      clean(() => this.collisionManager.removeByTag(zoneId));
      clean(() => data?.group.removeFromParent());
      clean(() => builder?.dispose());
      this.loaded.delete(zoneId);
      if (silhouette) silhouette.visible = true;
      if (hadTime) this.buildTimes.set(zoneId, previousTime); else this.buildTimes.delete(zoneId);
      });
      if (cleanupErrors.length) throw new AggregateError([error, ...cleanupErrors], `Zone ${zoneId} admission failed: ${error.message}`, {cause:error});
      throw error;
    } finally { finishZoneLoad(this.loadMetrics,trace,outcome,cached?0:kitMergeMs(builder)); }
  }

  /** Local immutable CPU observations; never drives admission or eviction. */
  getLoadMetrics() { try { return this.loadMetrics.snapshot(); } catch { return null; } }

  /**
   * 卸载一个区：移除场景 + 删除碰撞 + dispose
   */
  unloadZone(zoneId, {retain=true}={}) {
    const entry = this.loaded.get(zoneId);
    if (!entry || unloadingEntries.has(entry)) return;
    unloadingEntries.add(entry);
    const errors=[],attempt=fn=>{try{fn();return true;}catch(error){errors.push(error);return false;}};
    const report=()=>{if(errors.length===1)throw errors[0];if(errors.length>1)throw new AggregateError(errors,`Zone ${zoneId} unload reported errors`);};
    try {
      const { builder, data } = entry;
      for (const listener of [...this.lifecycleListeners]) attempt(()=>listener('unload',zoneId,data));
      attempt(()=>this.onUnload?.(zoneId, data.group));
      let xiananUnload;
      try { xiananUnload=beginXiananUnload(this,entry.config,builder,data); }
      catch(error){errors.push(error);report();}
      // Failed provenance validation above never enters destructive cleanup.
      try {
        const detached=attempt(()=>data.group.removeFromParent());
        const collisionsRemoved=attempt(()=>this.collisionManager.removeByTag(zoneId));
        if(xiananUnload&&detached&&collisionsRemoved)xiananUnload.row.status='detached';
      } finally { closeXiananWindow(xiananUnload); }
      // Only a fault-free completed detachment may transfer into inactive cache.
      // Pending photos and cleanup-error sessions retain their original gate.
      if (!errors.length && retain && this.inactiveCache && builder.dafotangPhotoSession?.status !== 'LOADING' && !['LOADING','DISPOSED_WITH_ERRORS'].includes(builder.dafotangOriginalSession?.status) && entry.config === this.zones.get(zoneId) && entry.detailQuality === this.detailQualityFor(zoneId)) {
        builder.releaseConstructionReferences?.();
        entry.cost = zoneRetainedResourceCost(entry,this.library);
        const retained=this.inactiveCache.put(zoneId,entry,new Set(this.buildQueue.map(q=>q.zoneId)));
        retainXiananEntry(this,data,retained);
      } else {
        // A reported inner failure remains visible, but cannot skip independent
        // retirement bookkeeping. No claim that the failing owner fully freed.
        try { attempt(()=>builder.dispose()); }
        finally {
          forgetXiananEntry(this,data);
          const silhouette = this.silhouettes.get(zoneId);
          if (silhouette) silhouette.visible = true;
          this.loaded.delete(zoneId);
        }
      }
      const silhouette = this.silhouettes.get(zoneId);
      if (silhouette) silhouette.visible = true;
      this.loaded.delete(zoneId);
      report();
      console.log(`[ZoneManager] 卸载区域 ${zoneId}`);
    } finally { unloadingEntries.delete(entry); }
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
        // 边贴边（如 ningshou.z0 === outer-east.z1）不算重叠
        const overlap = !(b1.x1 <= b2.x0 || b2.x1 <= b1.x0 || b1.z1 <= b2.z0 || b2.z1 <= b1.z0);
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
      this.unloadZone(id,{retain:false});
    }
    this.inactiveCache?.clear();
    for (const { builder } of this.prebuilt.values()) builder.dispose();
    this.prebuilt.clear();
    for (const silhouette of this.silhouettes.values()) {
      silhouette.removeFromParent();
      silhouette.geometry.dispose();
      silhouette.material.dispose();
    }
    this.silhouettes.clear();
    unbindChengqianEnvironmentWitness(this.collisionManager);
    unbindXishangEnvironmentWitness(this.collisionManager);
    unbindShouanEntryEnvironmentWitness(this.collisionManager);unbindShoukangEntryEnvironmentWitness(this.collisionManager);unbindEastWellEnvironmentWitness(this.collisionManager);unbindWestWellEnvironmentWitness(this.collisionManager);unbindSishenEnvironmentWitness(this.collisionManager);
    unbindCiyinFacadeEnvironmentWitness(this.collisionManager);
    unbindCiningGateEnvironmentWitness(this.collisionManager);unbindYanshouCompoundEnvironmentWitness(this.collisionManager);
    delete this.scene.userData.zoneManager;
    this.zones.clear();
    this.buildQueue.length = 0;
    try { this.loadMetrics.clear(); } catch { /* Optional observations cannot break disposal. */ }
  }
}
