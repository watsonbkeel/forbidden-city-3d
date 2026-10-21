import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { library, hash, hallSurfaces } from './lib/inner-palace-fixture.mjs';
import { CollisionManager } from '../src/utils/Collision.js';
import { FlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';
const config = JSON.parse(readFileSync(new URL('../data/zones/ningshou.json', import.meta.url)));
const item = config.items.find(i => i.name === '古华轩' && i.kind === 'hall');
const role = (root, name) => { const out = []; root.traverse(o => { if (o.userData.role === name) out.push(o); }); return out; };
function fixture() { const b = new ZoneBase(library(), config); const { f } = b.buildHall(item); b.kit.root.updateMatrixWorld(true); const cm = new CollisionManager(); cm.rivers = []; cm.addColliders(b.kit.colliders); cm.addWalkables(b.kit.walkables); return { b, f, cm }; }
function finish(b) { const root = b.kit.finish(); b.kit.dispose(root); }

test('R42 independent original R41 roof and platform actual geometry remain byte-equivalent', () => {
 const { b, f } = fixture(); b.kit.buildPlaqueAtlas();
 const retained = new Set(['wall_brick', 'stone_slab', 'dougong_band', 'rafters', 'roof_tile', 'kit_ridge']);
 // Captured independently from the frozen R41 checkout, not the candidate.
 assert.equal(hash(hallSurfaces(f, 0).filter(r => retained.has(r.material))), '05d568718ecdf2acf24c9ec87ef5473e8618c8a119ce8bbd0fbc388f2232496f');
 finish(b);
});

test('R42 independent seat collision matches visible tops and the original step has real support', () => {
 const { b, f, cm } = fixture();
 for (const seat of role(f, 'guhua-seat-top')) {
  const box = new THREE.Box3().setFromObject(seat), p = box.getCenter(new THREE.Vector3());
  const hit = new THREE.Raycaster(new THREE.Vector3(p.x, 1.4, p.z), new THREE.Vector3(0, -1, 0), 0, 1).intersectObject(seat)[0];
  assert.ok(hit); assert.ok(Math.abs(cm.supportHeight(p.x, p.z, 1.1, .01) - hit.point.y) < 1e-6);
  assert.equal(cm.checkCollision(new THREE.Vector3(p.x, item.ph + 1.7, p.z), .01), true);
  assert.ok(b.kit.colliders.some(c => c.min.distanceTo(box.min) < 1e-6 && c.max.distanceTo(box.max) < 1e-6), 'seat has its actual box, not a large invisible wall');
 }
 for (const z of [-4.8, -4, 0, 4, 4.8]) {
  const x = item.x, worldZ = item.z + z;
  const hit = new THREE.Raycaster(new THREE.Vector3(x, 1, worldZ), new THREE.Vector3(0, -1, 0), 0, 2).intersectObject(f, true)[0];
  assert.ok(hit); assert.ok(Math.abs(hit.point.y - cm.getGroundHeight(x, worldZ, 0)) <= .021, `visible fitted floor at ${z}`);
 }
 for (const z of [-4.95, 4.95]) assert.equal(cm.getGroundHeight(item.x, item.z + z, 0), 0);
 finish(b);
});

test('R42 independent inner screen openings are real holes with no hidden rear or side enclosure', () => {
 const { b, f, cm } = fixture();
 for (const [x, z, dx, dz, length] of [[0,-5.2,0,1,10.4],[-6.2,0,1,0,12.4],[-3.566,-3.4,0,1,6.8],[3.566,-3.4,0,1,6.8]]) {
  const start = new THREE.Vector3(item.x + x, item.ph + 1.7, item.z + z), dir = new THREE.Vector3(dx,0,dz);
  assert.equal(new THREE.Raycaster(start,dir,0,length).intersectObject(f,true).length,0);
  for(let t=0;t<=length;t+=.1) assert.equal(cm.checkCollision(start.clone().addScaledVector(dir,t),.5),false,`clear aperture ${x},${z} at ${t}`);
 }
 for (const o of role(f, 'guhua-inner-frame')) {
  const a = new THREE.Box3().setFromObject(o);
  assert.ok(b.kit.colliders.some(c => c.min.distanceTo(a.min)<1e-6 && c.max.distanceTo(a.max)<1e-6),'screen collision follows an actual solid frame');
 }
 finish(b);
});

for(const fps of [10,60]) test(`R42 independent actual backward movement crosses inner side and lateral front/back portals at ${fps}Hz`,t=>{
 const {b,cm}=fixture();
 const route=[[0,-5.9],[0,-3.4],[-3.566,-3.4],[-3.566,0],[-6.2,0],[-3.566,0],[-3.566,3.4],[3.566,3.4],[3.566,0],[6.2,0],[3.566,0],[3.566,-3.4],[0,-3.4],[0,-5.9]].map(([x,z])=>[item.x+x,item.z+z]);
 const trace=traceTerraceGround(cm,{flights:[]});try{const result=replayTerrace(t,{cm,THREE},route,{fps,backward:true,sprint:true,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(trace.samples.some(s=>['rescue','unverified'].includes(s.source)),false);assert.ok(result.frames.every(s=>Number.isFinite(s.feet)&&Number.isFinite(s.ground)));}finally{trace.restore();finish(b);}
});

function stats(root) { const out=new Map();root.updateMatrixWorld(true);root.traverse(m=>{if(!m.isMesh||!m.material||m.material.name==='kit_plaques')return;const p=m.geometry.attributes.position,s=out.get(m.material)??{count:0,box:new THREE.Box3()};s.count+=m.geometry.index?.count??p.count;for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));for(let i=0;i<p.count;i++)s.box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld));out.set(m.material,s);});return out; }
test('R42 independent whole Ningshou merge retains material geometry, flight coverage and exact resource ownership',()=>{
 for(let repeat=0;repeat<2;repeat++){
  const b=new ZoneBase(library(),config),watched=new Map(),watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};
  const original=b.kit.finish.bind(b.kit);let before,vertices=[],sourceGeometries;
  b.kit.finish=()=>{
   before=stats(b.kit.root);sourceGeometries=new Set();
   b.kit.root.traverse(o=>{if(o.geometry){watch(o.geometry);sourceGeometries.add(o.geometry);}if(o.isMesh&&o.material?.name.startsWith('guhua_')){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)vertices.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
   for(const o of b.kit.owned)watch(o);for(const o of b.kit.ownedTextures??[])watch(o);
   assert.equal(b.kit.owned.filter(m=>m.name.startsWith('guhua_')).length,6);
   return original();
  };
  const {group}=b.build(),after=stats(group);for(const o of b.kit.owned)watch(o);for(const o of b.kit.ownedTextures??[])watch(o);assert.equal(after.size,before.size);
  for(const[m,s]of before){const a=after.get(m);assert.ok(a,m.name);assert.equal(a.count,s.count,m.name);assert.ok(a.box.min.distanceTo(s.box.min)<1e-4,m.name);assert.ok(a.box.max.distanceTo(s.box.max)<1e-4,m.name);}
  for(const g of sourceGeometries)assert.equal(watched.get(g),1,'source geometry disposed once by merge');
  group.traverse(o=>{if(o.geometry)watch(o.geometry);});
  const env=new FlightEnvelope().addRoot(group);assert.ok(vertices.length>1000);for(const p of vertices)assert.ok(env.sample(p.x,p.z).height>=p.y-1e-5);
  const record=group.userData.architecture.filter(r=>r.id==='ningshou/guhua-open-pavilion');assert.equal(record.length,1);assert.match(record[0].state,/REPLICA.*NOT_ORIGINAL_QIANLONG/);
  b.dispose();for(const[o,n]of watched)assert.equal(n,1,o.name||o.type);assert.equal(b.kit.colliders.length,0);assert.equal(b.kit.walkables.length,0);
 }
});

test('R42 independent frozen-envelope profile rejects overrides that would falsify retained-roof metadata',()=>{
 for(const change of [{eaveCount:2},{layers:2},{roofH:30},{brackets:false},{storeys:2}]){
  const b=new ZoneBase(library(),config);
  assert.throws(()=>b.buildHall({...item,...change}),/Guhua|Unsupported/);
  assert.equal(b.kit.root.children.length,0,'reject before creating target geometry');
 }
});
