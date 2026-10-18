import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import { TAIHE_CORE as P, TAIHE_FALLBACK_OWNER } from '../../src/scene/palace/special/TaiheCoreProfile.js';
import { taiheGlyphMaterial } from '../../src/scene/palace/special/TaiheCore.js';
import { captureTaiheControl as capture, hash, serialMesh } from '../lib/taihe-core-fixture.mjs';
import rearDelta from '../fixtures/r9-rear-enclosure-mesh-delta.json' with {type:'json'};
const baseline=JSON.parse(fs.readFileSync(new URL('../../docs/current-state/taihe-v16-core/geometry-baseline.json',import.meta.url)));
const c=capture('太和殿');
const tris=o=>(o.geometry.index?.count??o.geometry.attributes.position.count)/3;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
for(const [name,b]of Object.entries(baseline.otherHalls))test(`Taihe correction leaves ${name} geometry, materials and navigation byte-exact`,()=>{
 const v=capture(name),rows=[];v.group.traverse(o=>{if(o.isMesh)rows.push(serialMesh(o));});assert.equal(hash(rows),b.geometry);assert.equal(hash({colliders:v.builder.colliders,walkables:v.builder.walkables}),b.physics);
});
test('approved card bytes, inferred rows and dimension-precision limits remain explicit',()=>{
 const bytes=fs.readFileSync(new URL('../../docs/current-state/taihe-v16-core/approved-geometry-card.json',import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),P.approvalCardSHA256);
 assert.deepEqual(P.columns.x,[-4.233,4.233]);assert.deepEqual(P.columns.goldZ,[-5.5868,5.6019,13.0647]);near(P.columns.x[1]-P.columns.x[0],8.466);
 assert.deepEqual(P.columns.publishedDiameterRange,[1,1.06]);assert.match(P.dais.registration,/historical/);assert.match(P.screen.registration,/conflicts/);assert.match(P.caisson.interpretation,/diagonal/);
});
test('all 108 historical Taihe meshes remain exact after the finite nine-to-four rear enclosure replacement',()=>{
 const protectedMeshes=[],regilded=[];
 c.group.traverse(o=>{if(!o.isMesh||o.userData.taiheCoreOwner===TAIHE_FALLBACK_OWNER||o.userData.taihePermanent)return;
 const p=o.position;if(o.geometry.type==='CylinderGeometry'&&Math.abs(Math.abs(p.x)-63/11*1.5)<1e-7&&p.z>0&&Math.abs(p.z)<18){assert.equal(o.material.name,'wood_column');regilded.push(serialMesh(o,{material:false}));return;}protectedMeshes.push(hash(serialMesh(o)));});
 assert.equal(rearDelta.before.length,9);assert.equal(rearDelta.after.length,4);
 for(const h of rearDelta.after){const i=protectedMeshes.indexOf(h);assert.ok(i>=0,'exact current enclosure mesh required');protectedMeshes.splice(i,1);}
 protectedMeshes.push(...rearDelta.before);
 assert.deepEqual(protectedMeshes.sort(),baseline.taihe.protectedMeshes);assert.deepEqual(regilded,baseline.taihe.regildedColumns);
});
test('fallback retains its original 1600-triangle cap; permanent geometry separately counts60 beam and280 coffer triangles',()=>{
 const fallback=c.group.children.filter(o=>o.userData.taiheCoreOwner===TAIHE_FALLBACK_OWNER),permanent=c.group.children.filter(o=>o.userData.taihePermanent);
 assert.equal(fallback.length,8);assert.equal(new Set(fallback.map(o=>o.material)).size,8);
 assert.equal(fallback.reduce((n,o)=>n+tris(o),0),1600);assert.ok(1600<=P.budgets.fallbackVisibleTriangles);
 const coffer=permanent.filter(o=>o.userData.taihePermanent==='coffer-frame').reduce((n,o)=>n+tris(o),0);assert.equal(coffer,280);
 const additions=permanent.reduce((n,o)=>n+tris(o),0);assert.equal(additions,460);const historical=additions-coffer;assert.equal(historical,180);assert.equal(permanent.filter(o=>o.userData.taihePermanent==='central-beam').reduce((n,o)=>n+tris(o),0),60);assert.equal(1078+historical-(1380+336+2),-460);assert.equal(1600+historical-(1380+336+2),62);
 // Never subtract unloaded S triangles from the original external view budget.
 assert.ok(Math.abs(-74)-P.frame.depth/2>15);assert.equal(P.budgets.originalFrontTriangles,874189);assert.equal(P.budgets.originalFrontRatioCeiling,1.1);
});
test('true ceiling opening and every fallback caisson triangle fit below the unchanged roof',()=>{
 const f=P.frame.floorY,roof=c.group.children.find(o=>o.name==='roof_wudian');
 for(const x of [-2.8,0,2.8])for(const z of [P.caisson.z-2.8,P.caisson.z,P.caisson.z+2.8]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,f+P.ceilingY-.01,z),new THREE.Vector3(0,1,0));
  const ceilings=c.group.children.filter(o=>o.userData.taihePermanent==='ceiling');assert.equal(ray.intersectObjects(ceilings,true).length,0);
  const hit=ray.intersectObject(roof,true)[0];assert.ok(hit);assert.ok(hit.point.y-f-P.caisson.topY>.0499);
 }
 for(const o of c.group.children.filter(o=>o.userData.taiheCoreOwner===TAIHE_FALLBACK_OWNER)){const b=new THREE.Box3().setFromObject(o);assert.ok(b.max.y<=f+P.caisson.topY+.0001);}
});
test('column bases and source-maximal radius stay outside platform, rails and side routes',()=>{
 const platformMax=P.dais.width/2+.02,railMax=P.dais.width/2-.12+.03;
 assert.ok(P.columns.x[1]-P.columns.baseRadius-platformMax>.03);assert.ok(P.columns.x[1]-P.columns.baseRadius-railMax>.1);
 assert.ok(P.columns.baseRadius>=P.columns.clearanceRadius);assert.ok(6.2-.5-(P.columns.x[1]+P.columns.baseRadius)>.8);
});
test('native lettering atlas draws every restored glyph, correct plaque order and correct viewer-side couplets',()=>{
 const calls=[],ctx=new Proxy({fillText:(ch,x,y)=>calls.push({ch,x,y})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),saved=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0})};try{const m=taiheGlyphMaterial();m.map.dispose();m.dispose();}finally{globalThis.document=saved;}
 assert.equal(calls.slice(0,4).map(x=>x.ch).join(''),'猷绥极建');assert.equal(calls.filter(x=>x.x===40).map(x=>x.ch).join(''),P.couplets.viewerRightText);assert.equal(calls.filter(x=>x.x===120).map(x=>x.ch).join(''),P.couplets.viewerLeftText);
 for(const glyph of ['艰','遹','猷'])assert.ok(calls.some(x=>x.ch===glyph));assert.equal(P.couplets.viewerRightX,-4.233);
});
