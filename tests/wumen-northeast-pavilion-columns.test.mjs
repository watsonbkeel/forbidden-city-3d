import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {existsSync,readFileSync} from 'node:fs';
import {meshFingerprint} from './lib/gate-tower-fixture.mjs';
import {captureSource,northColumns,applyCandidate,TARGET,bodyFingerprint} from './lib/r58-wumen-pavilion-fixture.mjs';
const url=new URL('../src/scene/palace/special/WumenPavilionColumns.js',import.meta.url);
const api=existsSync(url)?await import(url):null;
const expected=[239,277,338,427,489,526].map(p=>5.5-(p-239)*11/287).reverse();
const source=captureSource(),before=bodyFingerprint(source.body),other=source.group.children.filter(c=>c!==source.body).map(c=>meshFingerprint(c));
const physics=JSON.stringify([source.builder.colliders,source.builder.walkables]);
const keepFingerprints=new Map(source.body.children.map(o=>[o,meshFingerprint(o)]));
const materialFingerprints=new Map();source.group.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean))materialFingerprints.set(m,JSON.stringify(m.toJSON()));});
const originals=[...source.body.children],oldRow=northColumns(source.body),corners=[oldRow[0],oldRow[3]],oldMiddle=oldRow.slice(1,3),proxies=[...source.body.userData.colliders];
const candidate=applyCandidate(source,api),row=northColumns(candidate.body);
const close=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const northProxy=b=>Math.abs((b.min.z+b.max.z)/2-5.5)<1e-8;
test('source has frozen 4-column / 3 equal-span shape before refinement',()=>{
 assert.equal(oldRow.length,4);assert.deepEqual(oldRow.map(o=>o.position.x),[-5.5,-1.8333333333333335,1.833333333333333,5.5]);
 const frozen=JSON.parse(readFileSync(new URL('../docs/photo-fidelity/EVIDENCE/r58-wumen-northeast-columns/baseline.json',import.meta.url)));assert.equal(before,frozen.bodyFingerprint);
});
test('target north row is six registered unequal-spaced columns; no old middle duplicates',()=>{
 assert.equal(row.length,6);row.forEach((o,i)=>close(o.position.x,expected[i]));assert.ok(oldMiddle.every(o=>o.parent===null));
 for(const old of oldMiddle)assert.ok(!row.some(o=>Math.abs(o.position.x-old.position.x)<.01));
 assert.equal(row[0],corners[0]);assert.equal(row.at(-1),corners[1]);
 assert.equal(candidate.body.userData.topY,7.5);assert.equal(candidate.body.userData.structure.id,TARGET);
 assert.equal(candidate.body.userData.structure.parentId,'FC-86C9330D65');
});
test('only north-row local proxies change; every new proxy matches actual low column geometry',()=>{
 const active=candidate.body.userData.colliders,changed=active.filter(northProxy),retained=proxies.filter(b=>!northProxy(b));assert.equal(changed.length,6);
 assert.deepEqual(active.filter(b=>!northProxy(b)),retained);retained.forEach(b=>assert.ok(active.includes(b)));
 row.forEach((o,i)=>{o.geometry.computeBoundingBox();const bounds=o.geometry.boundingBox.clone().translate(o.position);bounds.min.y=Math.max(0,bounds.min.y);bounds.max.y=Math.min(3,bounds.max.y);
  const b=changed.find(b=>Math.abs((b.min.x+b.max.x)/2-o.position.x)<1e-8);assert.ok(b);assert.deepEqual(b,bounds);
 });
 for(const old of oldMiddle)assert.ok(!changed.some(b=>Math.abs((b.min.x+b.max.x)/2-old.position.x)<.01));
});
test('corners, south row, enclosure, beams, other pavilions/roofs/ascent are exact',()=>{
 const keep=originals.filter(o=>!oldMiddle.includes(o));assert.ok(keep.every(o=>candidate.body.children.includes(o)));keep.forEach(o=>assert.equal(meshFingerprint(o),keepFingerprints.get(o)));for(const [m,json]of materialFingerprints)assert.equal(JSON.stringify(m.toJSON()),json);
 assert.deepEqual(candidate.group.children.filter(c=>c!==candidate.body).map(c=>meshFingerprint(c)),other);
 assert.equal(JSON.stringify([candidate.builder.colliders,candidate.builder.walkables]),physics);
 assert.equal(candidate.body.children.length,originals.length+2);
});
test('every north column base contacts retained visible deck geometry in correct transformed instance',()=>{
 assert.equal(row.length,6);candidate.group.updateMatrixWorld(true);
 for(const col of row){const p=col.getWorldPosition(new THREE.Vector3());close(p.x,col.position.x-47.7);close(p.z,-.5);
  col.geometry.computeBoundingBox();const bottom=col.geometry.boundingBox.min.y+p.y;close(bottom,12.3,2e-7);
  for(const [dx,dz] of [[0,0],[.2,.0],[-.2,0],[0,.2],[0,-.2]]){
   const hits=new THREE.Raycaster(new THREE.Vector3(p.x+dx,bottom+.02,p.z+dz),new THREE.Vector3(0,-1,0),0,.04).intersectObjects(candidate.group.children.filter(c=>c!==candidate.body),true);
   assert.ok(hits.some(h=>h.object.material.name==='stone_slab'&&Math.abs(h.point.y-bottom)<2e-6),'actual deck triangle contact, not walkable metadata');
  }
 }
});
test('wrong-instance negatives and invalid source shape do not mutate or allocate geometry',()=>{
 assert.ok(api);for(const id of ['INSTANCE-A-WUMEN-WEST-NORTH-PAVILION','INSTANCE-A-WUMEN-EAST-SOUTH-PAVILION','INSTANCE-A-WUMEN-WEST-SOUTH-PAVILION',undefined]){
  const c=captureSource(),fingerprint=bodyFingerprint(c.body),proxy=JSON.stringify(c.body.userData.colliders),data=JSON.stringify(c.body.userData);
  assert.equal(api.refineWumenPavilionNorthColumns(c.body,{instanceId:id}),false);assert.equal(bodyFingerprint(c.body),fingerprint);assert.equal(JSON.stringify(c.body.userData.colliders),proxy);assert.equal(JSON.stringify(c.body.userData),data);
 }
 const bad=captureSource();northColumns(bad.body)[1].position.x+=.1;const hash=bodyFingerprint(bad.body);assert.throws(()=>api.refineWumenPavilionNorthColumns(bad.body,{instanceId:TARGET}),/retained/);assert.equal(bodyFingerprint(bad.body),hash);
 const wrongTransform=captureSource();wrongTransform.body.position.x*= -1;assert.throws(()=>api.refineWumenPavilionNorthColumns(wrongTransform.body,{instanceId:TARGET}),/retained/);
});
test('repeat application is a no-op; geometry and materials stay shared and undisposed',()=>{
 assert.ok(api);const hash=bodyFingerprint(candidate.body);let disposed=0;const geo=row[0].geometry;geo.addEventListener('dispose',()=>disposed++);
 assert.equal(api.refineWumenPavilionNorthColumns(candidate.body,{instanceId:TARGET}),false);assert.equal(bodyFingerprint(candidate.body),hash);assert.equal(disposed,0);
 assert.ok(row.every(o=>o.geometry===geo&&o.material===row[0].material));
});
test('source and candidate complete body triangles have finite positions/normals/UV, nonzero area and positive volume',()=>{
 for(const column of new Set([...originals,...candidate.body.children])){const g=column.geometry,p=g.attributes.position,ix=g.index;let volume=0;
  for(const a of Object.values(g.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));
  for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k));assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()>1e-10);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;}assert.ok(volume>0);
 }
});

