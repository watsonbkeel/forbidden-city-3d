import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { Environment } from '../src/scene/Environment.js';
import { PalaceBuilder } from '../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { INNER_JINSHUI, innerJinshuiProfile } from '../src/scene/palace/special/InnerJinshui.js';
import { wenyuanGeometry } from '../src/scene/palace/special/WenyuanPavilion.js';
import { southWaterProfile, palaceWaterPolygons } from '../src/scene/palace/special/SouthWaterSystem.js';
import { createPalaceFlightEnvelope, FLIGHT_BOUNDS } from '../src/scene/flight/FlightEnvelope.js';
import { FLIGHT_RULES, HELICOPTER_HOME, LANDING_CHOICES, FlightState } from '../src/scene/flight/FlightState.js';
import { createDOM } from './lib/ui-dom.mjs';
import { Minimap } from '../src/ui/Minimap.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';

// Vite accepts the raw JSON imports in data/zones/index.js. Node needs a
// loader boundary; the exact on-disk JSON is returned without data edits.
registerHooks({load(url,context,next){if(url.endsWith('.json'))return{format:'module',source:'export default '+readFileSync(new URL(url),'utf8'),shortCircuit:true};return next(url,context);}});
const { Teleport } = await import('../src/ui/Teleport.js');

// Actual current Environment + PalaceBuilder + all three southern zones, with
// the real render merge. No source restoration, geometry filter, or high spawn.
let cached;
function fixture() {
  if (cached) return cached;
  const scene = new THREE.Scene(), lib = library(), cm = new CollisionManager();
  const environment = new Environment(scene, null, lib); environment.setupGround();
  const palaceBuilder = new PalaceBuilder(scene, lib); palaceBuilder.buildAll(PALACE_LAYOUT);
  cm.addColliders(palaceBuilder.getColliders(), 'static');
  cm.addWalkables(palaceBuilder.getWalkables(), 'static');
  const loaded = new Map(), builders = [];
  for (const id of ['axis-courts', 'outer-east', 'outer-west']) {
    const config = JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`, import.meta.url)));
    const builder = new ZoneBase(lib, config), data = builder.build();
    data.group.userData.auditZone = id; scene.add(data.group); builders.push(builder);
    cm.addColliders(data.colliders, id); cm.addWalkables(data.walkables, id);
    loaded.set(id, { data });
  }
  scene.updateMatrixWorld(true);
  const river = PALACE_LAYOUT.find(item => item.type === 'river');
  const south = southWaterProfile(river), central = innerJinshuiProfile(river);
  assert.ok(south, 'the actual production river must opt into the south profile');
  return cached = { THREE, scene, environment, palaceBuilder, builders, cm, river, south, central, loaded };
}
function down(root, x, z, y = 100) {
  return new THREE.Raycaster(new THREE.Vector3(x, y, z), new THREE.Vector3(0, -1, 0)).intersectObject(root, true);
}
function shortHits(hits) {
  return hits.map(hit => ({ y: +hit.point.y.toFixed(3), material: hit.object.material?.name,
    parent: hit.object.parent?.userData.auditZone ?? hit.object.parent?.name }));
}
function waterHit(hit) { return hit.object.userData.isWater === true; }
function allBridges(f) { return [...f.central.bridges.map(b => ({ ...b, axis: 'z', crest: INNER_JINSHUI.bridgeCrest })), ...f.south.bridges]; }
function pointAt(b, a, c = 0) { return b.axis === 'z' ? { x: b.x + c, z: b.z + a } : { x: b.x + a, z: b.z + c }; }

// Sample fixed official-topology interfaces plus each actually generated reach,
// rather than trusting a matching predicate to prove its own geometry correct.
test('R36 full southern scene keeps actual water and lowered bed without ground/road resealing', () => {
  const f = fixture(), points = [[19, -310.8], [6.5, -310.8], [-21, -310.8], [65, -294]];
  for (const reach of f.south.reaches) for (let i = 2; i < reach.centers.length - 2; i += 7) {
    const p = reach.centers[i]; points.push([p.x, p.z]);
  }
  assert.ok(points.length > 80);
  for (const [x, z] of points) {
    const hits = down(f.scene, x, z), detail = JSON.stringify({ x, z, hits: shortHits(hits) });
    assert.ok(hits.some(h => waterHit(h) && Math.abs(h.point.y - INNER_JINSHUI.waterY) < 1e-4), 'real water: ' + detail);
    assert.ok(hits.some(h => h.object.material?.name === 'stone_slab' && Math.abs(h.point.y - INNER_JINSHUI.bedY) < 1e-4), 'lowered bed: ' + detail);
    assert.equal(hits.some(h => h.point.y >= -.02 && h.point.y <= .035), false, 'main ground/axial road must not seal water: ' + detail);
  }
  // These open reaches have neither a bridge nor an intended overhead culvert.
  // The fitted shoulder now bends north at (79,-282), keeping the retained
  // gate approach dry. The prior fit's (82,-290.8) was not a surveyed anchor.
  for (const [x, z] of [[19,-310.8],[65,-294],[79,-282],[185,-260],[270,-190],[-140,-210],[-250,-149],[-308,-350],[-301,-400.75]]) {
    const hits = down(f.scene, x, z);
    assert.ok(hits.length > 0 && waterHit(hits[0]), 'open water must actually be top-visible: ' + JSON.stringify({x,z,hits:shortHits(hits)}));
  }
});

test('R36 exactly five retained central and three Wuying bridges plus north–south Duanhong are physically separate', () => {
  const f = fixture();
  assert.deepEqual(f.central.bridges.map(b => [b.x,b.z,b.width,b.length]), [-30,-13,0,13,30].map(x => [x,-310.8,6.1,21]));
  const west = f.south.bridges.filter(b => b.family === 'wuying');
  assert.equal(west.length, 3); assert.equal(new Set(west.map(b => b.x)).size, 3);
  assert.ok(west.every(b => b.axis === 'z' && b.z < -249.8));
  const bridge = f.south.bridges.find(b => b.id === 'duanhong');
  assert.equal(bridge.axis, 'z'); assert.equal(bridge.length, 18.7); assert.equal(bridge.width, 9.2);
  assert.ok(bridge.z > -249.8 && bridge.x > 110.7 && bridge.x < 219.5);
  assert.ok(bridge.minWidth < 9.2, 'the official 9.2 m is maximum width, not evidence of a constant width');
  for (const b of allBridges(f)) {
    const hits = down(f.scene, b.x, b.z);
    assert.ok(hits.some(waterHit), `${b.id}: a deck cannot cover an imaginary dry stream`);
    assert.ok(hits.some(h => Math.abs(h.point.y - b.crest) < .015), `${b.id}: actual merged deck crest`);
    const supports = f.palaceBuilder.getWalkables().filter(w => w.structureId === b.id);
    assert.ok(supports.length >= 16, `${b.id}: sampled bounded physical support, not a single invisible broad plane`);
    assert.ok(supports.every(w => !w.rescue), `${b.id}: bridge traversal is not a rescue teleport`);
    for (const sign of [-1,1]) {
      const p = pointAt(b, 0, -sign*(b.width/2+.2));
      const direction = b.axis === 'z' ? new THREE.Vector3(sign,0,0) : new THREE.Vector3(0,0,sign);
      const under = new THREE.Raycaster(new THREE.Vector3(p.x,INNER_JINSHUI.waterY+.4,p.z), direction, 0, b.width+.4).intersectObject(f.scene,true);
      assert.equal(under.length,0,`${b.id}: real waterway beneath the bridge is not an opaque block: ${JSON.stringify(shortHits(under))}`);
    }
    const fields = ['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
    assert.ok(supports.every(w => f.cm.walkables.some(actual => fields.every(key => actual[key] === w[key]))),
      `${b.id}: the actual collision manager contains every generated support, not metadata only`);
  }
});

for (const fps of [10,60]) test(`R36 all 12 current bridges traverse both ways on complete southern collision geometry at ${fps} Hz`, t => {
  const f = fixture();
  assert.equal(allBridges(f).length, 12);
  for (const b of allBridges(f)) for (const reverse of [false,true]) {
    let points = [-b.length/2-2, b.length/2+2].map(a => {const p=pointAt(b,a);return [p.x,p.z];});
    if (b.id === 'wenyuan-pond') {
      const item = f.builders.find(builder => builder.zoneJson.id === 'outer-east').zoneJson.items.find(item => item.name === '文渊阁');
      const pavilion = wenyuanGeometry(item);
      // The real six-bay front has a center column, not a center door. Land on
      // the north bank, then turn east to its five-bay library entrance axis.
      // Both endpoints remain ground, without moving the fitted bridge anchor.
      points = [points[0], [b.x,-143.2], [pavilion.entry.x,-143.2]];
    }
    if(reverse)points=points.toReversed();
    const placed = t.mock.method(FirstPersonControls.prototype, 'setPosition');
    const trace = traceTerraceGround(f.cm,{flights:[]});
    let result;
    try { result = replayTerrace(t, f, points, {fps,sprint:true,recordFrames:true}); }
    finally { trace.restore(); }
    assert.equal(placed.mock.callCount(),1); placed.mock.restore();
    assert.equal(result.startFeet,0, b.id+' starts on real ground');
    assert.equal(result.arrived,true,JSON.stringify({id:b.id,reverse,end:result.end,stuckAt:result.stuckAt}));
    assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false,b.id);
    const middle=result.frames.filter(p=>Math.hypot(p.x-b.x,p.z-b.z)<b.length/5);
    assert.ok(middle.length>0,b.id+' physical center visited');
    assert.ok(middle.every(p=>p.ground>b.crest*.65&&p.feet>.02),b.id+' no walking under the rendered deck');
  }
});

for (const id of ['xihe-north','xiehe-north','wenyuan-wall--149.5','wenyuan-wall--219']) test(`R36 ${id}: water flows through below preserved wall/gallery, not through a deleted building`, () => {
  const f=fixture(), c=f.south.culverts.find(c=>c.id===id);
  assert.ok(c);
  if(id==='xihe-north')assert.match(c.status,/VAULT_SHAPE_FIT_NOT_MIRRORED_EVIDENCE/,
    'the western interface is official, but an equally photographed western vault is not established');
  if(id==='xiehe-north')assert.match(c.status,/PHOTOGRAPHED_UNDER_CORRIDOR_CULVERT__DIMENSIONS_FIT/,
    'the eastern photograph supports upper-gallery continuity, not measured arch dimensions');
  if(id.endsWith('-north'))assert.ok(c.z>-290 && c.z<-250,'the interface is north of its gate');
  else {assert.equal(c.z,-149);assert.match(c.status,/MODEL_FIT/,'pond-wall details are fitted, not photographed measured arches');}
  // River flows east/west here. Check both directions and several elevations;
  // a reused N/S bridge arch can look right from above while end-capping water.
  for(const y of [INNER_JINSHUI.waterY+.05,INNER_JINSHUI.waterY+.45]) for(const sign of [-1,1]) {
    const from=new THREE.Vector3(c.x-sign*(c.length/2+1),y,c.z),direction=new THREE.Vector3(sign,0,0);
    const hits=new THREE.Raycaster(from,direction,0,c.length+2).intersectObject(f.scene,true);
    assert.equal(hits.length,0,`${id} must be a real X-direction hydraulic opening: ${JSON.stringify(shortHits(hits))}`);
  }
  const hits=down(f.scene,c.x,c.z);
  assert.ok(hits.some(waterHit));
  assert.ok(hits.some(h=>h.point.y>2&&['wall_red','caihua_beam','roof_tile','kit_ridge'].includes(h.object.material?.name)),
    'upper wall/corridor must survive; cutting away the whole bay is not a culvert');
  assert.ok(hits.some(h=>h.point.y>=.1&&h.point.y<=1.1), 'a physical platform/arch remains between water and upper building');
});

test('R36 production flight envelope rejects every extended wet reach without disabling retained landing areas', () => {
  const f=fixture();
  // Scope is actual southern geometry and static palace. Full all-zone flight
  // envelope/resource tests remain a separate final regression requirement.
  const grid=createPalaceFlightEnvelope({palaceBuilder:f.palaceBuilder,enclosure:{group:new THREE.Group()},garden:{group:new THREE.Group()},
    zoneManager:{zones:f.loaded,loaded:f.loaded,prebuilt:new Map()},layout:PALACE_LAYOUT});
  for(const reach of f.south.reaches)for(let i=0;i<reach.centers.length;i+=7){
    const p=reach.centers[i];assert.equal(grid.sample(p.x,p.z,0).water,true,reach.id+'/'+i);
    assert.equal(grid.safeGround(p.x,p.z,FLIGHT_RULES.radius),false,reach.id+'/'+i);
  }
  for(const p of LANDING_CHOICES)assert.equal(grid.safeGround(p.x,p.z,FLIGHT_RULES.radius),true,p.name);
  assert.deepEqual(grid.bounds,FLIGHT_BOUNDS);
  const state=new FlightState(grid);assert.deepEqual(state.position,HELICOPTER_HOME);assert.equal(state.board(),true);
  for(const p of LANDING_CHOICES)assert.equal(state.landAt(p),true,p.name);
  for(const b of f.south.bridges)assert.equal(state.landAt(b),false,b.id+' pedestrian bridge is not a helicopter pad');
});

test('R36 actual map draw uses the current unified water polygon in the same north-up/east-right frame as retained center bridges', t => {
  t.mock.method(Minimap.prototype,'init',()=>{});
  const f=fixture();
  for(const bounds of [undefined,FLIGHT_BOUNDS]) {
    const map=new Minimap(bounds?{worldBounds:bounds}:{}),paths=[];let current=[];
    const ctx=new Proxy({beginPath(){current=[];},moveTo(x,y){current.push([x,y]);},lineTo(x,y){current.push([x,y]);},
      fill(){if(this.fillStyle==='rgba(100, 150, 200, 0.6)')paths.push(current.map(p=>p.slice()));}},
    {get:(target,key)=>key in target?target[key]:()=>{}});
    map.ctx=ctx;map.drawLabel=()=>{};map.drawSideItems=()=>{};map.drawStatic();
    assert.deepEqual(paths,palaceWaterPolygons(f.river).map(poly=>poly.map(p=>{const m=map.worldToMap(p.x,p.z);return[m.x,m.y];})));
    const west=map.worldToMap(220,-278),east=map.worldToMap(-186,-149),center=map.worldToMap(0,-310.8);
    assert.ok(west.x<center.x&&east.x>center.x,'same geographic east/right convention for all water layers');
    assert.ok(east.y<center.y,'north is up');
  }
});

test('R36 current southern named destinations still resolve safe map travel landings on the integrated scene', () => {
  const f=fixture(),oldDocument=globalThis.document,dom=createDOM();globalThis.document=dom.document;
  const zoneManager={getMapItems:()=>[...f.loaded.values()].flatMap(entry=>entry.data.mapItems),getLoadedIds:()=>[...f.loaded.keys()]};
  const teleport=new Teleport({},zoneManager,f.cm);
  try {
    for(const name of ['文华门','文华殿','主敬殿','文渊阁','武英门','武英殿','敬思殿']){
      const landing=teleport.resolveLanding(name);
      assert.ok(landing,name+' must retain an actual safe landing, not merely an enabled search-card button');
      assert.ok([landing.x,landing.y,landing.z].every(Number.isFinite),name);
      assert.equal(f.cm.checkCollision(new THREE.Vector3(landing.x,landing.y+1.7,landing.z),.5),false,name);
      assert.equal(teleport.isSafe({...landing},teleport.geometryFor(name)),true,name);
    }
  }finally{teleport.dispose();globalThis.document=oldDocument;}
});

test('R36 Wenyuan bent approach rejects an actual blocker instead of treating the line-of-sight exception as unconditional access', () => {
  const f=fixture(), teleport=Object.create(Teleport.prototype);
  teleport.targets=new Map(f.builders.flatMap(b=>b.zoneJson.items).filter(i=>i.name).map(i=>[i.name,i]));
  teleport.zoneManager={getMapItems:()=>[...f.loaded.values()].flatMap(e=>e.data.mapItems),getLoadedIds:()=>[...f.loaded.keys()]};
  teleport.collisionManager=f.cm;
  assert.ok(teleport.resolveLanding('文渊阁'));
  const blocker=new THREE.Box3(new THREE.Vector3(-191,0,-143.5),new THREE.Vector3(-186,3,-142.9));
  f.cm.addCollider(blocker,'r36-audit-turn-blocker');
  try{assert.equal(teleport.resolveLanding('文渊阁'),null,'a blocked north-bank turn must fail the actual physical approach');}
  finally{f.cm.removeByTag('r36-audit-turn-blocker');}
  assert.ok(teleport.resolveLanding('文渊阁'));
});

test('R36 Wenyuan bent approach requires resident pond-bridge support, not implicit zero-height ground over water', () => {
  const f=fixture(), teleport=Object.create(Teleport.prototype);
  teleport.targets=new Map(f.builders.flatMap(b=>b.zoneJson.items).filter(i=>i.name).map(i=>[i.name,i]));
  teleport.zoneManager={getMapItems:()=>[...f.loaded.values()].flatMap(e=>e.data.mapItems),getLoadedIds:()=>[...f.loaded.keys()]};
  teleport.collisionManager=f.cm;
  const bridge=f.south.bridges.find(b=>b.id==='wenyuan-pond'),before=f.cm.walkables;
  const bounds=w=>w.type==='box'?{minX:w.box.min.x,maxX:w.box.max.x,minZ:w.box.min.z,maxZ:w.box.max.z}:w;
  const removed=before.filter(w=>{const a=bounds(w);return w.tag==='static'&&a.minX<=bridge.x&&a.maxX>=bridge.x&&a.minZ<bridge.z+bridge.length/2&&a.maxZ>bridge.z-bridge.length/2;});
  assert.ok(removed.length>=16,'fault injection must actually remove the fitted bridge supports');
  f.cm.walkables=before.filter(w=>!removed.includes(w));
  try{assert.equal(teleport.resolveLanding('文渊阁'),null,'missing physical bridge must reject travel, even if its authored water-crossing footprint remains');}
  finally{f.cm.walkables=before;}
  assert.ok(teleport.resolveLanding('文渊阁'));
});

test('R36 Wenyuan support verification rejects a misplaced transverse strip and an unloaded destination', () => {
  const f=fixture(),teleport=Object.create(Teleport.prototype);
  teleport.targets=new Map(f.builders.flatMap(b=>b.zoneJson.items).filter(i=>i.name).map(i=>[i.name,i]));
  teleport.zoneManager={getMapItems:()=>[...f.loaded.values()].flatMap(e=>e.data.mapItems),getLoadedIds:()=>[...f.loaded.keys()]};
  teleport.collisionManager=f.cm;
  const b=f.south.bridges.find(b=>b.id==='wenyuan-pond');
  const strip=f.cm.walkables.find(w=>w.tag==='static'&&w.type==='ramp'&&w.axis==='z'&&w.a0===b.z&&w.minX<=b.x&&w.maxX>=b.x);
  assert.ok(strip,'inject the real central bridge primitive rather than a fabricated ramp');
  const keys=['crossMin0','crossMax0','crossMin1','crossMax1'],before=Object.fromEntries(keys.map(k=>[k,strip[k]]));
  for(const key of keys)strip[key]+=10;
  try{assert.equal(teleport.resolveLanding('文渊阁'),null,'same nominal heights without actual transverse support must not verify the bridge');}
  finally{Object.assign(strip,before);}
  assert.ok(teleport.resolveLanding('文渊阁'));
  teleport.zoneManager.getLoadedIds=()=>['axis-courts','outer-west'];
  assert.equal(teleport.resolveLanding('文渊阁'),null,'the destination must be resident, not merely declared in JSON');
});

test.after(()=>{if(cached){for(const b of cached.builders)b.dispose();cached.palaceBuilder.dispose();cached.environment.dispose();}});
