import {canRecoverInwardFromWuyingRail} from '../scene/palace/special/WuyingThreeBridgeRails.js';
import {canCrossFubiPool} from '../scene/garden/FubiArchPool.js';
import {canCrossLinxiPool} from '../scene/palace/special/LinxiBridgePool.js';
import {cloneXiqingSurface,xiqingSurfaceFootContact,xiqingSurfaceBodyIntersects,xiqingSurfaceSweep} from '../controls/XiqingRoofSurface.js';
import {cloneFurnitureMotionScope,furnitureScope,furnitureContact,furnitureTryStep,resolveFurnitureVertical} from '../controls/FurnitureMotion.js';
import {duixiuScope,duixiuContact,duixiuTryStep,resolveDuixiuVertical} from '../scene/garden/DuixiuMotion.js';
import {DuixiuTerrainIndex} from '../scene/garden/DuixiuTerrain.js';
import {triangleInstance, triangleFootContact, triangleBodyIntersects, triangleBodySweptIntersects, triangleBodySweepFraction} from './TriangleSupport.js';
import { canCrossOuterMoat, canTraverseOuterMoat } from '../scene/palace/special/OuterMoat.js';
import * as THREE from 'three';
import { DIMENSIONS, LAYOUT, PLAYER } from '../config/constants.js';
import { PALACE_LAYOUT } from '../scene/Layout.js';
import { canCrossPalaceWater } from '../scene/palace/special/SouthWaterSystem.js';
import {cloneOverheadShape, overheadIntersectsBox, overheadHeightAtFootprint} from './OverheadShape.js';
import {validateDynamicBodies, bodyPenetration, sweptPlayerBodyPenetration, pointSegmentDistance} from '../scene/characters/CharacterBody.js';

/** 玩家碰撞盒底部离脚面的抬升量：低于此高度的台阶/门槛直接跨过，不当成墙。 */
const STEP_CLEARANCE = 0.35;
/** 与 FirstPerson 传入的既有半径一致；位置标签也沿用同一身体净空，不改变碰撞策略。 */
const DEFAULT_PLAYER_RADIUS = 0.5;

/** 实体碰撞代理与河道通行检查；不把整个建筑的空区当成实心。 */
export class CollisionManager {
  constructor() {
    this.colliders = [];
    /**
     * 可行走面（台基顶面、楼梯斜坡、桥面）。
     * - { type: 'box', box: Box3 }：顶面高度 = box.max.y，XZ 范围取 box。
     * - { type: 'ramp', minX, maxX, minZ, maxZ, axis: 'x'|'z', a0, a1, y0, y1 }：
     *   沿 axis 从坐标 a0（高度 y0）到 a1（高度 y1）线性过渡。
     *   Optional crossMin0/crossMax0/crossMin1/crossMax1 bound a tapered
     *   cross-axis interval at a0/a1; absent fields preserve rectangles.
     */
    this.walkables = [];
    this.playerBox = new THREE.Box3();
    this.playerSize = new THREE.Vector3();
    this.playerCenter = new THREE.Vector3();
    this.rivers = PALACE_LAYOUT.filter(item => item.type === 'river');
    this.moats = PALACE_LAYOUT.filter(item => item.type === 'moat');
    // Separate pedestrian channel: never part of static grids, support,
    // world-generation proofs, raycasts or helicopter flight envelopes.
    this.dynamicBodies = new Map();
  }

