import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { fixture,captureRetained,retainedAreas,meshList,localBounds,item } from './lib/r54-changchun-capture.mjs';
import { replayTerrace,traceTerraceGround } from './lib/terrace-walk.mjs';
const baseline=JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/r54-changchun-r53-baseline.json.gz',import.meta.url))));
const withFixture=fn=>{const v=fixture();try{assert.ok(v.added,'R54 east alcove layers must exist');return fn(v);}finally{v.dispose();}};

test('R54 east alcove replaces only the eight generic cover parts, leaving the kang and all unrelated geometry exact',()=>withFixture(v=>{
  assert.deepEqual(captureRetained(v),baseline.capture);
  assert.deepEqual(retainedAreas(v.f),baseline.retainedAreas);
  assert.equal(meshList(v.f).filter(o=>o.userData.role==='changchun-north-kang').length,2);
  assert.equal(meshList(v.f).filter(o=>['changchun-kang-cover-post','changchun-kang-cover-head'].includes(o.userData.role)&&o.position.x<0).length,0);
}));

test('R54 source, fit and unknown metadata never claim a date, six-leaf total, restoration, or unreadable detail',()=>withFixture(({added})=>{
  const m=added.userData,roles=meshList(added).map(o=>o.userData.role);
  assert.equal(m.stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');
  assert.equal(m.source.caption,'长春宫东梢间');assert.match(m.source.image,/1459/);
  assert.equal(m.source.photographyDate,null);assert.equal(m.source.restorationCampaign,null);
  assert.equal(m.source.rearScreenTotalPanelCount,null);assert.equal(m.source.visibleCentralFieldCount,6);assert.equal(m.currentInventoryVerified,false);
  assert.equal(m.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');
  assert.equal(roles.filter(r=>r==='changchun-east-upper-register-field').length,6);
  assert.equal(roles.filter(r=>r==='changchun-east-recessed-screen-field').length,1);
  assert.equal(roles.filter(r=>r==='changchun-east-visible-central-divider').length,7);
  assert.equal(roles.filter(r=>/lantern|painting|inscription|carving|six-panel/.test(r)).length,0);
  assert.ok(meshList(added).every(o=>o.userData.dimensionStatus===m.dimensionStatus));
}));

test('R54 high transom, gathered curtain and recessed rear field form real separated spatial layers',()=>withFixture(({added,f})=>{
  const rows=meshList(added),find=role=>rows.filter(o=>o.userData.role===role).map(o=>localBounds(o,f));
  const bounds=localBounds(added,f);
  assert.ok(bounds.min.x>=-12.755001&&bounds.max.x<=-8.924999);
  assert.ok(bounds.min.z>=3.16999&&bounds.max.z<=6.03001);
  assert.ok(Math.abs(bounds.min.y-item.ph)<1e-6&&bounds.max.y>item.ph+4.3&&bounds.max.y<item.ph+4.8);
  assert.equal(find('changchun-east-frame-post').length,4);
  assert.ok(find('changchun-east-transom-rail').length>=3);
  assert.equal(find('changchun-east-gathered-curtain').length,4);
  const rear=find('changchun-east-recessed-screen-field')[0],curtain=find('changchun-east-gathered-curtain')[0];
  assert.ok(rear.min.z-curtain.max.z>2,'rear is not a texture on the curtain plane');
  for(const o of rows)for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));
  assert.ok(rows.length<=60);assert.ok(rows.reduce((n,o)=>n+(o.geometry.index?.count??o.geometry.attributes.position.count)/3,0)<3500);
}));

test('R54 solids match visible bounds and stay within the old cover footprint, with no new support surface',()=>withFixture(({b,added,f,cm})=>{
  const range=added.userData.colliderRange,cols=b.kit.colliders.slice(range.start,range.end),solid=meshList(added).filter(o=>o.userData.solid);
  assert.equal(cols.length,solid.length);
  for(const o of solid){const box=new THREE.Box3().setFromObject(o);assert.ok(cols.some(c=>c.min.distanceTo(box.min)<1e-5&&c.max.distanceTo(box.max)<1e-5),o.name);}
  assert.ok(cols.every(c=>c.min.z>=item.z+3.16999));
  for(const [x,z] of [[-10.84,-1.2],[-10.84,2.55],[-9.65,2.55],[10.84,-1.2],[0,-1.2]]){
    assert.equal(cm.checkCollision(new THREE.Vector3(item.x+x,item.ph+1.7,item.z+z),.5),false);
    assert.equal(cm.getGroundHeight(item.x+x,item.z+z,item.ph,.03),item.ph);
  }
  for(const r of b.kit.rooms)for(const p of [...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.5),false);
  assert.deepEqual(JSON.parse(JSON.stringify(b.kit.walkables)),baseline.capture.navigation.walkables);
}));

