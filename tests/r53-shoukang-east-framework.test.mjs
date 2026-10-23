import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { fixture, capture, localBounds, item } from './lib/r53-shoukang-capture.mjs';
const baseline = JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/r53-shoukang-r52-baseline.json.gz', import.meta.url))));
const withFixture = fn => { const f = fixture(); try { assert.ok(f.added, 'R53 east north-wall framework must exist'); fn(f); } finally { f.dispose(); } };
const meshes = group => { const a = []; group.traverse(o => { if (o.isMesh) a.push(o); }); return a; };

test('R53 creates only the source-bounded east north-wall partial framework', () => withFixture(({ added, f }) => {
  const m = added.userData, roles = meshes(added).map(o => o.userData.role);
  assert.equal(m.stage, 'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');
  assert.equal(m.source.publicationYear, 2024); assert.equal(m.source.photographyDate, null); assert.equal(m.source.restorationCampaign, null);
  assert.equal(m.source.printedPage, 142); assert.equal(m.source.pdfPage, 4); assert.match(m.source.url, /u66f37561e9b76\.pdf/);
  assert.equal(m.dimensionStatus, 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED'); assert.equal(m.currentInventoryVerified, false);
  assert.ok(roles.includes('shoukang-east-crown-type-outline'));
  assert.equal(roles.filter(r => r === 'shoukang-east-horizontal-register').length, 2);
  assert.equal(roles.filter(r => /buddha|offering|carving|inscription|altar-object/.test(r)).length, 0);
  const bounds = localBounds(added, f), size = bounds.getSize(new THREE.Vector3());
  assert.ok(size.x > 4.4 && size.y > 4, 'room-scale framework, not miniature applied decoration');
  assert.ok(bounds.min.x > -13.45 && bounds.max.x < -8.22482); assert.ok(bounds.max.z <= 8.56 + 1e-5); assert.ok(bounds.min.z > 7);
  assert.ok(Math.abs(bounds.min.y - item.ph) < 1e-6);
  assert.ok(meshes(added).every(o => o.userData.dimensionStatus === m.dimensionStatus));
}));

test('R53 preserves every old mesh, collider, room, map entry, shell and display field exactly', () => withFixture(value => {
  assert.deepEqual(capture(value, true), baseline.capture);
  const { b, added } = value, { start, end } = added.userData.colliderRange;
  assert.equal(end - start, meshes(added).filter(o => o.userData.solid).length);
  for (const o of meshes(added).filter(o => o.userData.solid)) {
    const box = new THREE.Box3().setFromObject(o);
    assert.ok(b.kit.colliders.slice(start, end).some(c => c.min.distanceTo(box.min) < 1e-5 && c.max.distanceTo(box.max) < 1e-5), o.name + ' has exact collision proxy');
  }
}));

test('R53 structural parts are connected to the visible floor-supported front base, with a recessed field', () => withFixture(({ added, f }) => {
  const rows = meshes(added).map(o => ({ o, b: localBounds(o, f) })), connected = new Set(rows.filter(r => Math.abs(r.b.min.y - item.ph) < 1e-6));
  let changed = true; while (changed) { changed = false; for (const r of rows) if (!connected.has(r) && [...connected].some(p => p.b.clone().expandByScalar(1e-5).intersectsBox(r.b))) { connected.add(r); changed = true; } }
  assert.equal(connected.size, rows.length, 'no floating structural parts');
  const recess = rows.find(r => r.o.userData.role === 'shoukang-east-recess-back'), posts = rows.filter(r => r.o.userData.role === 'shoukang-east-niche-upright');
  assert.equal(posts.length, 2); assert.ok(recess.b.min.z - posts[0].b.min.z > .45, 'blank inset is truly recessed rather than painted onto the frame');
  for (const r of rows) for (const a of Object.values(r.o.geometry.attributes)) assert.ok([...a.array].every(Number.isFinite));
}));

test('R53 adds no obstruction to the retained 2.6 m nominal entry, circulation or western room', () => withFixture(({ b, f, cm, added }) => {
  const x = f.userData.structure.bayAxes[1], z = -1.2, { start, end } = added.userData.colliderRange;
  const doorway = new THREE.Box3(new THREE.Vector3(item.x+x-.8,item.ph,item.z+z-1.3),new THREE.Vector3(item.x+x+.8,item.ph+3.3,item.z+z+1.3));
  assert.ok(b.kit.colliders.slice(start,end).every(c => !c.intersectsBox(doorway)));
  assert.equal(f.userData.structure.fit.warmPassageWidth, 2.6);
  for (const dx of [-.65,0,.65]) for (const dz of [-.7,0,.7]) assert.equal(cm.checkCollision(new THREE.Vector3(item.x+x+dx,item.ph+1.7,item.z+z+dz),.5),false);
  for (const [xx,zz] of [[-10.84,-1.2],[-10.84,2],[-10.84,5.8],[10.84,-1.2],[3.5,6.3],[0,6.3]]) assert.equal(cm.checkCollision(new THREE.Vector3(item.x+xx,item.ph+1.7,item.z+zz),.5),false);
  for (const r of b.kit.rooms) for (const p of [...r.doors,...r.spawns]) assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.5),false);
}));

