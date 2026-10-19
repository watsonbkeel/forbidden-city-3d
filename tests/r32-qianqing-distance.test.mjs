import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {registerHooks} from 'node:module';
registerHooks({load(u,c,n){if(u.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(u),'utf8'),shortCircuit:true};return n(u,c)}});
const T=await import('three'),{PalaceBuilder}=await import('../src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await import('../src/scene/Layout.js'),{library}=await import('./lib/inner-palace-fixture.mjs');
const {BatchedBuilder}=await import('../src/render/BatchedBuilder.js');
const {QIANQING_DISPLAY,buildQianqingDisplayFar}=await import('../src/scene/palace/QianqingDisplay.js');
const old=JSON.parse(fs.readFileSync(new URL('./fixtures/r32-qianqing-near-before-lod.json',import.meta.url)));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const names=['qianqing-permanent-display','qianqing-panelled-ceiling-r32'];
const triangles=o=>{let n=0;o.traverse(m=>{if(m.isMesh)n+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3});return n};
function fixture(){const scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);return {scene,b,lods:names.map(n=>scene.getObjectByName(n))};}
function rows(root){const out=[];root.traverse(m=>{if(!m.isMesh)return;out.push({material:m.material.name,matrix:m.matrixWorld.toArray(),attrs:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{size:a.itemSize,sha:sha(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}])),index:m.geometry.index?[...m.geometry.index.array]:null,tris:(m.geometry.index?.count??m.geometry.attributes.position.count)/3})});return out.sort((a,b)=>a.material.localeCompare(b.material));}
test('near visible attributes, world transforms and all permanent navigation are identical to the frozen pre-LOD candidate',()=>{
 const f=fixture();try{for(const o of f.lods){assert.ok(o.isLOD);assert.equal(o.levels.length,2);assert.deepEqual(rows(o.levels[0].object),old[o.name]);assert.equal(o.levels[0].object.visible,true);assert.equal(o.levels[1].object.visible,false);}
 assert.equal(sha(JSON.stringify({c:f.b.colliders,w:f.b.walkables})),old.navigation);}finally{f.b.dispose();}
});
test('distant displays retain six separated forms and open supports within unchanged collision bounds',()=>{
 const f=fixture();try{const raw=buildQianqingDisplayFar(f.b);raw.updateMatrixWorld(true);assert.equal(raw.userData.displayObjects,6);assert.equal(triangles(raw),664);assert.ok(triangles(raw)<=QIANQING_DISPLAY.maxFarTriangles);
 for(const x of QIANQING_DISPLAY.vesselCentres){const ray=new T.Raycaster(new T.Vector3(x,1.2,2.5),new T.Vector3(0,0,1),0,2);assert.equal(ray.intersectObject(raw,true).length,0);const body=new T.Raycaster(new T.Vector3(x,2.04,2.5),new T.Vector3(0,0,1),0,2);assert.ok(body.intersectObject(raw,true).length>0);}
 const v=new T.Vector3();raw.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(Math.abs(v.x)>4.1){assert.ok(Math.abs(Math.abs(v.x)-5.2)<=.500001);assert.ok(Math.abs(v.z-.2)<=.500001);assert.ok(v.y>=-1e-6&&v.y<=1.600001);}}});raw.traverse(m=>m.geometry?.dispose());}finally{f.b.dispose();}
});
test('90m switch has a stable 10% return band and does not affect actual walking cameras',()=>{
 const f=fixture();try{const cam=new T.PerspectiveCamera();for(const lod of f.lods){const p=new T.Vector3();lod.getWorldPosition(p);for(const[d,expected]of[[20,0],[89,0],[91,1],[85,1],[80,0]]){cam.position.copy(p).add(new T.Vector3(0,0,d));cam.updateMatrixWorld(true);lod.update(cam);assert.equal(lod.getCurrentLevel(),expected);assert.equal(lod.levels.filter(l=>l.object.visible).length,1);}}
 assert.equal(triangles(f.lods[0].levels[0].object),2912);assert.equal(triangles(f.lods[0].levels[1].object),664);assert.equal(triangles(f.lods[1].levels[0].object),446);assert.equal(triangles(f.lods[1].levels[1].object),2);
 }finally{f.b.dispose();}
});
test('real batching retains selected-level visibility, material ownership and exact once-only disposal across switches',()=>{
 const f=fixture(),batch=new BatchedBuilder(f.scene),cam=new T.PerspectiveCamera(),geos=new Map(),mats=new Map();try{
 for(const lod of f.lods){lod.traverse(m=>{if(!m.isMesh)return;if(!geos.has(m.geometry)){geos.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>geos.set(m.geometry,geos.get(m.geometry)+1));}if(!mats.has(m.material)){mats.set(m.material,0);m.material.addEventListener('dispose',()=>mats.set(m.material,mats.get(m.material)+1));}});const near=new Set();lod.levels[0].object.traverse(m=>{if(m.material)near.add(m.material)});lod.levels[1].object.traverse(m=>{if(m.material)assert.ok(near.has(m.material));});}
 for(const z of[-74,317,195.3,316.8]){cam.position.set(0,3,z);cam.updateMatrixWorld(true);for(const lod of f.lods)lod.update(cam);batch.begin();for(const {entries,batch:b}of batch.batches)for(const entry of entries){let level=null;for(const lod of f.lods)for(const l of lod.levels)if(l.object.children.includes(entry.mesh))level=l;if(level)assert.equal(b.getVisibleAt(entry.id),level.object.visible);}batch.end();}
 assert.ok([...geos.values()].every(n=>n===0));}finally{batch.dispose();f.b.dispose();}assert.ok([...geos.values()].every(n=>n===1));assert.ok([...mats.values()].every(n=>n===1));
});