  addCollider(object, tag) {
    const box = object.isBox3 ? object.clone() : new THREE.Box3().setFromObject(object);
    const furnitureMotionScope=cloneFurnitureMotionScope(object.furnitureMotionScope,box);
    const overhead = object.overhead === undefined ? null : cloneOverheadShape(object.overhead, box);
    const input = object.triangleSupport;
    const xiqingRoofSurface=cloneXiqingSurface(object.xiqingRoofSurface,box);
    if(xiqingRoofSurface&&(input||overhead||(furnitureMotionScope&&!(['qianqing-display','qianqing-assemblies','fengxian-front-vats','yanchun-front-vessels','suichu-front-basins'].includes(furnitureMotionScope.kind)&&furnitureMotionScope.id===xiqingRoofSurface.id))||object.duixiuTerrain))throw new TypeError('Xiqing surface has exclusive explicit ownership');
    if(xiqingRoofSurface&&this.colliders.some(c=>c.xiqingRoofSurface?.id===xiqingRoofSurface.id))throw new TypeError('Duplicate Xiqing roof owner');
    if(furnitureMotionScope&&(overhead||input))throw new TypeError('Furniture scope owner must be an ordinary solid box');
    if (object.duixiuTerrain && !input) throw new TypeError('Duixiu terrain requires exact triangle ownership');
    const triangleSupport = input ? triangleInstance(input.template, input.offset.toArray(), input.id) : null;
    if (triangleSupport && (overhead || !box.equals(triangleSupport.box))) throw new TypeError('Triangle collider requires exact owned bounds');
    if (triangleSupport && (object.duixiuTerrain === true && this._duixiuBatchIds
      ? this._duixiuBatchIds.has(triangleSupport.id)
      : this.colliders.some(c => c.triangleSupport?.id === triangleSupport.id))) throw new TypeError('Duplicate triangle owner');
    if(furnitureMotionScope?.kind==='xishang-roof-transom'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='xishang-roof-transom'))throw new TypeError('Duplicate Xishang original anchor');
    if(furnitureMotionScope?.kind==='jiyun-upper-front-rail'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='jiyun-upper-front-rail'))throw new TypeError('Duplicate Jiyun original anchor');
    if(furnitureMotionScope?.kind==='east-well'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='east-well'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate East well original anchor');
    if(furnitureMotionScope?.kind==='west-well'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='west-well'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate West well original anchor');
    if(furnitureMotionScope?.kind==='sishen'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='sishen'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate Sishen original anchor');
    if(furnitureMotionScope?.kind==='shoukang-entry'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='shoukang-entry'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate Shoukang entry original anchor');
    if(furnitureMotionScope?.kind==='changchun-west-interior'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='changchun-west-interior'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate Changchun west original anchor');
    if(furnitureMotionScope?.kind==='shouan-entry'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='shouan-entry'))throw new TypeError('Duplicate Shouan entry original anchor');
    if(furnitureMotionScope?.kind==='ciyin-front'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='ciyin-front'))throw new TypeError('Duplicate Ciyin facade original anchor');
    if(furnitureMotionScope?.kind==='yanshou-compound'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='yanshou-compound'))throw new TypeError('Duplicate Yanshou compound original anchor');
    if(furnitureMotionScope?.kind==='cining-gate'&&this.colliders.some(c=>c.furnitureMotionScope?.kind==='cining-gate'))throw new TypeError('Duplicate Cining gate original anchor');
    if (!box.isEmpty()) this.colliders.push({ mesh: object, box, tag, ...(overhead ? {overhead} : {}), ...(triangleSupport ? {triangleSupport} : {}), ...(xiqingRoofSurface ? {xiqingRoofSurface} : {}), ...(object.duixiuTerrain === true ? {duixiuTerrain:true} : {}), ...(furnitureMotionScope ? {furnitureMotionScope} : {}) });
    if (!box.isEmpty() && triangleSupport && this._duixiuBatchIds) this._duixiuBatchIds.add(triangleSupport.id);
  }

  addColliders(objects, tag) {
    if (!objects.some(object => object.duixiuTerrain === true)) {
      objects.forEach(object => this.addCollider(object, tag));
      return;
    }
    // Explicit terrain batches keep all per-object validation but avoid O(N²)
    // duplicate scans during streamed zone registration. Never a persistent cache.
    const previous=this._duixiuBatchIds;
    this._duixiuBatchIds=new Set(this.colliders.filter(c=>c.triangleSupport).map(c=>c.triangleSupport.id));
    try { objects.forEach(object => this.addCollider(object, tag)); }
    finally { if(previous===undefined)delete this._duixiuBatchIds;else this._duixiuBatchIds=previous; }
  }

  addWalkable(walkable, tag) {
    if (!walkable) return;
    if (walkable.type === 'box') {
      const box = walkable.box.isBox3 ? walkable.box.clone() : new THREE.Box3().setFromObject(walkable.box);
      // rescue: false —— 不做"钻进台基托回台面"（城台顶面下方有门洞，从门洞穿过时不能被托上城台）
      if (!box.isEmpty()) this.walkables.push({ type: 'box', box, rescue: walkable.rescue !== false, tag });
      return;
    }
    if (walkable.type === 'ramp') {
      const r = walkable;
      const taper = ['crossMin0', 'crossMax0', 'crossMin1', 'crossMax1'];
      const hasTaper = taper.some(key => r[key] !== undefined);
      if (hasTaper && (!taper.every(key => Number.isFinite(r[key])) || r.crossMin0 > r.crossMax0 || r.crossMin1 > r.crossMax1)) {
        throw new Error('Invalid tapered ramp: four finite, ordered cross-axis bounds are required');
      }
      this.walkables.push({
        type: 'ramp',
        minX: Math.min(r.minX, r.maxX), maxX: Math.max(r.minX, r.maxX),
        minZ: Math.min(r.minZ, r.maxZ), maxZ: Math.max(r.minZ, r.maxZ),
        axis: r.axis === 'x' ? 'x' : 'z', a0: r.a0, a1: r.a1, y0: r.y0, y1: r.y1,
        ...(hasTaper
          ? { crossMin0: r.crossMin0, crossMax0: r.crossMax0, crossMin1: r.crossMin1, crossMax1: r.crossMax1 } : {}),
        tag,
      });
    }
  }

  addWalkables(list, tag) {
    (list ?? []).forEach(item => this.addWalkable(item, tag));
  }

  /**
   * 删除带指定 tag 的所有 colliders 和 walkables（用于区域卸载）
   */
  removeByTag(tag) {
    if (!tag) return;
    const beforeC = this.colliders.length;
    const beforeW = this.walkables.length;
    this.colliders = this.colliders.filter(c => c.tag !== tag);
    this.walkables = this.walkables.filter(w => w.tag !== tag);
    const removedC = beforeC - this.colliders.length;
    const removedW = beforeW - this.walkables.length;
    if (removedC > 0 || removedW > 0) {
      this._grid = null; // 重建网格
    }
  }

  /**
   * 脚点 (x, z) 处的地面高度：取所有覆盖该点、且顶面不高于 feetY + stepUp 的可行走面中最高者；
   * 没有任何可行走面时为地面 0。
   */
  getGroundHeight(x, z, feetY = 0, stepUp = 0.6, radius = .5) {
    const furniturePoint=new THREE.Vector3(x,feetY,z);
    if(Number.isFinite(feetY)&&furnitureScope(this,furniturePoint,furniturePoint,radius,undefined,undefined,feetY))return furnitureContact(this,x,z,feetY+stepUp,radius).surface?.height??0;
    let ground = 0;
    let rescue = 0;
    const limit = feetY + stepUp;
    const m = 0.6; // 台基实体内缩量：玩家半径 + 余量
    for (const w of this.walkables) {
      let top;
      if (w.type === 'box') {
        const b = w.box;
        if (x < b.min.x || x > b.max.x || z < b.min.z || z > b.max.z) continue;
        top = b.max.y;
        // 台基是实心的：脚点已深入台基投影内部却低于台面，说明从台阶口"钻"进了台基，直接托回台面，
        // 杜绝"走到楼梯顶掉到宫殿底下"。
        if (w.rescue && top > limit && x > b.min.x + m && x < b.max.x - m && z > b.min.z + m && z < b.max.z - m) {
          rescue = Math.max(rescue, top);
        }
      } else {
        if (x < w.minX || x > w.maxX || z < w.minZ || z > w.maxZ) continue;
        const a = w.axis === 'x' ? x : z;
        const t = w.a1 === w.a0 ? 1 : Math.min(1, Math.max(0, (a - w.a0) / (w.a1 - w.a0)));
        // Optional trapezoidal boundary: cross-axis edges interpolate at the
        // same t as the height. Legacy rectangular ramps retain their exact path.
        if (w.crossMin0 !== undefined) {
          const cross = w.axis === 'x' ? z : x;
          const low = w.crossMin0 + (w.crossMin1 - w.crossMin0) * t;
          const high = w.crossMax0 + (w.crossMax1 - w.crossMax0) * t;
          if (cross < low - 1e-9 || cross > high + 1e-9) continue;
        }
        top = w.y0 + (w.y1 - w.y0) * t;
      }
      if (top > limit || top <= ground) continue;
      ground = top;
    }
    const p = new THREE.Vector3(x,0,z);
    const terrain = duixiuScope(this,p,p,radius) ? duixiuContact(this,x,z,limit,radius) : null;
    return Math.max(ground, rescue, this.supportContact(x,z,limit)?.height ?? -Infinity, terrain?.poseClear ? terrain.surface.height : -Infinity);
  }

  setDynamicBodies(owner, bodies) {
    if(!owner)throw new TypeError('Dynamic bodies require an owner');
    const validated=validateDynamicBodies(bodies); // atomic: invalid update keeps the old set
    if(validated.length)this.dynamicBodies.set(owner,validated);else this.dynamicBodies.delete(owner);
  }
  clearDynamicBodies(owner) { this.dynamicBodies.delete(owner); }
  checkDynamicCollision(position,radius=DEFAULT_PLAYER_RADIUS,from=null) {
    const player={position:[position.x,position.y-PLAYER.HEIGHT,position.z],radius,height:PLAYER.HEIGHT};
    const previous=from?{...player,position:[from.x,from.y-PLAYER.HEIGHT,from.z]}:null;
    for(const bodies of this.dynamicBodies.values())for(const body of bodies){
      const depth=bodyPenetration(body,player);
      if(!previous){if(depth>1e-7)return true;continue;}
      const old=bodyPenetration(body,previous),swept=sweptPlayerBodyPenetration(body,previous,player);
      if(old>1e-7&&depth<old-1e-7&&swept<=old+1e-7)continue; // only outward escape
      if(swept>1e-7)return true;
    }
    return false;
  }
  limitDynamicFeet(x,z,fromFeet,toFeet,radius=DEFAULT_PLAYER_RADIUS,height=PLAYER.HEIGHT) {
    let allowed=toFeet;
    for(const bodies of this.dynamicBodies.values())for(const body of bodies)for(const p of body.parts){
      if(pointSegmentDistance(x,z,p)>=radius+p.radius-1e-7)continue;
      if(toFeet>fromFeet&&fromFeet+height<=p.minY+1e-7&&toFeet+height>p.minY)allowed=Math.min(allowed,p.minY-height);
      if(toFeet<fromFeet&&fromFeet>=p.maxY-1e-7&&toFeet<p.maxY)allowed=Math.max(allowed,p.maxY);
    }
    return allowed;
  }

  checkCollision(position, radius = DEFAULT_PLAYER_RADIUS, dynamicFrom = null) {
    if (!this.checkBoundary(position, radius) || !this.checkRiverCrossing(position, radius, dynamicFrom, position.y-PLAYER.HEIGHT, dynamicFrom ? dynamicFrom.y-PLAYER.HEIGHT : null)) return true;
    // 视点是头部（脚面 + PLAYER.HEIGHT）；碰撞体从脚面上方 STEP_CLEARANCE 到头顶，矮台阶可直接跨过。
    const feetY = position.y - PLAYER.HEIGHT;
    const bottom = feetY + STEP_CLEARANCE;
    const top = position.y - 0.05;
    this.playerSize.set(radius * 2, top - bottom, radius * 2);
    this.playerCenter.set(position.x, (top + bottom) / 2, position.z);
    this.playerBox.setFromCenterAndSize(this.playerCenter, this.playerSize);
    // Only explicitly authored overhead curves use a full feet-to-eye box.
    // Historical unmarked boxes retain their exact clearance/eye inset above.
    this._overheadBodyBox ??= new THREE.Box3();
    this._overheadBodyBox.copy(this.playerBox);
    this._overheadBodyBox.min.y = feetY;
    this._overheadBodyBox.max.y = position.y;
    this._triangleBodyBox ??= new THREE.Box3();
    this._triangleBodyBox.copy(this._overheadBodyBox);
    // Explicit marked solids retain full feet-to-eye contact; only numerical
    // boundary coincidence is excluded, never a positive-depth foot region.
    this._triangleBodyBox.min.y+=1e-8;
    this._triangleFromBox ??= new THREE.Box3();
    if(dynamicFrom)this._triangleFromBox.copy(this._triangleBodyBox).translate(new THREE.Vector3().subVectors(dynamicFrom,position));
    const broad=this._triangleBodyBox.clone();if(dynamicFrom)broad.union(this._triangleFromBox);
    return this.queryBox(broad).some(collider => collider.xiqingRoofSurface
      ? (dynamicFrom ? !!xiqingSurfaceSweep(collider.xiqingRoofSurface,this._overheadBodyBox.clone().translate(new THREE.Vector3().subVectors(dynamicFrom,position)),this._overheadBodyBox) : xiqingSurfaceBodyIntersects(collider.xiqingRoofSurface,this._overheadBodyBox))
      : collider.triangleSupport
      ? (dynamicFrom ? triangleBodySweptIntersects(collider.triangleSupport,this._triangleFromBox,this._triangleBodyBox) : triangleBodyIntersects(collider.triangleSupport, this._triangleBodyBox))
      : collider.overhead
      ? overheadIntersectsBox(collider.overhead, this._overheadBodyBox)
      : this.playerBox.intersectsBox(collider.box)) || this.checkDynamicCollision(position,radius,dynamicFrom);
  }

  /** Upward-only head sweep for explicitly tagged curved solids. No ceiling
   * inference from old AABBs, no downward attraction, and no extra registry. */
  limitUpwardFeet(x, z, fromFeet, toFeet, radius = DEFAULT_PLAYER_RADIUS, height = PLAYER.HEIGHT) {
    if (![x,z,fromFeet,toFeet,radius,height].every(Number.isFinite) || radius <= 0 || height <= 0)
      throw new TypeError('Finite positive overhead footprint is required');
    if (toFeet <= fromFeet) return toFeet;
    this._headSweepBox ??= new THREE.Box3();
    this._headSweepBox.min.set(x-radius, fromFeet+height, z-radius);
    this._headSweepBox.max.set(x+radius, toFeet+height, z+radius);
    let allowed = toFeet;
    for (const collider of this.queryBox(this._headSweepBox)) {
      if (!collider.overhead || fromFeet >= collider.overhead.topY) continue;
      const ceiling = overheadHeightAtFootprint(collider.overhead, x-radius, x+radius, z-radius, z+radius);
      if (ceiling >= fromFeet+height-1e-7 && ceiling <= toFeet+height+1e-7)
        allowed = Math.min(allowed, Math.max(fromFeet, ceiling-height-0.001));
    }
    return allowed;
  }

  /** Explicit triangle-only continuous vertical impact. Non-foot body contact
   * remains airborne and slides at a bounded 1m/s, never grants a jump/floor.
   * Old boxes/ramps and dynamic actors keep their existing paths. */
  resolveTriangleVertical(x,z,fromFeet,toFeet,delta,radius=.5,height=PLAYER.HEIGHT) {
    const make=(xx,zz,y)=>new THREE.Box3(new THREE.Vector3(xx-radius,y+1e-8,zz-radius),new THREE.Vector3(xx+radius,y+height,zz+radius));
    const start=make(x,z,fromFeet),target=make(x,z,toFeet),shapes=this.queryBox(start.clone().union(target)).filter(c=>c.triangleSupport);
    if(!shapes.length)return null;
    let fraction=null,impacted=null;
    for(const c of shapes){const t=triangleBodySweepFraction(c.triangleSupport,start,target,{includeBoundary:true});if(t!==null&&(fraction===null||t<fraction)){fraction=t;impacted=c;}}
    if(fraction===null)return null;
    const feet=fromFeet+(toFeet-fromFeet)*Math.max(0,fraction-1e-9);
    if(toFeet>=fromFeet)return {x,z,feet,landed:false,kind:'head-impact'};
    const witness=this.supportContact(x,z,feet+1e-7);
    if(witness&&Math.abs(witness.height-feet)<1e-6)return {x,z,feet:witness.height,landed:true,witness,kind:'foot-impact'};
    const center=impacted.box.getCenter(new THREE.Vector3()),size=impacted.box.getSize(new THREE.Vector3());
    // Long rail bands slide across their narrow side, not toward a remote end.
    const dx=size.x*2<size.z ? Math.sign(x-center.x)||1 : x-center.x;
    const dz=size.z*2<size.x ? Math.sign(z-center.z)||1 : size.x*2<size.z ? 0 : z-center.z;
    const length=Math.hypot(dx,dz);
    if(length<1e-9)return {x,z,feet,landed:false,kind:'blocked-body-impact'};
    const distance=Math.min(Math.max(0,delta),.1),xx=x+dx/length*distance,zz=z+dz/length*distance;
    const eye=new THREE.Vector3(xx,feet+height,zz),before=new THREE.Vector3(x,feet+height,z);
    // Entire response displacement obeys normal water, static, and actor guards.
    if(!this.checkCollision(eye,radius,before))return {x:xx,z:zz,feet,landed:false,kind:'bounded-body-slide'};
    return {x,z,feet,landed:false,kind:'blocked-body-impact'};
  }

  /**
   * 空间网格（XZ 平面，CELL 米一格）：碰撞体多了以后只检查附近格子里的，射线/子弹检测也可复用。
   * 碰撞体增删后自动失效重建。
   */
  _buildGrid() {
    const CELL = 8;
    const grid = new Map();
    for (const c of this.colliders) {
      if (c.duixiuTerrain) continue;
      const b = c.box;
      const i0 = Math.floor(b.min.x / CELL), i1 = Math.floor(b.max.x / CELL);
      const k0 = Math.floor(b.min.z / CELL), k1 = Math.floor(b.max.z / CELL);
      for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) {
        const key = i * 100003 + k;
        let list = grid.get(key);
        if (!list) grid.set(key, list = []);
        list.push(c);
      }
    }
    this._grid = { CELL, grid, count: this.colliders.length,
      terrainIndex: new DuixiuTerrainIndex(this.colliders.filter(c => c.duixiuTerrain)),
      order: new Map(this.colliders.map((c,i) => [c,i])) };
  }

  /** 返回与 box 的 XZ 投影可能相交的碰撞体（去重） */
  queryBox(box) {
    if (!this._grid || this._grid.count !== this.colliders.length) this._buildGrid();
    const { CELL, grid } = this._grid;
    const i0 = Math.floor(box.min.x / CELL), i1 = Math.floor(box.max.x / CELL);
    const k0 = Math.floor(box.min.z / CELL), k1 = Math.floor(box.max.z / CELL);
    const terrainGrid=this._duixiuGrid(),terrain = terrainGrid.terrainIndex.query(box);
    const order=c=>terrainGrid.order.get(c)??this._grid.order.get(c);
    const merge = original => terrain.length ? [...original,...terrain].sort((a,b) => order(a)-order(b)) : original;
    if (i0 === i1 && k0 === k1) return merge(grid.get(i0 * 100003 + k0) ?? []);
    const out = new Set();
    for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) grid.get(i * 100003 + k)?.forEach(c => out.add(c));
    return merge([...out]);
  }

  /**
   * 脚下碰撞体能提供的支撑高度：脚印（半径 r）范围内、顶面不高于 maxTop 的碰撞体顶面最大值。
   * 跳到栏杆、家具、矮墙上时用它当"地面"，避免从上方落进碰撞体里卡死。没有则返回 -Infinity。
   */
  supportContact(x, z, maxTop, r = 0.3) {
    const box = new THREE.Box3(new THREE.Vector3(x-r,-1e3,z-r),new THREE.Vector3(x+r,1e3,z+r));
    let roofBest=null,best=null;
    for (const c of this.queryBox(box)) {
      if(c.xiqingRoofSurface){const hit=xiqingSurfaceFootContact(c.xiqingRoofSurface,x,z,maxTop,r);if(hit&&(!roofBest||hit.height>roofBest.height))roofBest=hit;}
      if (c.triangleSupport && !c.duixiuTerrain) {
      const hit = triangleFootContact(c.triangleSupport,x,z,r,1e6);
      if (hit && (!best || hit.height > best.height)) best = hit;
      }
    }
    if(!best || best.height > maxTop + 1e-8)return roofBest;
    const body=new THREE.Box3(new THREE.Vector3(x-.5,best.height+1e-8,z-.5),new THREE.Vector3(x+.5,best.height+PLAYER.HEIGHT,z+.5));
    if(this.queryBox(body).some(c=>c.triangleSupport&&triangleBodyIntersects(c.triangleSupport,body)))return roofBest;
    return roofBest&&roofBest.height>best.height?roofBest:best;
  }

  supportHeight(x, z, maxTop, r = 0.3) {
    this._footBox ??= new THREE.Box3();
    this._footBox.min.set(x - r, -1e3, z - r);
    this._footBox.max.set(x + r, 1e3, z + r);
    let best = this.supportContact(x,z,maxTop,r)?.height ?? -Infinity;
    for (const c of this.queryBox(this._footBox)) {
      // Head-only proxies must not create support from their broadphase top.
      if (c.triangleSupport || c.xiqingRoofSurface) continue;
      if (c.overhead) continue;
      const b = c.box;
      if (b.max.y > maxTop || b.max.y <= best) continue;
      if (x + r < b.min.x || x - r > b.max.x || z + r < b.min.z || z - r > b.max.z) continue;
      best = b.max.y;
    }
    return best;
  }

  checkBoundary(position, radius = DEFAULT_PLAYER_RADIUS) {
    const { minX, maxX, minZ, maxZ } = LAYOUT.BOUNDARY;
    return position.x - radius >= minX && position.x + radius <= maxX &&
      position.z - radius >= minZ && position.z + radius <= maxZ;
  }

  checkRiverCrossing(position, radius, from = null, feetY = null, fromFeetY = null) {
    return canCrossFubiPool(position, radius) && canCrossLinxiPool(position, radius) && this.rivers.every(river => canCrossPalaceWater(river, position, radius) || canRecoverInwardFromWuyingRail(this,river,from,position,radius,fromFeetY,feetY)) &&
      this.moats.every(moat => from ? canTraverseOuterMoat(moat, from, position, radius) : canCrossOuterMoat(moat, position, radius));
  }

  /**
   * 水平移动 + 碰撞修正（沿墙滑动）。
   * 传入 feetY 时，每个细分小步都重新贴合地面（台阶/坡道），并用该小步的地面高度做碰撞检测。
   * 这样低帧率或快走时一帧走 1m 以上，也不会因为"一帧抬升超过可迈高度"而判定上不去台阶、
   * 继续以地面高度从楼梯口钻进台基内部（表现为走到楼梯顶突然掉到台基下面）。
   * 结果的地面高度写入 this.lastGroundY。
   */
  getValidPosition(currentPosition, targetPosition, radius = DEFAULT_PLAYER_RADIUS, feetY = null, stepUp = PLAYER.STEP_UP ?? 0.6, airFeet = null, motion = null) {
    this.lastDuixiuStepFeet = null;
    this.lastFurnitureStepFeet = null;
    // airFeet：空中（跳跃/下落）时的实际脚面高度。碰撞按身体真实高度判定（可越过矮栏杆），
    // 落脚面按真实脚面查询（跳到高于原地面的台面上也能落住）。
    const distance = Math.hypot(targetPosition.x - currentPosition.x, targetPosition.z - currentPosition.z);
    const steps = Math.max(1, Math.ceil(distance / Math.max(radius * 0.5, 0.05)));
    const dx = (targetPosition.x - currentPosition.x) / steps;
    const dz = (targetPosition.z - currentPosition.z) / steps;
    const valid = currentPosition.clone();
    const candidate = currentPosition.clone();
    const track = feetY !== null && feetY !== undefined;
    let ground = track ? feetY : 0;
    const air = track && airFeet !== null && airFeet !== undefined;
    let furnitureFeet=motion?.feetY??(motion?.kind==='kinematic'?feetY:airFeet??feetY)??(currentPosition.y-PLAYER.HEIGHT);
    const tryMove = (x, z) => {
      const proposed = new THREE.Vector3(x,valid.y,z);
      if(furnitureScope(this,valid,proposed,radius,motion?.kind==='player'?furnitureFeet:undefined,undefined,furnitureFeet)) {
        const fromFeet=new THREE.Vector3(valid.x,furnitureFeet,valid.z),toFeet=new THREE.Vector3(x,furnitureFeet,z);
        const result=furnitureTryStep(this,fromFeet,toFeet,radius,stepUp,motion);
        if(!result.accepted)return false;
        furnitureFeet=result.feetY;valid.set(result.position.x,furnitureFeet+PLAYER.HEIGHT,result.position.z);ground=result.groundY;
        // Every accepted local substep carries the final exact feet scalar; a
        // later plain segment must not erase a lift accepted earlier this call.
        this.lastFurnitureStepFeet=result.feetY;
        return true;
      }
      if(duixiuScope(this,valid,proposed,radius)) {
        const result=duixiuTryStep(this,valid,proposed,radius,stepUp,motion);
        if(!result.accepted)return false;
        valid.copy(result.position);ground=result.groundY;
        this.lastDuixiuStepFeet=result.settled?result.feetY:null;
        return true;
      }
      const g = track ? this.getGroundHeight(x, z, air ? Math.max(airFeet, ground) : ground, stepUp) : 0;
      const bodyFeet = air ? Math.max(g, airFeet) : g;
      candidate.set(x, track ? bodyFeet + PLAYER.HEIGHT : valid.y, z);
      if (this.checkCollision(candidate, radius, valid)) return false;
      valid.copy(candidate);
      if (track) ground = g;
      return true;
    };
    for (let i = 0; i < steps; i++) {
      if (tryMove(valid.x + dx, valid.z + dz)) continue;
      tryMove(valid.x + dx, valid.z);
      tryMove(valid.x, valid.z + dz);
    }
    this.lastGroundY = ground;
    return valid;
  }

  updateCollider(object) {
    const collider = this.colliders.find(item => item.mesh === object);
    if (collider) {
      const box = object.isBox3 ? object.clone() : new THREE.Box3().setFromObject(object);
      if(collider.furnitureMotionScope&&object.furnitureMotionScope===undefined)throw new TypeError('Furniture scope cannot disappear');
      if(collider.furnitureMotionScope?.kind==='xishang-roof-transom'&&(object.furnitureMotionScope?.kind!=='xishang-roof-transom'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Xishang anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='jiyun-upper-front-rail'&&(object.furnitureMotionScope?.kind!=='jiyun-upper-front-rail'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Jiyun anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='east-well'&&(object.furnitureMotionScope?.kind!=='east-well'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('East well anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='west-well'&&(object.furnitureMotionScope?.kind!=='west-well'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('West well anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='sishen'&&(object.furnitureMotionScope?.kind!=='sishen'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Sishen anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='shoukang-entry'&&(object.furnitureMotionScope?.kind!=='shoukang-entry'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Shoukang entry anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='changchun-west-interior'&&(object.furnitureMotionScope?.kind!=='changchun-west-interior'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Changchun west anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='shouan-entry'&&(object.furnitureMotionScope?.kind!=='shouan-entry'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Shouan entry anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='ciyin-front'&&(object.furnitureMotionScope?.kind!=='ciyin-front'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Ciyin facade anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='yanshou-compound'&&(object.furnitureMotionScope?.kind!=='yanshou-compound'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Yanshou compound anchor ownership cannot change');
      if(collider.furnitureMotionScope?.kind==='cining-gate'&&(object.furnitureMotionScope?.kind!=='cining-gate'||object.furnitureMotionScope?.id!==collider.furnitureMotionScope.id))throw new TypeError('Cining gate anchor ownership cannot change');
      const furnitureMotionScope=cloneFurnitureMotionScope(object.furnitureMotionScope,box);
      if(furnitureMotionScope?.kind==='xishang-roof-transom'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='xishang-roof-transom'))throw new TypeError('Duplicate Xishang original anchor');
      if(furnitureMotionScope?.kind==='jiyun-upper-front-rail'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='jiyun-upper-front-rail'))throw new TypeError('Duplicate Jiyun original anchor');
      if(furnitureMotionScope?.kind==='east-well'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='east-well'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate East well original anchor');
      if(furnitureMotionScope?.kind==='west-well'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='west-well'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate West well original anchor');
      if(furnitureMotionScope?.kind==='sishen'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='sishen'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate Sishen original anchor');
      if(furnitureMotionScope?.kind==='shoukang-entry'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='shoukang-entry'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate Shoukang entry original anchor');
      if(furnitureMotionScope?.kind==='changchun-west-interior'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='changchun-west-interior'&&c.furnitureMotionScope.id===furnitureMotionScope.id))throw new TypeError('Duplicate Changchun west original anchor');
      if(furnitureMotionScope?.kind==='shouan-entry'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='shouan-entry'))throw new TypeError('Duplicate Shouan entry original anchor');
      if(furnitureMotionScope?.kind==='ciyin-front'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='ciyin-front'))throw new TypeError('Duplicate Ciyin facade original anchor');
      if(furnitureMotionScope?.kind==='yanshou-compound'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='yanshou-compound'))throw new TypeError('Duplicate Yanshou compound original anchor');
      if(furnitureMotionScope?.kind==='cining-gate'&&this.colliders.some(c=>c!==collider&&c.furnitureMotionScope?.kind==='cining-gate'))throw new TypeError('Duplicate Cining gate original anchor');
      if (collider.overhead && object.overhead === undefined) throw new TypeError('Scoped overhead shape cannot disappear during an update');
      const overhead = object.overhead === undefined ? null : cloneOverheadShape(object.overhead, box);
      if(collider.xiqingRoofSurface&&object.xiqingRoofSurface?.id!==collider.xiqingRoofSurface.id)throw new TypeError('Xiqing surface ownership cannot disappear');
      const xiqingRoofSurface=cloneXiqingSurface(object.xiqingRoofSurface,box);
      if(xiqingRoofSurface&&((furnitureMotionScope&&!(['qianqing-display','qianqing-assemblies','fengxian-front-vats','yanchun-front-vessels','suichu-front-basins'].includes(furnitureMotionScope.kind)&&furnitureMotionScope.id===xiqingRoofSurface.id))||overhead||object.triangleSupport||object.duixiuTerrain))throw new TypeError('Xiqing surface has exclusive explicit ownership');
      if(xiqingRoofSurface&&this.colliders.some(c=>c!==collider&&c.xiqingRoofSurface?.id===xiqingRoofSurface.id))throw new TypeError('Duplicate Xiqing roof owner');
      if(furnitureMotionScope&&(overhead||object.triangleSupport))throw new TypeError('Furniture scope owner must be an ordinary solid box');
      if (collider.duixiuTerrain && object.duixiuTerrain !== true) throw new TypeError('Duixiu terrain marker cannot disappear');
      if (collider.triangleSupport) {
        const input=object.triangleSupport;
        if(!input || input.id!==collider.triangleSupport.id)throw new TypeError('Triangle ownership cannot disappear');
        const next=triangleInstance(input.template,input.offset.toArray(),input.id);
        if(!box.equals(next.box))throw new TypeError('Triangle bounds mismatch');
        collider.triangleSupport=next;
      }
      collider.box.copy(box);
      if(xiqingRoofSurface)collider.xiqingRoofSurface=xiqingRoofSurface;
      if(furnitureMotionScope)collider.furnitureMotionScope=furnitureMotionScope;
      if (overhead) collider.overhead = overhead;
      this._grid = null;
    }
  }

  clear() {
    this.colliders.length = 0;
    this.walkables.length = 0;
    this._grid = null;
    this.dynamicBodies.clear();
  }

  _duixiuGrid() {
    const source=this.duixiuTerrainSource??this;
    if(!source._grid||source._grid.count!==source.colliders.length)source._buildGrid();
    return source._grid;
  }
  resolveFurnitureVertical(state,delta,radius=.5) { return resolveFurnitureVertical(this,state,delta,radius); }
  resolveDuixiuVertical(state, delta, radius=.5) { return resolveDuixiuVertical(this,state,delta,radius); }
  duixiuContact(x,z,maxTop,radius=.5) { return duixiuContact(this,x,z,maxTop,radius); }

  /** 两侧宫院的命名区域（世界坐标矩形），优先于中轴 z 分段判断 */
  setRegions(regions) {
    // 面积小的优先（院内的殿 > 整片街区）
    this.regions = [...(regions ?? [])].sort((a, b) =>
      (a.maxX - a.minX) * (a.maxZ - a.minZ) - (b.maxX - b.minX) * (b.maxZ - b.minZ));
  }

  getCurrentLocation(position) {
    const { x, z } = position;
    const hit = this.regions?.find(r => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ);
    if (hit) return hit.name;
    // 兜底分段（真实米制）：外朝东西庑墙 ≈ ±106.5 / 110.7，内廷东西一长街墙 ±54.25，御花园墙 ±68
    if (Math.abs(x) > LAYOUT.PALACE_RECT.halfX) return x < 0 ? '东华门外' : '西华门外';
    if (Math.abs(x) > 106 && z > LAYOUT.WUMEN_Z + 4 && z < 204) return x < 0 ? '东路·文华殿一带' : '西路·武英殿一带';
    if (Math.abs(x) > 54 && z >= 204 && z < 422.7) return x < 0 ? '东六宫' : '西六宫';
    if (Math.abs(x) > 68 && z >= 422.7) return x < 0 ? '东路·宁寿宫一带' : '西路·建福宫一带';
    if (z < LAYOUT.WUMEN_Z - 30) return '午门外广场';
    if (z < LAYOUT.TAIHE_GATE_Z - 20) return '午门';
    if (z < LAYOUT.TAIHE_Z - 30) return '太和门广场';
    if (z < LAYOUT.TAIHE_Z + 20) return '太和殿';
    if (z < LAYOUT.ZHONGHE_Z + 15) return '中和殿';
    if (z < LAYOUT.BAOHE_Z + 20) return '保和殿';
    if (z < LAYOUT.QIANQING_GATE_Z - 20) return '内廷广场';
    if (z < LAYOUT.QIANQING_Z + 15) return '乾清宫';
    if (z < LAYOUT.JIAOTAI_Z + 10) return '交泰殿';
    if (z < LAYOUT.KUNNING_Z + 15) return '坤宁宫';
    if (z < LAYOUT.IMPERIAL_GARDEN_Z + 30) return '御花园';
    // 模型相对的地面出口：完整身体越过现有城台北皮才称“门外”。
    // 与 cityGate 共用名义进深；不是实测边界或当日游客通行说明。
    // 上层可站立城台仍在北皮以内；不按眼高切换，避免门外跳跃时标签闪回。
    const modeledNorthFace = LAYOUT.SHENWU_Z + DIMENSIONS.SHENWU.depth / 2;
    if (z - DEFAULT_PLAYER_RADIUS <= modeledNorthFace) return '神武门';
    return '神武门外';
  }
}
