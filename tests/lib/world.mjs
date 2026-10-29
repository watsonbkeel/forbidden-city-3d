import {bindWestWellEnvironmentWitness,unbindWestWellEnvironmentWitness} from '../../src/controls/WestWellEnvironmentWitness.js';
import {bindEastWellEnvironmentWitness} from '../../src/controls/EastWellEnvironmentWitness.js';
import {shoukangEntryGeometry} from '../../src/scene/palace/special/ShoukangEntry.js';
import {bindShoukangEntryEnvironmentWitness} from '../../src/controls/ShoukangEntryEnvironmentWitness.js';
import {bindYanshouCompoundEnvironmentWitness} from '../../src/controls/YanshouCompoundEnvironmentWitness.js';
import {bindCiningGateEnvironmentWitness} from '../../src/controls/CiningGateEnvironmentWitness.js';
import {ciningGateGeometry} from '../../src/scene/palace/special/CiningGate.js';
import {bindCiyinFacadeEnvironmentWitness} from '../../src/controls/CiyinFacadeEnvironmentWitness.js';
import {shouanEntryGeometry} from '../../src/scene/palace/special/ShouanEntry.js';
import {bindShouanEntryEnvironmentWitness} from '../../src/controls/ShouanEntryEnvironmentWitness.js';
import {shunzhenProfile} from '../../src/scene/palace/special/ShunzhenGate.js';
import{resolveRemainingProfile as resolveOuter}from'../../src/scene/palace/special/RemainingOuterHalls.js';
import {resolveRemainingProfile as resolveNingshou} from '../../src/scene/palace/special/RemainingNingshouHalls.js';
import { southCourtGeometry } from '../../src/scene/palace/special/SouthCourtProfiles.js';
import { wenyuanGeometry } from '../../src/scene/palace/special/WenyuanPavilion.js';
// 纯 node 构建"全场景碰撞世界"：直接调用真实的 ZoneBase / CourtKit / PalaceBuilder / Enclosure / GardenBuilder
// 与 CollisionManager（不渲染、不合并几何），得到与游戏一致的碰撞体与可行走面。
// 供 tests/zone-lint.cjs（几何检查）与 tests/stepwalk-auto.cjs（路线生成预检）使用。
//
// 用法（ESM；.cjs 里用 await import(pathToFileURL(...))）：
//   const W = await buildWorld();            // 读 data/zones/*.json
//   W.cm                                       // CollisionManager（所有区 + 中轴静态场景同时在场）
//   W.ownerOf(collider)                        // → { zone, item }（静态场景 item = { kind: 'static', name: 'PalaceBuilder' } 等）
//   W.zones / W.gates / W.halls                // 解析后的 zone JSON、门、殿（含推导几何）
//   walkStraight(W.cm, [x,z], [x2,z2])         // 用真实 getValidPosition 直线行走，返回到达距离
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zhaodeGateGeometry } from '../../src/scene/palace/special/ZhaodeGateProfile.js';
import { zhenduGateGeometry } from '../../src/scene/palace/special/ZhenduGateProfile.js';
import { eastWestCityGateGeometry } from '../../src/scene/palace/special/EastWestCityGate.js';
import { huangjiGateGeometry } from '../../src/scene/palace/special/HuangjiGate.js';
import { yanxiRuinGeometry } from '../../src/scene/palace/special/YanxiRuin.js';
import { xiqingGeometry } from '../../src/scene/palace/special/XiqingGate.js';
import { sideGateGeometry } from '../../src/scene/palace/special/SideGateProfiles.js';
import { qinanGeometry } from '../../src/scene/palace/special/QinanProfile.js';
import { pavilionGeometry } from '../../src/scene/palace/special/PavilionProfiles.js';
import { southCourtGateGeometry } from '../../src/scene/palace/special/SouthCourtGates.js';
import { tianyiProfile } from '../../src/scene/palace/special/TianyiGate.js';
import { yinghuaGateProfile } from '../../src/scene/palace/special/YinghuaGate.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = p => import(path.join(ROOT, 'src', p));

