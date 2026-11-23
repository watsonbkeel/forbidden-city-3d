import '../lib/inner-palace-fixture.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {buildRemainingHall,resolveRemainingProfile} from '../../src/scene/palace/special/RemainingOuterHalls.js';
function fixture(){const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-west'),item=JSON.parse(fs.readFileSync('data/zones/outer-west.json')).items.find(x=>x.name==='南薰殿'),built=buildRemainingHall(kit,item,resolveRemainingProfile('outer-west',item));kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);return {...built,kit,lib};}
function close(h){h.kit.dispose(h.kit.root);h.lib.dispose();}
test('Nanxun circular stepped bracket courses are actual source-bounded geometry; rejected dragon is not installed',()=>{const h=fixture();try{const m=h.f.children.filter(x=>x.userData.r137NanxunRing);assert.ok(m.length>100,'missing stepped ring brackets');assert.equal(h.g.caisson.dragonRelief,'UNMODELED');assert.equal(h.f.children.filter(x=>x.userData.r137NanxunRelief).length,0);for(const mesh of m){mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrix);assert.ok(b.min.y>6.5&&b.max.y<8,'bounded ceiling relief');for(const v of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(v));assert.equal(mesh.material.transparent,false);assert.equal(mesh.material.map,null);assert.equal(mesh.userData.source,'https://img.dpm.org.cn/Uploads/Picture/dc/3938[1024].jpg');}assert.equal(h.g.inventory.status,'UNKNOWN');}finally{close(h);}});
import {createHash} from 'node:crypto';import {buildNanxunCaissonRings} from '../../src/scene/palace/special/NanxunCaissonRings.js';
const loc=new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),source=fs.readFileSync(new URL('../fixtures/r137/RemainingOuterHalls-r136.js.txt',import.meta.url),'utf8'),old=await import('data:text/javascript;base64,'+Buffer.from(source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id.startsWith('.')?new URL(id,loc).href:import.meta.resolve(id)}${q}`)).toString('base64'));
assert.equal(createHash('sha256').update(source).digest('hex'),'8c3d12de1892ea4b10e27c316d5d5e6dd2e71e20d76e28c395e297f69b608e2f');
function baseline(){const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-west'),item=JSON.parse(fs.readFileSync('data/zones/outer-west.json')).items.find(x=>x.name==='南薰殿'),p=old.resolveRemainingProfile('outer-west',item),built=old.buildRemainingHall(kit,item,p);kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);return {...built,kit,lib,p,item};}
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const geometry=m=>({role:m.userData.role,matrix:m.matrix.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:[...(m.geometry.index?.array??[])],color:m.material.color.getHex(),material:m.material.name});
// Native R137 (22d1e728): the unchanged test passed 5/5. R170 (53df463a) removed
// exactly the hidden box top below the stone paving. Never exempt the whole box.
const nativePhysics = {
  colliders:'0fd85cd460d906f55a8ad2348a76bd5859063b3acbec552d5ff6be58f782dc1b',
  walkables:'23294b91ffe50042d045eb0af777e2242913d2cfc126693691408ab1a2ed8f10',
  rooms:'10ff47fe3459a72941e9a2a75529f3dc37515262cc97a8832961e6fc6aa53671',
  mapItems:'5d9dc43044e06177cdc06238cdd6a432fcb350d6352ba1a837076240d6a3efff',
  regions:'e74eead50c521ea50d2b7cca723f68ad4d45997e589e062fe374c454857fc2b4',
};
function drawFaces(mesh) {
  const pos=mesh.geometry.attributes.position, ix=mesh.geometry.index;
  const drawn=ix?Array.from(ix.array):Array.from({length:pos.count},(_,i)=>i);
  const top=[];
  for(let i=0;i<drawn.length;i+=3){
    const ids=drawn.slice(i,i+3),tri=new T.Triangle(...ids.map(id=>new T.Vector3().fromBufferAttribute(pos,id).applyMatrix4(mesh.matrixWorld)));
    if(tri.getNormal(new T.Vector3()).y>.999999 && [tri.a,tri.b,tri.c].every(v=>Math.abs(v.y-.6)<1e-5))top.push(...ids);
  }
  return {drawn,top};
}
function platformEvidence(h) {
  const meshes=h.f.children.filter(m=>m.isMesh&&!m.userData.r137NanxunRing);
  const select=(material,y)=>meshes.filter(m=>m.material===h.lib.material(material)&&Math.abs(m.position.y-y)<1e-7);
  const bases=select('wall_brick',.3),covers=select('stone_slab',.6-.04);
  assert.equal(bases.length,1,'one masonry base');assert.equal(covers.length,1,'one intact cover');
  const [base]=bases,[cover]=covers;
  assert.ok(base.visible&&cover.visible&&cover.material.opacity===1&&!cover.material.transparent,'visible opaque cover');
  assert.equal(meshes.indexOf(base),0);assert.equal(meshes.indexOf(cover),1);
  return {identity:[h.g.id,h.g.key,h.g.name,h.g.y,h.f.position.x,h.f.position.z],
    rows:meshes.map(geometry),base:drawFaces(base),cover:drawFaces(cover),
    physics:Object.fromEntries(Object.keys(nativePhysics).map(k=>[k,hash(h.kit[k])]))};
}
function assertRetention(a,b) {
  const identity=['place-outer-west-fa7f5d119e','nanxun','南薰殿',.6,289.6,-315.7];
  assert.deepEqual(a.identity,identity,'source identity');assert.deepEqual(b.identity,identity,'source identity');
  assert.deepEqual(a.physics,nativePhysics,'native physical arrays');assert.deepEqual(b.physics,a.physics,'five raw physical arrays');
  assert.equal(a.rows.length,245);assert.equal(b.rows.length,a.rows.length);
  const top=[12,13,14,15,16,17];
  assert.deepEqual(a.base.top,top);assert.equal(a.base.drawn.length,36);assert.deepEqual(a.rows[0].index,[]);
  assert.deepEqual(a.cover.top,top);assert.deepEqual(b.cover,a.cover,'stone cover retains its original two upward triangles');
  assert.deepEqual(b.base.top,[],'no upward base triangle may remain');const kept=a.base.drawn.filter(i=>!top.includes(i));
  assert.deepEqual(b.base.drawn,kept,'remove only the two covered upward triangles');
  assert.deepEqual(b.rows[0].index,kept,'preserve source triangle order and winding');
  const original=hash(a.rows);
  assert.equal(original,'54904b58d2bffb24392d8b4a33885b4599220150547516027bb991e6a7bcbf76','unchanged predecessor evidence');
  // Compare every original field and the complete ordered population. Only substitute
  // the proved R170 index in a detached expected descriptor; never edit live geometry.
  assert.equal(hash(b.rows),hash([{...a.rows[0],index:kept},...a.rows.slice(1)]),'all ordered original mesh fields');
}
test('all original Nanxun meshes/materials and physical/navigation arrays remain byte-equivalent to frozen R136',()=>{
  const a=baseline(),b=fixture();
  try{
    const old=platformEvidence(a),live=platformEvidence(b);
    assertRetention(old,live);
    // Mutate this test's live fixtures one field at a time; restore each for disposal.
    const [base,cover]=b.f.children.filter(m=>m.isMesh&&!m.userData.r137NanxunRing);
    const ix=base.geometry.index,wrong=Array.from(ix.array);wrong.splice(0,3,12,13,14);
    base.geometry.setIndex(wrong);
    try{assert.throws(()=>assertRetention(old,platformEvidence(b)),/no upward base triangle/);}
    finally{base.geometry.setIndex(ix);}
    const order=b.f.children.indexOf(cover);b.f.remove(cover);
    try{assert.throws(()=>platformEvidence(b),/one intact cover/);}
    finally{b.f.add(cover);b.f.children.splice(order,0,b.f.children.pop());}
    b.kit.rooms.push({unexpected:'room'});
    try{assert.throws(()=>assertRetention(old,platformEvidence(b)),/five raw physical/);}
    finally{b.kit.rooms.pop();}
    const id=b.g.id;b.g.id='different source';
    try{assert.throws(()=>assertRetention(old,platformEvidence(b)),/source identity/);}
    finally{b.g.id=id;}
  }finally{close(a);close(b);}
});
test('ring solids are finite closed outward volumes above the actual player body envelope',()=>{const h=fixture();try{for(const m of h.f.children.filter(x=>x.userData.r137NanxunRing)){const g=m.geometry,p=g.attributes.position,ix=g.index,edges=new Map();let volume=0;const key=v=>v.toArray().map(n=>Math.round(n*1e5)).join(',');for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k));volume+=v[0].dot(v[1].clone().cross(v[2]))/6;for(let j=0;j<3;j++){const a=key(v[j]),b=key(v[(j+1)%3]);if(a===b)continue;const edge=[a,b].sort().join('|');edges.set(edge,(edges.get(edge)??0)+1);}}assert.ok(volume>0,'closed positive volume');for(const n of edges.values())assert.equal(n,2,'closed welded edge');g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(m.matrix);assert.ok(b.min.y>6.5,'more than 4m above .6 floor + normal player');}}finally{close(h);}});
test('identity or source drift fails before allocating ring geometry',()=>{for(const mutate of [h=>h.item={...h.item,name:'其他'},h=>h.f.scale.x=2,h=>h.f.rotation.y=.1,h=>h.g.w=24,h=>h.f.remove(h.f.children.find(m=>m.userData.role==='nanxun-circular-caisson-transition'))]){const h=baseline();try{mutate(h);const n=h.f.children.length;assert.throws(()=>buildNanxunCaissonRings({...h,m:{},p:h.p,item:h.item}));assert.equal(h.f.children.length,n);}finally{close(h);}}});
test('actual merged geometry exposes ring relief to upward room rays and releases reused material once per lifecycle',()=>{for(let cycle=0;cycle<3;cycle++){const a=baseline(),b=fixture();try{const target=b.f.children.find(m=>m.userData.r137NanxunRing).material;let disposed=0;target.addEventListener('dispose',()=>disposed++);const am=a.kit.finish(),bm=b.kit.finish();am.updateMatrixWorld(true);bm.updateMatrixWorld(true);let closer=0;const perRadius={};for(let k=0;k<48;k++)for(const r of [1.43,1.535,1.64]){const angle=(k+(r===1.535?.5:0))*Math.PI/24,origin=new T.Vector3(289.6+Math.sin(angle)*r,2.3,-315.7+Math.cos(angle)*r),ray=new T.Raycaster(origin,new T.Vector3(0,1,0),0,8),before=ray.intersectObject(am,true),after=ray.intersectObject(bm,true);assert.ok(before.length&&after.length);if(after[0].distance<before[0].distance-.015){closer++;perRadius[r]=(perRadius[r]??0)+1;}}assert.ok(closer>90,`actual nearer relief at ${closer}/144 probes ${JSON.stringify(perRadius)}`);b.kit.dispose(bm);b.lib.dispose();assert.equal(disposed,1);a.kit.dispose(am);a.lib.dispose();}catch(e){close(a);close(b);throw e;}}});