for(const fps of [10,60])for(const backward of [false,true])test(`R54 real controller enters, approaches east curtain, crosses to west and exits ${fps} Hz ${backward?'S':'W'} sprint`,t=>{
  const v=fixture();assert.ok(v.added);const trace=traceTerraceGround(v.cm,{flights:[]});
  const points=[[0,-10],[0,-1.2],[-10.84,-1.2],[-10.84,2.55],[-10.84,-1.2],[10.84,-1.2],[0,-1.2],[0,-10], [0,-1.2],[-10.84,-1.2],[-9.65,2.55],[-10.84,-1.2],[0,-1.2],[0,-10]].map(([x,z])=>[item.x+x,item.z+z]);
  try{const r=replayTerrace(t,{cm:v.cm,THREE},points,{fps,sprint:true,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=item.ph-.01);assert.ok(r.frames.every(f=>Number.isFinite(f.feet)&&Number.isFinite(f.ground)));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();v.dispose();}
});

test('R54 bounded addition owns and disposes all new materials and geometry; provenance survives production merge',()=>{
  const v=fixture();assert.ok(v.added);const mats=new Set(meshList(v.added).map(m=>m.material)),disposed=new Set();
  for(const m of mats)m.addEventListener('dispose',()=>disposed.add(m));
  const merged=v.b.kit.finish(),records=merged.userData.architecture.filter(r=>r.id==='west-six/changchun-east-kang-layers');
  assert.equal(records.length,1);assert.equal(records[0].source.photographyDate,null);assert.equal(records[0].source.rearScreenTotalPanelCount,null);
  const geos=new Set(meshList(merged).filter(m=>m.material?.name.startsWith('r54_changchun_east_')).map(m=>m.geometry)),disposedGeo=new Set();
  for(const g of geos)g.addEventListener('dispose',()=>disposedGeo.add(g));
  v.b.kit.dispose(merged);assert.deepEqual(disposed,mats);assert.deepEqual(disposedGeo,geos);
});

test('R54 eye-height front and oblique viewpoints are legal and see the real rear field, curtain and transom',()=>withFixture(({f,cm})=>{
  const visible=meshList(f).filter(m=>m.material&&!m.material.transparent),ray=new THREE.Raycaster();
  for(const eye of [[-10.84,2.3,-1.2],[-9.65,2.3,1.1]]) {
    const origin=new THREE.Vector3(eye[0]+item.x,eye[1],eye[2]+item.z);
    assert.equal(cm.checkCollision(origin,.5),false);
    assert.equal(cm.getGroundHeight(origin.x,origin.z,item.ph,.03),item.ph);
    const samples=[['changchun-east-recessed-screen-field',[-11.08,2.4,5.7925]],['changchun-east-gathered-curtain',[-12.1,3.55,3.29]],['changchun-east-transom-rail',[-10.84,item.ph+3.72,3.17]]];
    for(const [role,p] of samples){const target=new THREE.Vector3(p[0]+item.x,p[1],p[2]+item.z);ray.set(origin,target.clone().sub(origin).normalize());const first=ray.intersectObjects(visible,false)[0];assert.equal(first?.object.userData.role,role,`${eye}: actual nearest visible hit must be ${role}, not a wall behind or in front`);}
  }
}));

test('R54 helper rejects transplanted identity before allocation',async()=>{
  const {buildChangchunEastAlcove}=await import('../src/scene/palace/special/ChangchunEastAlcove.js');
  for(const delta of [{name:'翊坤宫'},{domesticProfile:'yikun-domestic'},{w:30},{x:NaN},{ph:.7},{rot:0}]){
    const v=fixture(),children=v.f.children.length,owned=v.b.kit.owned.length,colliders=v.b.kit.colliders.length;
    try{assert.throws(()=>buildChangchunEastAlcove(v.b.kit,{...item,...delta},v.f),/Changchun east alcove/);assert.equal(v.f.children.length,children);assert.equal(v.b.kit.owned.length,owned);assert.equal(v.b.kit.colliders.length,colliders);}finally{v.dispose();}
  }
});
