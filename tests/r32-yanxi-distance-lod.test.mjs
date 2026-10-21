import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { buildYanxiRuin, YANXI_RUIN_PROFILE as P } from '../src/scene/palace/special/YanxiRuin.js';
import { BatchedBuilder } from '../src/render/BatchedBuilder.js';
import { FlightEnvelope, createPalaceFlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
import { library, hash } from './lib/inner-palace-fixture.mjs';

const ITEM = { kind: 'hall', name: '延禧宫', structure: 'yanxi-ruin', ruinProfile: 'lingzhao-current', x: -148.2, z: 324.9, w: 16.3, d: 11.7 };
const triangles = root => { let n = 0; root.traverse(o => { if (o.isMesh) n += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; }); return n; };
function fixture() {
  const zone = new ZoneBase(library(), { id: 'yanxi-lod-test', items: [ITEM] });
  const data = zone.build(), lod = data.group.getObjectByName('yanxi-ruin-distance-detail');
  assert.ok(lod?.isLOD, 'zone must install the ruin LOD after its ordinary merge');
  data.group.updateMatrixWorld(true);
  return { zone, data, lod, near: lod.levels[0].object, far: lod.levels[1].object };
}
const camera = (x, y, z) => { const c = new THREE.PerspectiveCamera(70, 16 / 9, .1, 1500); c.position.set(x, y, z); c.updateMatrixWorld(true); return c; };
const update = (lod, x, y, z) => { lod.update(camera(x, y, z)); assert.equal(lod.levels.filter(l => l.object.visible).length, 1); return lod.getCurrentLevel(); };
const ray = (root, p, d, far = 100) => new THREE.Raycaster(new THREE.Vector3(...p), new THREE.Vector3(...d), 0, far).intersectObject(root, true);
function rawRows(root) { const rows = []; root.traverse(m => { if (m.isMesh) rows.push({ name:m.name, matrix:m.matrix.toArray(), material:m.material.name,
  a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([n,a]) => [n,[a.itemSize,...a.array]])), index:m.geometry.index?[...m.geometry.index.array]:null }); }); return rows; }

// A changed merge transform, omitted mesh, modified near member, collision edit,
// eager double-visible LOD or loss of a real aperture must fail these contracts.
test('zone installs a default-near, initially hidden-far 120 m visual LOD after merging', () => {
  const { zone, data, lod, near, far } = fixture();
  assert.deepEqual(lod.levels.map(l => [l.distance, l.hysteresis, l.object.visible]), [[0,0,true],[120,.1,false]]);
  assert.equal(near.children.length, 5); assert.equal(far.children.length, 5);
  assert.equal(data.group.userData.architecture.length, 1);
  assert.equal(data.group.userData.architecture[0].id, P.id);
  assert.deepEqual(data.group.userData.architecture[0], near.userData.structure);
  assert.equal(data.rooms.length, 0); assert.equal(data.walkables.length, 0); assert.equal(data.regions.length, 0);
  zone.dispose();
});

test('original full ruin and navigation retain their frozen pre-LOD geometry and physics', () => {
  const kit = new CourtKit(library()), { f } = buildYanxiRuin(kit, ITEM);
  assert.equal(hash(rawRows(f)), 'a152566dde63223e045cb08af68d106f910f1dc4f5653bd4a4b3250a8a3e80c8');
  assert.equal(hash(kit.colliders), '857b629eae9250826c7c9d4d5017d7b969b8e5b6b35428f1e814fb5c5b520d69');
  assert.equal(hash(kit.mapItems), '4ba0782a465a378eacab1d2c38fb2c5c850e82c2492a4480756a7c491ff129b4');
  const { zone, data, near } = fixture();
  const reference = kit.finish(); reference.updateMatrixWorld(true); near.updateMatrixWorld(true);
  const snapshot = root => { const out = new Map(); root.traverse(m => { if (m.isMesh) out.set(m.material.name,m); }); return out; };
  for (const [material, old] of snapshot(reference)) {
    const actual = snapshot(near).get(material);
    assert.ok(actual); assert.equal(actual.material.side, old.material.side);
    assert.deepEqual(actual.geometry.attributes.normal.array, old.geometry.attributes.normal.array);
    assert.deepEqual(actual.geometry.attributes.uv.array, old.geometry.attributes.uv.array);
    const a = old.geometry.attributes.position, b = actual.geometry.attributes.position;
    assert.equal(a.count,b.count);
    for (let i=0;i<a.count;i++) {
      const av = new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(old.matrixWorld);
      const bv = new THREE.Vector3().fromBufferAttribute(b,i).applyMatrix4(actual.matrixWorld);
      assert.ok(av.distanceTo(bv)<.00003, `world vertex drift ${material}/${i}`);
    }
  }
  assert.equal(triangles(near),11672);
  assert.deepEqual(data.colliders,kit.colliders); assert.deepEqual(data.mapItems,kit.mapItems);
  assert.deepEqual(data.group.userData.architecture[0],reference.userData.architecture[0]);
  zone.dispose();kit.dispose(reference);
});