// —— 与 src/scene/palace/kit.js 一致的几何常量（kit 改动时同步）——
export const KIT = {
  STEP_RUN: 1.6,              // 台阶水平长 / 高
  STEP_MIN_PH: 0.55,          // 台明高于此才做实体 + 台阶
  GATE_HALL_HALF_D: (6.4 + 1.6) / 2, // 三间门殿进深 D=6.4 + 台基外扩 1.6
  CITY_GATE_HALF_D: 14 / 2,   // 城台门 D=14
  PLAYER_R: 0.5,              // FirstPerson → getValidPosition 半径
};
export const FACE = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };
export const parseRot = r => (r === undefined || r === null ? 0 : typeof r === 'number' ? r : FACE[r] ?? 0);

/** 门通行几何；profile 的 front/rear 包含各自完整坡道，platformY 仅用于台面起点。 */
export function gateGeom(item) {
  if(item.gateProfile==='shoukang-entry'){const p=shoukangEntryGeometry(item);return{x:p.x,z:p.z,rot:0,dir:[0,1],half:3.15,front:1.65,rear:3.15,platformY:p.floor,profile:{...p,ramps:[],toWorld:(x,z)=>[p.x+x,p.z+z]}};}
  if (item.gateProfile === 'shunzhen') {
    const p=shunzhenProfile(item),profile={...p,rot:0,platformY:0,portalCenters:p.portals.map(o=>o.x),ramps:[],toWorld:(x,z)=>[p.x+x,p.z+z]};
    return {x:p.x,z:p.z,rot:0,dir:[0,1],half:p.depth/2,front:p.depth/2,rear:p.depth/2,platformY:0,profile};
  }
  if (item.gateProfile === 'yinghua') {
    const p=yinghuaGateProfile(item);
    return {x:p.x,z:p.z,rot:0,dir:[0,1],half:1.65,front:1.65,rear:1.65,platformY:p.floor,profile:{...p,rot:0,platformY:p.floor,portalCenters:[0],ramps:[],toWorld:(x,z)=>[p.x+x,p.z+z]}};
  }
  if (item.gateProfile === 'tianyi') {
    const p=tianyiProfile(item), half=p.platformDepth/2, toe=half+p.stairRun;
    const profile={...p,rot:0,platformY:p.floor,portalCenters:[0],
      ramps:[{side:'front',zToe:-toe,zTop:-half},{side:'rear',zToe:toe,zTop:half}],
      toWorld:(x,z)=>[p.x+x,p.z+z]};
    return {x:p.x,z:p.z,rot:0,dir:[0,1],half:toe,front:toe,rear:toe,platformY:p.floor,profile};
  }
  if (item.gateProfile === 'kunning') {
    if(item.name!=='坤宁门'||item.rot!=='north'||item.gateKind!=='three-bay')throw Error('Invalid Kunning QA registration');
    return {x:item.x,z:item.z,rot:0,dir:[0,1],half:7.2,front:7.2,rear:7.2,platformY:1.2};
  }
  if (item.southGateProfile !== undefined) {
    const south = southCourtGateGeometry(item);
    const front = south.z - south.southToe, rear = south.northToe - south.z;
    const platformHalfDepth = (south.d + 2 * south.pad) / 2;
    // Adapt the real dedicated profile to the existing route-helper contract.
    // Do not infer the depth from gate width, nor spawn inside the platform.
    const profile = { ...south,
      portalCenters: south.portals.map(portal => portal.x - south.x),
      ramps: [
        { side: 'front', zToe: -front, zTop: -platformHalfDepth },
        { side: 'rear', zToe: rear, zTop: platformHalfDepth },
      ],
      toWorld: (x, z) => [south.x + x, south.z + z],
    };
    return { x: south.x, z: south.z, rot: 0, dir: [0, 1],
      half: Math.max(front, rear), front, rear, platformY: south.ph, profile };
  }
  if (item.kind === 'cityGate' && item.cityGateProfile !== undefined) {
    const profile = eastWestCityGateGeometry(item);
    return { x: profile.x, z: profile.z, rot: profile.rot, dir: [Math.sin(profile.rot), Math.cos(profile.rot)],
      half: profile.depth / 2, front: profile.depth / 2, rear: profile.depth / 2, platformY: 0,
      profile: { ...profile, ramps: [], toWorld: (x,z) => [profile.x+x*Math.cos(profile.rot)+z*Math.sin(profile.rot), profile.z-x*Math.sin(profile.rot)+z*Math.cos(profile.rot)] } };
  }
  // Explicit three-bay topology must precede the established five-bay profiles.
  if (item.gateProfile === 'zhendu') {
    const profile = zhenduGateGeometry(item);
    const front = -profile.ramps.find(r => r.side === 'front').zToe;
    const rear = profile.ramps.find(r => r.side === 'rear').zToe;
    return { x: profile.x, z: profile.z, rot: profile.rot, dir: [Math.sin(profile.rot), Math.cos(profile.rot)],
      half: Math.max(front, rear), front, rear, platformY: profile.platform.topY, profile };
  }
  if (item.gateProfile === 'zhaode' && item.gateKind === 'three-bay') {
    const profile = zhaodeGateGeometry(item);
    const front = -profile.ramps.find(r => r.side === 'front').zToe;
    const rear = profile.ramps.find(r => r.side === 'rear').zToe;
    return { x: profile.x, z: profile.z, rot: profile.rot, dir: [Math.sin(profile.rot), Math.cos(profile.rot)],
      half: Math.max(front, rear), front, rear, platformY: profile.platform.topY, profile };
  }
  if (item.gateProfile === 'huangji') {
    const profile=huangjiGateGeometry(item);
    return {x:profile.x,z:profile.z,rot:0,dir:[0,1],half:2.4,front:profile.front,rear:profile.rear,platformY:0,profile};
  }
  if(item.gateProfile==='cining-entry'){const profile=ciningGateGeometry(item);return{x:profile.x,z:profile.z,rot:0,dir:[0,1],half:5.235,front:5.235,rear:4.595,platformY:.45,profile};}
  if(item.gateProfile==='shouan-entry'){const profile=shouanEntryGeometry(item);return{x:profile.x,z:profile.z,rot:0,dir:[0,1],half:7.7,front:2.85,rear:7.7,platformY:.36,profile};}
  if (item.gateProfile === 'xiqing') {
    const profile = xiqingGeometry(item, 'ningshou', 0);
    return { x: profile.x, z: profile.z, rot: profile.rot, dir: [Math.sin(profile.rot), Math.cos(profile.rot)],
      half: profile.depth / 2, front: profile.depth / 2, rear: profile.depth / 2, platformY: 0, profile };
  }
  if (item.gateProfile) {
    const profile = sideGateGeometry(item);
    const front = -Math.min(-profile.platformDepth / 2, ...profile.ramps.flatMap(r => [r.zTop, r.zToe]));
    const rear = Math.max(profile.platformDepth / 2, ...profile.ramps.flatMap(r => [r.zTop, r.zToe]));
    return { x: item.x, z: item.z, rot: profile.rot, dir: [Math.sin(profile.rot), Math.cos(profile.rot)],
      half: Math.max(front, rear), front, rear, platformY: profile.platformY, profile };
  }
  const rot = parseRot(item.rot);
  const dir = [Math.sin(rot), Math.cos(rot)];
  let half;
  if (item.kind === 'cityGate') half = KIT.CITY_GATE_HALF_D;
  else {
    // Match CourtKit.gate: explicit topology wins over legacy style; width
    // only supplies dimensions, never infers a five-bay gate.
    const kind = item.gateKind ?? ({ wall: 'wall', hall: 'three-bay' }[item.style ?? 'wall']);
    const w = item.w ?? 3.6, t = item.t ?? 1;
    if (kind === 'five-bay') half = (Math.min(Math.max(6.4, w * 0.3), 10) + 1.6) / 2;
    else if (kind === 'three-bay') half = KIT.GATE_HALL_HALF_D;
    else if (kind === 'wall') half = Math.max(t + 1.4, w / 2 + 1.0) / 2;
    else throw new Error(`Unsupported gateKind: ${kind ?? item.style}`);
  }
  return { x: item.x, z: item.z, rot, dir, half, front: half, rear: half };
}