const {PalaceBuilder}=await import('../src/scene/PalaceBuilder.js');
const {CollisionManager}=await import('../src/utils/Collision.js');
const {assertWumenNortheastColumnsInWorld}=await import('./lib/r58-wumen-pavilion-world-check.mjs');
function mergedCandidate(apply=true){
 const c=captureSource();if(apply)applyCandidate(c,api);
 const cm=new CollisionManager();cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);
 c.merged=PalaceBuilder.prototype.finish.call(c.builder,c.group);c.builder.scene.updateMatrixWorld(true);return {...c,W:{scene:c.builder.scene,cm}};
}
test('actual final merge retains one target, six visible columns, deck contacts and whole-body blocking',()=>{
 const c=mergedCandidate();const report=assertWumenNortheastColumnsInWorld(c.W);assert.equal(report.probes.length,6);assert.equal(report.actualDeckContacts.length,6);
 assert.throws(()=>assertWumenNortheastColumnsInWorld(mergedCandidate(false).W));
 const mesh=c.merged.children.find(m=>m.material?.name==='wood_column');mesh.visible=false;assert.throws(()=>assertWumenNortheastColumnsInWorld(c.W));mesh.visible=true;
 const material=mesh.material;mesh.material=material.clone();mesh.material.transparent=true;mesh.material.opacity=0;assert.throws(()=>assertWumenNortheastColumnsInWorld(c.W));mesh.material.dispose();mesh.material=material;
 const record=c.merged.userData.architecture.find(r=>r.id===TARGET);c.merged.userData.architecture.push({...record});assert.throws(()=>assertWumenNortheastColumnsInWorld(c.W));c.merged.userData.architecture.pop();
 c.merged.position.x+=.5;c.merged.updateMatrixWorld(true);assert.throws(()=>assertWumenNortheastColumnsInWorld(c.W));c.merged.position.x-=.5;c.merged.updateMatrixWorld(true);
 const index=c.W.cm.colliders.findIndex(c=>Math.abs(c.box.min.x+53.2)<1e-5&&Math.abs(c.box.max.x+42.2)<1e-5&&Math.abs(c.box.min.y-12.3)<1e-5);c.W.cm.colliders.splice(index,1);assert.throws(()=>assertWumenNortheastColumnsInWorld(c.W));
});
test('merged geometry delta is exactly +96 triangles and zero material draw calls; resources dispose once',()=>{
 const baseline=mergedCandidate(false),c=captureSource();applyCandidate(c,api);
 const rawResources=new Set();c.group.traverse(o=>{if(o.geometry)rawResources.add(o.geometry);});const events=new Map([...rawResources].map(g=>[g,0]));for(const g of rawResources)g.addEventListener('dispose',()=>events.set(g,events.get(g)+1));
 const originalMaterials=new Set();c.group.traverse(o=>{if(o.material&&!Array.isArray(o.material))originalMaterials.add(o.material);});let prematureMaterialDisposals=0;for(const m of originalMaterials)m.addEventListener('dispose',()=>prematureMaterialDisposals++);
 const merged=PalaceBuilder.prototype.finish.call(c.builder,c.group);const retainedResources=new Set();merged.traverse(o=>{if(o.geometry)retainedResources.add(o.geometry);});for(const [g,n] of events)assert.equal(n,retainedResources.has(g)?0:1);assert.equal(prematureMaterialDisposals,0);
 const counts=root=>{let triangles=0,draws=0;root.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;draws++;}});return{triangles,draws};};const a=counts(baseline.merged),b=counts(merged);assert.equal(b.triangles-a.triangles,96);assert.equal(b.draws-a.draws,0);
 const mergedEvents=new Map();merged.traverse(o=>{if(o.geometry){mergedEvents.set(o.geometry,0);o.geometry.addEventListener('dispose',()=>mergedEvents.set(o.geometry,mergedEvents.get(o.geometry)+1));}});c.builder.dispose();assert.ok([...mergedEvents.values()].every(n=>n===1));assert.ok([...events.values()].every(n=>n===1),'including unmerged retained plaque geometry after final disposal');assert.equal(c.builder.scene.children.length,0);assert.equal(c.builder.colliders.length,0);assert.equal(c.builder.walkables.length,0);
});