test('far ruin has <=1200 triangles, finite nondegenerate faces and a bounded five-pavilion silhouette', () => {
  const { zone, near, far } = fixture();
  assert.ok(triangles(far)<=1200, `${triangles(far)} far triangles`);
  assert.deepEqual(far.userData.silhouette.pavilions.map(p=>[p.id,p.sides]), [['southeast',6],['southwest',6],['northeast',8],['northwest',8],['central',8]]);
  assert.equal(far.userData.silhouette.centralTiers,2);
  assert.equal(far.userData.silhouette.water,false);
  const a = new THREE.Box3().setFromObject(near), b = new THREE.Box3().setFromObject(far);
  assert.ok(a.clone().expandByScalar(.0001).containsBox(b));
  for(const key of ['x','y','z']) { assert.ok(Math.abs(a.min[key]-b.min[key])<.1);assert.ok(Math.abs(a.max[key]-b.max[key])<.1); }
  far.traverse(m=>{
    if(!m.isMesh)return;
    assert.equal(m.material.side,THREE.DoubleSide);
    assert.equal(/roof|throne|glaze|tile/i.test(m.material.name),false);
    for(const attr of Object.values(m.geometry.attributes)) assert.ok([...attr.array].every(Number.isFinite));
    const p=m.geometry.attributes.position,idx=m.geometry.index;
    for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j));assert.ok(v[1].sub(v[0]).cross(v[2].sub(v[0])).length()>1e-9);}
  });
  zone.dispose();
});

test('far main arches, open upper frames and dry recessed pool remain real geometric apertures', () => {
  const { zone, far } = fixture();
  for(const sign of[-1,1]){
    const z=ITEM.z+sign*4;
    for(const x of[0,-3.7,3.7]) assert.equal(ray(far,[ITEM.x+x,2.4,z+sign],[0,0,-sign],1.5).length,0);
    assert.ok(ray(far,[ITEM.x+2,1.8,z+sign],[0,0,-sign],1.5).length);
  }
  for(const [x,z] of[[3.1,2.1],[-3.1,2.1],[3.1,-2.1],[-3.1,-2.1]]) assert.equal(ray(far,[ITEM.x+x,15,ITEM.z+z],[0,-1,0]).some(h=>h.point.y>5.1),false);
  for(const q of P.cornerPavilions) {
    assert.equal(ray(far,[ITEM.x+q.x,15,ITEM.z+q.z],[0,-1,0]).some(h=>h.point.y>q.upperBaseY+.2),false);
    assert.ok(ray(far,[ITEM.x+q.x, q.upperTopY, ITEM.z+q.z],[1,0,0],3).length,'polygonal upper ring remains');
  }
  const floor=ray(far,[ITEM.x+9,5,ITEM.z],[0,-1,0]);assert.ok(floor.length);assert.ok(Math.abs(floor[0].point.y-P.pool.bottomY)<1e-5);
  zone.dispose();
});

test('hysteresis is camera-independent and all six budget viewpoints plus 100 m overhead select expected detail', () => {
  const { zone, lod, data } = fixture(), before=hash(data.colliders);
  for(const d of[20,100,119.99])assert.equal(update(lod,ITEM.x+d,0,ITEM.z),0);
  for(const d of[120.01,119,108.01])assert.equal(update(lod,ITEM.x+d,0,ITEM.z),1);
  assert.equal(update(lod,ITEM.x+107.99,0,ITEM.z),0);
  for(const v of[[1,0,0],[-1,0,0],[0,1,0],[0,0,1],[0,0,-1]]){
    assert.equal(update(lod,ITEM.x+v[0]*150,v[1]*150,ITEM.z+v[2]*150),1);
    assert.equal(update(lod,ITEM.x+v[0]*100,v[1]*100,ITEM.z+v[2]*100),0);
  }
  const { LAYOUT:L }=awaitImportConstants;
  const anchors=JSON.parse(fs.readFileSync(new URL('../data/anchors.json',import.meta.url))),hj=anchors['皇极门'];
  const points=[[0,L.START_POSITION.z,1],[0,-74,1],[0,+(L.QIANQING_GATE_Z-20).toFixed(1),1],[-120.8,382.6,0],[hj.x,+(hj.z+10).toFixed(1),1],[0,+(L.IMPERIAL_GARDEN_Z-95.6/2+11).toFixed(1),1]];
  for(const [x,z,level]of points)assert.equal(update(lod,x,1.7,z),level,`budget camera ${x}/${z}`);
  assert.equal(hash(data.colliders),before);zone.dispose();
});
const awaitImportConstants = await import('../src/config/constants.js');