/** 殿（hall）的几何：正面朝向、台明外廓、台阶长、门的局部 x 与门洞宽（与 kit.hall 一致，roomBays=0） */
export function hallGeom(item) {
  const remaining=resolveNingshou('ningshou',item);
  if(remaining){const p=remaining,c=Math.cos(p.rot),s=Math.sin(p.rot),pad=item.pad??.5;return {rot:p.rot,w:p.localW,d:p.localD,pad,ph:p.ph,PW:p.localW+2*pad,PD:p.localD+2*pad,n:p.bays,bay:p.localW/p.bays,r:.25,doorX:p.portals[0].localX,run:p.ph>.55?p.ph*2.1:0,enter:true,backDoor:p.portals.some(x=>x.side==='rear'),open:false,toW:(x,z)=>[p.x+c*x+s*z,p.z-s*x+c*z],facing:[-s,-c],r48Approach:p.navigation.approachPoints};}
  const outer=resolveOuter('outer-west',item)??resolveOuter('outer-east',item),nav=outer?.navigation;
  if(nav?.runtimeReady===true){const rot=nav.rotation,c=Math.cos(rot),s=Math.sin(rot),w=nav.localWidth,d=nav.localDepth,pad=nav.pad,ph=nav.floorY;return{rot,w,d,pad,ph,PW:w+2*pad,PD:d+2*pad,n:nav.bays,bay:w/nav.bays,r:.25,doorX:0,run:ph>.55?ph*1.6:0,enter:true,backDoor:false,open:false,toW:(x,z)=>[nav.center.x+c*x+s*z,nav.center.z-s*x+c*z],facing:[nav.outwardNormal.x,nav.outwardNormal.z],r48Approach:nav.approachPoints.map(q=>({...q,feetY:q.y}))};}
  if(item.structure==='south-court-hall'||item.structure==='wenyuan-pavilion'){
    const p=item.structure==='south-court-hall'?southCourtGeometry(item):wenyuanGeometry(item),n=p.bays,bay=p.w/n;
    const doorX=item.structure==='wenyuan-pavilion'?-p.w/12:0;
    return {rot:0,w:p.w,d:p.d,pad:p.pad,ph:p.ph,PW:p.w+2*p.pad,PD:p.d+2*p.pad,n,bay,r:Math.min(.34,Math.max(.2,bay*.07)),doorX,run:p.ph>.55?p.ph*1.6:0,enter:true,backDoor:item.structure==='south-court-hall',open:false,toW:(x,z)=>[p.x+x,p.z+z],facing:[0,-1],navigation:p.navigation,...(item.structure==='south-court-hall'?{southCourt:p}:{wenyuan:p})};
  }
  if (item.structure === 'yanxi-ruin') {const profile=yanxiRuinGeometry(item);return {rot:0,enter:false,backDoor:false,open:false,profile,navigation:profile.navigation,toW:(x,z)=>[profile.x+x,profile.z+z]};}
  if (item.structure === 'qinan-hall' || item.qinanProfile !== undefined) {
    const profile = qinanGeometry(item);
    return { rot: profile.rot, enter: false, backDoor: false, open: false, profile,
      navigation: profile.navigation, footprints: profile.map.footprints, toW: profile.toWorld };
  }
  if (item.pavilionProfile) {
    const profile = pavilionGeometry(item);
    const { lower, platform, rot, roomBounds } = profile;
    return { rot, w: lower.width, d: lower.depth, ph: lower.floorY,
      PW: platform.width, PD: platform.depth, front: lower.front, doorX: 0,
      enter: item.enter === true, toW: profile.toWorld, facing: [-Math.sin(rot), -Math.cos(rot)],
      backDoor: false, open: false, profile, roomBounds };
  }
  const rot = parseRot(item.rot);
  const w = item.w, d = item.d, pad = item.pad ?? 1.0, ph = item.ph ?? 0.9;
  const n = item.bays ?? Math.max(3, Math.round(w / 3.6) | 1);
  const bay = w / n;
  const r = Math.min(0.34, Math.max(0.2, bay * 0.07));
  const doorX = -w / 2 + (Math.floor((n - 1) / 2) + 0.5) * bay;
  const run = ph > KIT.STEP_MIN_PH ? ph * KIT.STEP_RUN : 0;
  const enter = !item.open && item.enter !== false; // kit 默认所有非敞厅可进入
  // 局部 → 世界：frame 绕 Y 旋转 rot；局部 (lx, lz) → 世界 (x + lx cos + lz sin, z − lx sin + lz cos)
  const c = Math.cos(rot), s = Math.sin(rot);
  const toW = (lx, lz) => [item.x + lx * c + lz * s, item.z - lx * s + lz * c];
  const facing = [-s, -c]; // 局部 −Z 的世界方向
  return { rot, w, d, pad, ph, PW: w + 2 * pad, PD: d + 2 * pad, n, bay, r, doorX, run, enter, toW, facing, backDoor: !!item.backDoor, open: !!item.open };
}

