import {readR157FrozenParent} from '../../lib/r157-frozen-source-reader.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {captureGate} from '../../lib/gate-tower-fixture.mjs';
const bodies=g=>g.children.filter(o=>o.userData.topY===7.5&&Math.abs(Math.abs(o.position.x)-47.7)<1e-7);
const row=b=>b.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&Math.abs(m.position.x-(b.position.x<0?-5.5:5.5))<1e-7).sort((a,b)=>b.position.z-a.position.z);
test('Each own-source outward pavilion side has six columns, not just the two generic end corners',()=>{const c=captureGate(),all=bodies(c.group);assert.equal(all.length,4);for(const b of all)assert.equal(row(b).length,6,b.userData.structure.id);});
import * as T from 'three';import {execFileSync} from 'node:child_process';import {meshFingerprint} from '../../lib/gate-tower-fixture.mjs';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';import {realTextureLibrary} from '../../lib/r48-real-texture-library.mjs';
import {refineWumenOuterSideColumns as refine,refineWumenPavilionOuterSideColumns as one,WUMEN_OUTER_SIDE_FITS as FITS} from '../../../src/scene/palace/special/WumenOuterSideColumns.js';
let code=readR157FrozenParent('d874222f','src/scene/PalaceBuilder.js'),url=new URL('../../../src/scene/PalaceBuilder.js',import.meta.url);code=code.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const{PalaceBuilder:Parent}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const before=lib=>{const b=new Parent(new T.Scene(),lib);let group;b.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));return{builder:b,group};};
const get=(g,f)=>g.children.find(o=>o.userData.topY===7.5&&Math.abs(o.position.x-f.x)<1e-7&&Math.abs(o.position.z-f.z)<1e-7);

test('Against reviewed d874222f all existing mesh objects, corner proxies, roofs, inner faces and runtime physics remain exact',()=>{
 const c=captureGate(),old=before(c.lib),targets=bodies(c.group);assert.deepEqual(c.builder.colliders,old.builder.colliders);assert.deepEqual(c.builder.walkables,old.builder.walkables);assert.equal(c.builder.wumenTopY,old.builder.wumenTopY);assert.equal(c.group.children.length,old.group.children.length);
 for(let i=0;i<c.group.children.length;i++)if(!targets.includes(c.group.children[i]))assert.equal(meshFingerprint(c.group.children[i]),meshFingerprint(old.group.children[i]),`unscoped root child ${i}`);
 for(const f of FITS){const active=get(c.group,f),prior=get(old.group,f),cols=row(active),oldCols=row(prior);assert.equal(oldCols.length,2);assert.equal(active.children.length,prior.children.length+4);assert.deepEqual(cols.map(m=>m.position.z),f.zs);
  prior.children.forEach((m,i)=>assert.equal(meshFingerprint(active.children[i]),meshFingerprint(m),`${f.id} original child ${i}`));
  assert.deepEqual(active.userData.colliders.slice(0,prior.userData.colliders.length),prior.userData.colliders);assert.equal(active.userData.colliders.length,prior.userData.colliders.length+4);
  assert.equal(meshFingerprint(cols[0]),meshFingerprint(oldCols[0]));assert.equal(meshFingerprint(cols.at(-1)),meshFingerprint(oldCols.at(-1)));
  for(const [i,m]of cols.slice(1,-1).entries()){assert.equal(m.geometry,cols[0].geometry);assert.equal(m.material,cols[0].material);const b=m.geometry.boundingBox.clone().translate(m.position);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);assert.deepEqual(active.userData.colliders[prior.userData.colliders.length+i],b);}
 }
});

test('All-four host install preflights atomically; wrong host/instance, malformed last body and repeated install allocate nothing',()=>{
 const c=captureGate(),old=before(c.lib),a=get(old.group,FITS[3]);row(a)[0].position.z+=.1;const hash=meshFingerprint(old.group),lengths=bodies(old.group).map(b=>b.children.length);
 assert.throws(()=>refine(old.builder,old.group),/retained outward/);assert.equal(meshFingerprint(old.group),hash);assert.deepEqual(bodies(old.group).map(b=>b.children.length),lengths);
 assert.equal(refine({...old.builder,oz:0},old.group),false);assert.equal(one(a,{instanceId:'wrong'}),false);assert.throws(()=>one(a,{instanceId:FITS[0].id}),/retained outward/);assert.equal(meshFingerprint(old.group),hash);
 const done=meshFingerprint(c.group);assert.equal(refine(c.builder,c.group),false);assert.equal(meshFingerprint(c.group),done);for(const f of FITS)assert.equal(one(get(c.group,f),{instanceId:f.id}),false);
});

test('All sixteen added outward columns have actual visible deck contact and finite shared source attributes',()=>{
 const c=captureGate();c.group.updateMatrixWorld(true);for(const f of FITS){const body=get(c.group,f);for(const m of row(body).slice(1,-1)){
  const g=m.geometry,p=m.getWorldPosition(new T.Vector3());g.computeBoundingBox();const y=g.boundingBox.min.y+p.y;assert.ok(Math.abs(y-12.3)<2e-7);
  for(const[dx,dz]of[[0,0],[.2,0],[-.2,0],[0,.2],[0,-.2]]){const hits=new T.Raycaster(new T.Vector3(p.x+dx,y+.02,p.z+dz),new T.Vector3(0,-1,0),0,.04).intersectObjects(c.group.children.filter(o=>o!==body),true);assert.ok(hits.some(h=>h.object.material.name==='stone_slab'&&Math.abs(h.point.y-y)<2e-6));}
  for(const a of Object.values(g.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));
 }}
});

test('Production merge retains four distinct own-source outward-row records; shared resources survive replacement and dispose once',()=>{
 const c=captureGate(),old=before(c.lib),gs=new Set();old.group.traverse(o=>{if(o.geometry)gs.add(o.geometry);});let premature=0;for(const g of gs)g.addEventListener('dispose',()=>premature++);refine(old.builder,old.group);assert.equal(premature,0);
 const lib=realTextureLibrary(),scene=new T.Scene(),b=new PalaceBuilder(scene,lib);b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));const records=scene.children[0].userData.architecture;
 for(const f of FITS){const matched=records.filter(r=>r.id===f.id);assert.equal(matched.length,1);assert.deepEqual(matched[0].outerSideFit.pixelYs,f.pixelYs);assert.equal(matched[0].outerSideFit.columnCount,6);assert.equal(matched[0].wholeObjectAccepted,false);}
 const counts=new Map();scene.traverse(o=>{if(o.geometry&&!counts.has(o.geometry)){counts.set(o.geometry,0);o.geometry.addEventListener('dispose',()=>counts.set(o.geometry,counts.get(o.geometry)+1));}});b.dispose();assert.ok([...counts.values()].every(n=>n===1));lib.dispose();
});