test('default renderer path keeps Yanxi LOD meshes unbatched and switches them on the current frame', () => {
  const {zone,data,lod,near,far}=fixture(),scene=new THREE.Scene();scene.add(data.group);
  const batches=new BatchedBuilder(scene);batches.begin();
  assert.equal(batches.batches.length,0,'distinct far materials keep automatic renderer LOD evaluation current-frame');
  update(lod,ITEM.x,1.7,ITEM.z-150);assert.equal(near.visible,false);assert.equal(far.visible,true);
  batches.end();batches.dispose();zone.dispose();
});

test('material sharing still obeys real BatchedMesh visibility, bounds and rebuild lifecycle after LOD selection',()=>{
  const{zone,data,lod,near,far}=fixture(),scene=new THREE.Scene();scene.add(data.group);
  const other=new THREE.Group();for(const mesh of far.children){const copy=new THREE.Mesh(mesh.geometry,mesh.material);copy.position.set(1000,0,0);copy.receiveShadow=mesh.receiveShadow;other.add(copy);}scene.add(other);
  const batches=new BatchedBuilder(scene);
  for(const distance of[20,150,110,100,200]){
    update(lod,ITEM.x+distance,0,ITEM.z);batches.begin();assert.equal(batches.batches.length,5);
    const view=camera(ITEM.x+distance,5,ITEM.z);view.lookAt(ITEM.x,5,ITEM.z);view.updateMatrixWorld(true);
    for(const{batch,entries}of batches.batches){
      assert.equal(batch.perObjectFrustumCulled,true);
      for(const entry of entries)if(entry.mesh.parent===far)assert.equal(batch.getVisibleAt(entry.id),far.visible);
      batch.onBeforeRender({coordinateSystem:THREE.WebGLCoordinateSystem},scene,view,batch.geometry,batch.material);
      assert.equal(batch._multiDrawCount,far.visible?1:0,'offscreen duplicate is culled; current far selection is rendered');
      if(far.visible){const source=entries.find(e=>e.mesh.parent===far).mesh;assert.equal(batch._multiDrawCounts[0],source.geometry.attributes.position.count);}
    }
    batches.end();assert.equal(near.visible,!far.visible);
  }
  batches.dispose();other.clear();zone.dispose();
});

test('two independent load/unload cycles retain navigation and dispose each near/far owned resource once',()=>{
  for(let cycle=0;cycle<2;cycle++){
    const{zone,data,lod}=fixture(),counts=new Map(),watch=r=>{if(counts.has(r))return;counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));};
    data.group.traverse(m=>{if(m.geometry)watch(m.geometry);});zone.kit.owned.forEach(watch);
    assert.equal(new Set(zone.kit.owned).size,zone.kit.owned.length);
    assert.equal(hash(data.colliders),'857b629eae9250826c7c9d4d5017d7b969b8e5b6b35428f1e814fb5c5b520d69');
    assert.equal(hash(data.mapItems),'4ba0782a465a378eacab1d2c38fb2c5c850e82c2492a4480756a7c491ff129b4');
    update(lod,ITEM.x+200,0,ITEM.z);zone.dispose();for(const n of counts.values())assert.equal(n,1);
    assert.equal(zone.kit.colliders.length,0);assert.equal(zone.group,null);
  }
});


test('complete original flight height/water grid remains byte-equal with both LOD levels and unloaded-zone extraction',()=>{
  const kit=new CourtKit(library());buildYanxiRuin(kit,ITEM);const old=kit.finish(),baseline=new FlightEnvelope().addRoot(old);
  const {zone,data,lod}=fixture(),empty=new THREE.Group();
  for(const distance of[20,150]){
    update(lod,ITEM.x+distance,0,ITEM.z);
    const grid=createPalaceFlightEnvelope({palaceBuilder:{ownedObjects:[]},enclosure:{group:empty},garden:{group:empty},zoneManager:{zones:new Map([['yanxi',{}]]),loaded:new Map(),prebuilt:new Map([['yanxi',{data}]])},layout:[]});
    assert.deepEqual(grid.heights,baseline.heights);assert.deepEqual(grid.water,baseline.water);assert.equal(grid.maxHeight,baseline.maxHeight);
    assert.equal(grid.triangles,11672+1164,'both visible and hidden geometry is conservatively captured');
  }
  zone.dispose();kit.dispose(old);
});

test('raw near resources are disposed once on merge, and both installed levels once on unload',()=>{
  const zone=new ZoneBase(library(),{id:'lifecycle',items:[]});zone.buildHall(ITEM);
  const raw=zone.kit.root.children[0],counts=new Map(),watch=r=>{if(counts.has(r))return;counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));};
  raw.traverse(o=>{if(o.geometry)watch(o.geometry);});const sources=[...counts.keys()];
  const data=zone.build();sources.forEach(r=>assert.equal(counts.get(r),1));
  data.group.traverse(o=>{if(o.geometry)watch(o.geometry);});zone.kit.owned.forEach(watch);zone.dispose();
  for(const n of counts.values())assert.equal(n,1);
});