test('R53 addition uses a bounded four-material primitive budget', () => withFixture(({ added }) => {
  const rows = meshes(added), materials = new Set(rows.map(o => o.material));
  assert.equal(materials.size, 4); assert.ok(rows.length <= 24); assert.ok(rows.reduce((n,o)=>n+(o.geometry.index?.count??o.geometry.attributes.position.count)/3,0) <= 420);
  for (const material of materials) { assert.equal(material.map, null); assert.ok(material.roughness >= .7); }
}));


test('R53 owns and disposes its new geometry and four materials', () => {
  const value = fixture(); assert.ok(value.added); const geometry = new Set(), materials = new Set(), disposedGeometry = new Set(), disposedMaterials = new Set();
  for (const m of meshes(value.added)) { geometry.add(m.geometry); materials.add(m.material); }
  for (const g of geometry) g.addEventListener('dispose', () => disposedGeometry.add(g));
  for (const m of materials) m.addEventListener('dispose', () => disposedMaterials.add(m));
  value.dispose(); assert.deepEqual(disposedGeometry,geometry); assert.deepEqual(disposedMaterials,materials);
});

for (const fps of [10,60]) for (const backward of [false,true]) test(`R53 actual east-room entry / north viewing approach ${fps} Hz ${backward?'S':'W'} sprint`, async t => {
  const { replayTerrace, traceTerraceGround } = await import('./lib/terrace-walk.mjs');
  const value = fixture(), trace = traceTerraceGround(value.cm,{flights:[]});
  const route = [[0,-12],[0,-7.6],[-5.61,-7.6],[-5.61,-4],[-5.61,-1.2],[-10.84,-1.2],[-10.84,5.8],[-10.84,-1.2],[-5.61,-1.2],[-5.61,-4],[-5.61,-7.6],[0,-7.6],[0,-12]].map(([x,z])=>[item.x+x,item.z+z]);
  try { const result = replayTerrace(t,{cm:value.cm,THREE},route,{fps,backward,sprint:true,recordFrames:true});
    assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));
    assert.equal(result.startFeet,0); assert.ok(result.maxFeet>=item.ph-.01);
    assert.ok(result.frames.every(f=>Number.isFinite(f.feet)&&Number.isFinite(f.ground)));
    assert.equal(trace.samples.some(s=>s.source==='rescue'),false);
  } finally { trace.restore();value.dispose(); }
});

test('R53 helper rejects malformed retained-bay context before adding resources', async () => {
  const { buildShoukangEastWarmRoom } = await import('../src/scene/palace/special/ShoukangEastWarmRoom.js');
  const changes = [g => { g.bayAxes[0] = NaN; }, g => { g.bayAxes[1] = Infinity; }, g => { delete g.fit; }, g => { g.fit.warmPassageWidth = 2; }];
  for (const mutate of changes) {
    const value=fixture(), geometry=structuredClone(value.f.userData.structure), count=value.f.children.length, owned=value.b.kit.owned.length, colliders=value.b.kit.colliders.length;
    mutate(geometry);
    try { assert.throws(()=>buildShoukangEastWarmRoom(value.b.kit,item,value.f,geometry), /Shoukang east framework/);
      assert.equal(value.f.children.length,count); assert.equal(value.b.kit.owned.length,owned); assert.equal(value.b.kit.colliders.length,colliders);
    } finally {value.dispose();}
  }
});