function stubLibrary(THREE) {
  const mats = new Map();
  const lib = {
    material: n => mats.get(n) ?? (mats.set(n, new THREE.MeshStandardMaterial({ name: n })), mats.get(n)),
    tileSize: () => 1,
    aspect: () => 1,
  };
  return new Proxy(lib, { get: (t, k) => (k in t ? t[k] : () => null) });
}

function stubDocument() {
  if (globalThis.document) return;
  // PalaceBuilder 匾额用 canvas 画字；碰撞计算用不到，给一个吞掉所有调用的桩
  const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
  globalThis.document = {
    createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }),
    // TextureLoader needs an image element; collision-only tests never decode
    // images or wait on their load callbacks, but still build all geometry.
    createElementNS: () => ({ addEventListener() {}, removeEventListener() {} }),
  };
}

export function loadZoneJsons(dir = path.join(ROOT, 'data/zones')) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
    .map(f => ({ file: f, json: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

export async function buildWorld({ zones = loadZoneJsons(), statics = true, retainScene = false, realMaterials = process.env.R48_REAL_TEXTURE_LIBRARY === '1' } = {}) {
  stubDocument();
  const THREE = await import('three');
  const { ZoneBase } = await src('scene/zones/ZoneBase.js');
  const { CollisionManager } = await src('utils/Collision.js');
  const lib = realMaterials ? (await import('./r48-real-texture-library.mjs')).realTextureLibrary() : stubLibrary(THREE);
  const cm = new CollisionManager();
  const owner = new Map(); // 原始 Box3 → { zone, item }
  const rooms = [], mapItems = [];
  const METHODS = ['buildHall', 'buildGate', 'buildWall', 'buildCourtWalls', 'buildCorridor', 'buildCityGate', 'buildNineDragonWall'];

  for (const { json } of zones) {
    const zb = new ZoneBase(lib, json);
    zb.kit.finish = () => { // Skip expensive render merge, preserve its metadata contract.
      const group = new THREE.Group(), architecture = [];
      zb.kit.root.traverse(o => {
        const record = o.userData.pavilion ?? (o.userData.structure?.id ? o.userData.structure : null);
        if (record) architecture.push(structuredClone(record));
      });
      group.userData.architecture = architecture;
      return group;
    };
    for (const m of METHODS) {
      const orig = ZoneBase.prototype[m];
      zb[m] = item => {
        const n0 = zb.kit.colliders.length;
        const r = orig.call(zb, item);
        for (let i = n0; i < zb.kit.colliders.length; i++) owner.set(zb.kit.colliders[i], { zone: json.id, item });
        return r;
      };
    }
    const data = zb.build();
    cm.addColliders(data.colliders, json.id);
    cm.addWalkables(data.walkables, json.id);
    rooms.push(...data.rooms);
    mapItems.push(...data.mapItems);
  }

  const terraceProfiles = [], taiheSouthTiers = [], baoheNorthTiers = [];
  let retainedScene = null;
  if (statics) {
    const log = console.log;
    console.log = () => {};
    try {
      const { PALACE_LAYOUT } = await src('scene/Layout.js');
      const { PalaceBuilder } = await src('scene/PalaceBuilder.js');
      const { Enclosure } = await src('scene/Enclosure.js');
      const { GardenBuilder } = await src('scene/GardenBuilder.js');
      const scene = new THREE.Scene();
      const pb = new PalaceBuilder(scene, lib);
      pb.buildAll(PALACE_LAYOUT);
      if (retainScene) retainedScene = scene;
      terraceProfiles.push(...pb.terraceProfiles);
      taiheSouthTiers.push(...pb.taiheSouthTiers);
      baoheNorthTiers.push(...pb.baoheNorthTiers);
      const en = new Enclosure(scene, lib).build();
      const gb = new GardenBuilder(scene, lib).build(PALACE_LAYOUT.find(i => i.type === 'garden'));
      for (const [name, cols, walks] of [['PalaceBuilder', pb.getColliders(), pb.getWalkables()], ['Enclosure', en.getColliders(), []], ['GardenBuilder', gb.getColliders(), gb.getWalkables()]]) {
        const before = cm.colliders.length;
        cm.addColliders(cols, 'static');
        cm.addWalkables(walks, 'static');
        for (let i = before; i < cm.colliders.length; i++) owner.set(cm.colliders[i].mesh, { zone: 'static', item: { kind: 'static', name } });
      }
    } finally { console.log = log; }
  }

  let environmentScene=null;
  if(cm.colliders.some(c=>['west-well','east-well','shoukang-entry','yanshou-compound','cining-gate','ciyin-front','shouan-entry'].includes(c.furnitureMotionScope?.kind))){const {Environment}=await src('scene/Environment.js');environmentScene=new THREE.Scene();const env=new Environment(environmentScene,null,lib);env.setupGround();environmentScene.updateMatrixWorld(true);bindShouanEntryEnvironmentWitness(cm,environmentScene);bindShoukangEntryEnvironmentWitness(cm,environmentScene);bindEastWellEnvironmentWitness(cm,environmentScene);bindWestWellEnvironmentWitness(cm,environmentScene);bindCiyinFacadeEnvironmentWitness(cm,environmentScene);bindCiningGateEnvironmentWitness(cm,environmentScene);bindYanshouCompoundEnvironmentWitness(cm,environmentScene);}
  const gates = [], halls = [];
  for (const { json } of zones) for (const item of json.items) {
    if (item.kind === 'gate' || item.kind === 'cityGate') gates.push({ zone: json.id, item, ...gateGeom(item) });
    if (item.kind === 'hall') halls.push({ zone: json.id, item, g: hallGeom(item) });
  }
  return {
    THREE, cm, zones, gates, halls, rooms, mapItems, environmentScene, terraceProfiles, taiheSouthTiers, baoheNorthTiers,
    ...(retainScene ? { scene: retainedScene } : {}),
    ownerOf: c => owner.get(c.mesh) ?? { zone: c.tag ?? '?', item: { kind: '?' } },
  };
}

/** 世界 AABB 与碰撞体相交查询（只算高于可迈高度 0.35 的实体），返回碰撞体列表 */
export function collidersIn(W, x0, z0, x1, z1, { minTop = 0.36 } = {}) {
  const b = new W.THREE.Box3(new W.THREE.Vector3(Math.min(x0, x1), -1, Math.min(z0, z1)), new W.THREE.Vector3(Math.max(x0, x1), 100, Math.max(z0, z1)));
  return W.cm.queryBox(b).filter(c => c.box.max.y >= minTop && c.box.intersectsBox(b));
}

/**
 * 用真实 CollisionManager.getValidPosition（半径 0.5、逐小步贴地）从 a 直线走向 b，
 * 返回 { reached（沿 a→b 方向的投影距离）, total, end:[x,z], feet }。起点在碰撞体内时 reached = −1。
 */
export function walkStraight(W, a, b, { step = 0.4, feet0 } = {}) {
  const { THREE, cm } = W;
  const H = 1.7;
  const total = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / total, uz = (b[1] - a[1]) / total;
  let feet = feet0 ?? cm.getGroundHeight(a[0], a[1], 0, 0.6);
  const cur = new THREE.Vector3(a[0], feet + H, a[1]);
  if (cm.checkCollision(cur, KIT.PLAYER_R)) return { reached: -1, total, end: a, feet };
  let reached = 0;
  for (let k = 0; k < Math.ceil(total / step) + 40; k++) {
    const left = total - reached;
    if (left < 0.05) break;
    const s = Math.min(step, left);
    const tgt = new THREE.Vector3(cur.x + ux * s, cur.y, cur.z + uz * s);
    const v = cm.getValidPosition(cur, tgt, KIT.PLAYER_R, feet, 0.6);
    feet = cm.lastGroundY ?? feet;
    const prog = (v.x - a[0]) * ux + (v.z - a[1]) * uz;
    cur.set(v.x, feet + H, v.z);
    if (prog - reached < 0.02) break;
    reached = prog;
  }
  return { reached: +reached.toFixed(2), total: +total.toFixed(2), end: [+cur.x.toFixed(2), +cur.z.toFixed(2)], feet: +feet.toFixed(2) };
}

/**
 * 局部可达性（带脚面高度的 BFS，0.5 m 网格，与游戏一样每步按 stepUp 0.6 贴地 + 半径 0.5 碰撞）。
 * 从 start 出发，不进入 forbid(x,z) 为真的格子；返回 { blockedStart, maxDist（离 center 最远可达距离）, cells }。
 * 到达 radius 即提前结束（说明连通到外面的大片区域）。
 */
export function reachFrom(W, start, center, radius, forbid = () => false, cell = 0.5) {
  const { THREE, cm } = W;
  const v = new THREE.Vector3();
  const blockedAt = (x, z, feet) => { v.set(x, feet + 1.7, z); return cm.checkCollision(v, KIT.PLAYER_R); };
  const f0 = cm.getGroundHeight(start[0], start[1], 0, 0.6);
  if (blockedAt(start[0], start[1], f0)) return { blockedStart: true, maxDist: 0, cells: 0 };
  const key = (i, k) => i * 4096 + k;
  const seen = new Map([[key(0, 0), f0]]);
  const q = [[0, 0, f0]];
  let maxDist = Math.hypot(start[0] - center[0], start[1] - center[1]);
  for (let h = 0; h < q.length; h++) {
    const [i, k, feet] = q[h];
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nk = k + dk, kk = key(ni, nk);
      if (seen.has(kk)) continue;
      const x = start[0] + ni * cell, z = start[1] + nk * cell;
      const dist = Math.hypot(x - center[0], z - center[1]);
      if (dist > radius + cell || forbid(x, z)) continue;
      const g = cm.getGroundHeight(x, z, feet, 0.6);
      if (blockedAt(x, z, g)) continue;
      seen.set(kk, g);
      q.push([ni, nk, g]);
      if (dist > maxDist) maxDist = dist;
      if (maxDist >= radius) return { blockedStart: false, maxDist, cells: q.length };
    }
  }
  return { blockedStart: false, maxDist: +maxDist.toFixed(1), cells: q.length };
}

export function pointBlocked(W, x, z, feet) {
  const f = feet ?? W.cm.getGroundHeight(x, z, 0, 0.6);
  return W.cm.checkCollision(new W.THREE.Vector3(x, f + 1.7, z), KIT.PLAYER_R);
}

export const describeOwner = o => `${o.zone}:${o.item.kind}${o.item.name ? '「' + o.item.name + '」' : o.item.from ? JSON.stringify(o.item.from) + '→' + JSON.stringify(o.item.to) : o.item.x0 !== undefined ? `[${o.item.x0},${o.item.x1}]×[${o.item.z0},${o.item.z1}]` : o.item.x !== undefined ? `@(${o.item.x},${o.item.z})` : ''}`;
