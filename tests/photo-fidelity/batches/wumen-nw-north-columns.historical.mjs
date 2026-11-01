import {readR157FrozenParent} from '../../lib/r157-frozen-source-reader.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {captureGate} from '../../lib/gate-tower-fixture.mjs';
const bodyOf=g=>g.children.find(o=>o.userData.topY===7.5&&Math.abs(o.position.x-47.7)<1e-7&&Math.abs(o.position.z+6)<1e-7);
const columns=b=>b.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&Math.abs(m.position.z-5.5)<1e-7).sort((a,b)=>a.position.x-b.position.x);
test('Northwest north outer row independently reads six columns from official printed153, not generic four',()=>{const c=captureGate();assert.equal(columns(bodyOf(c.group)).length,6);});
import * as T from 'three';import {execFileSync} from 'node:child_process';import {meshFingerprint} from '../../lib/gate-tower-fixture.mjs';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';import {realTextureLibrary} from '../../lib/r48-real-texture-library.mjs';
import {refineWumenOuterSideColumns} from '../../../src/scene/palace/special/WumenOuterSideColumns.js';
import {refineWumenNorthwestNorthColumns as refine,WUMEN_NORTHWEST_PAVILION_ID as ID,WUMEN_NORTHWEST_NORTH_FIT as FIT} from '../../../src/scene/palace/special/WumenNorthwestColumns.js';
let source=readR157FrozenParent('0ab13818','src/scene/PalaceBuilder.js'),url=new URL('../../../src/scene/PalaceBuilder.js',import.meta.url);source=source.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {PalaceBuilder:Parent}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const before=lib=>{const b=new Parent(new T.Scene(),lib);let group;b.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));return{builder:b,group,body:bodyOf(group)};};
const withoutRow=(body,cols)=>{const g=new T.Group();for(const o of body.children)if(!cols.includes(o))g.add(o.clone());g.position.copy(body.position);return meshFingerprint(g);};

test('Against reviewed 0ab13818 only northwest north middle row changes; all other geometry/materials/physics exact',()=>{
 const c=captureGate(),old=before(c.lib);
 // Compose the independently pinned outward-row delta (separate d874222f test).
 refineWumenOuterSideColumns(old.builder,old.group);old.group.updateMatrixWorld(true);
 const body=bodyOf(c.group),a=columns(body),z=columns(old.body);
 assert.equal(z.length,4);assert.deepEqual(a.map(m=>m.position.x),FIT.xs);assert.deepEqual(c.builder.colliders,old.builder.colliders);assert.deepEqual(c.builder.walkables,old.builder.walkables);assert.equal(c.builder.wumenTopY,old.builder.wumenTopY);
 for(let i=0;i<c.group.children.length;i++)if(c.group.children[i]!==body)assert.equal(meshFingerprint(c.group.children[i]),meshFingerprint(old.group.children[i]),`root child ${i}`);
 assert.equal(withoutRow(body,a),withoutRow(old.body,z));assert.equal(meshFingerprint(a[0]),meshFingerprint(z[0]));assert.equal(meshFingerprint(a.at(-1)),meshFingerprint(z.at(-1)));
 const north=b=>Math.abs((b.min.z+b.max.z)/2-5.5)<1e-7;assert.deepEqual(body.userData.colliders.filter(b=>!north(b)),old.body.userData.colliders.filter(b=>!north(b)));
 const proxies=body.userData.colliders.filter(north);assert.equal(proxies.length,6);a.forEach((m,i)=>{assert.equal(m.geometry,a[0].geometry);assert.equal(m.material,a[0].material);const b=m.geometry.boundingBox.clone().translate(m.position);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);assert.deepEqual(proxies[i],b);});
});

test('Wrong instance, transformed/malformed source and repeated install do not mutate or dispose shared geometry',()=>{
 const c=captureGate(),old=before(c.lib),hash=meshFingerprint(old.body),data=JSON.stringify(old.body.userData);let disposed=0;columns(old.body)[0].geometry.addEventListener('dispose',()=>disposed++);
 for(const instanceId of[undefined,'INSTANCE-A-WUMEN-EAST-NORTH-PAVILION','INSTANCE-A-WUMEN-WEST-SOUTH-PAVILION'])assert.equal(refine(old.body,{instanceId}),false);
 assert.equal(meshFingerprint(old.body),hash);assert.equal(JSON.stringify(old.body.userData),data);
 old.body.position.x=-47.7;const transformed=meshFingerprint(old.body);assert.throws(()=>refine(old.body,{instanceId:ID}),/retained northwest/);assert.equal(meshFingerprint(old.body),transformed);old.body.position.x=47.7;
 columns(old.body)[1].position.x+=.1;const bad=meshFingerprint(old.body);assert.throws(()=>refine(old.body,{instanceId:ID}),/retained northwest/);assert.equal(meshFingerprint(old.body),bad);
 const active=bodyOf(c.group),sig=meshFingerprint(active);assert.equal(refine(active,{instanceId:ID}),false);assert.equal(meshFingerprint(active),sig);assert.equal(disposed,0);
});

test('Northwest column feet contact actual retained visible north platform triangles and source buffers remain valid',()=>{
 const c=captureGate(),body=bodyOf(c.group);c.group.updateMatrixWorld(true);
 for(const m of columns(body)){
  const g=m.geometry,p=m.getWorldPosition(new T.Vector3());g.computeBoundingBox();const y=g.boundingBox.min.y+p.y;assert.ok(Math.abs(y-12.3)<2e-7);
  for(const [dx,dz]of[[0,0],[.2,0],[-.2,0],[0,.2],[0,-.2]]){
   const hits=new T.Raycaster(new T.Vector3(p.x+dx,y+.02,p.z+dz),new T.Vector3(0,-1,0),0,.04).intersectObjects(c.group.children.filter(o=>o!==body),true);assert.ok(hits.some(h=>h.object.material.name==='stone_slab'&&Math.abs(h.point.y-y)<2e-6));
  }
  for(const a of Object.values(g.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));
 }
});

test('Actual production merge retains unique northwest own-source six-column record; resources dispose exactly once',()=>{
 captureGate();const lib=realTextureLibrary(),scene=new T.Scene(),b=new PalaceBuilder(scene,lib);b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));
 const records=scene.children[0].userData.architecture.filter(r=>r.id===ID);assert.equal(records.length,1);assert.equal(records[0].northColumnFit,FIT.revision);assert.deepEqual(records[0].northColumnXs,FIT.xs);assert.equal(records[0].wholeObjectAccepted,false);
 const gs=new Set(),counts=new Map();scene.traverse(m=>{if(m.isMesh)gs.add(m.geometry);});for(const g of gs){counts.set(g,0);g.addEventListener('dispose',()=>counts.set(g,counts.get(g)+1));}
 b.dispose();assert.ok([...counts.values()].every(n=>n===1));lib.dispose();
});
