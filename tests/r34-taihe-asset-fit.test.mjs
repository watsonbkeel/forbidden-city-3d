import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {validateTaiheCore} from '../src/scene/interior/TaiheCoreContract.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url)),cfg=JSON.parse(read('data/interiors/taihe.json'));
const base=read('public/models/interiors/taihe-hanging-fit-b032ccb094e0.glb'),bytes=read('public'+cfg.model);
const decode=async b=>{const r=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;r.updateMatrixWorld(true);return r;};
const meshes=r=>{const out=[];r.traverse(o=>{if(o.isMesh)out.push(o);});return out;};
const selected=(x,y,z)=>Math.abs(x)<3.64&&y<7&&z>0;
test('R34 asset translates every display vertex only, preserving all other geometry, normal, UV and index values',async()=>{
 const a=meshes(await decode(base)),b=meshes(await decode(bytes));let changed=0;
 for(let k=0;k<a.length;k++) {assert.equal(a[k].material.name,b[k].material.name);assert.deepEqual(a[k].geometry.index.array,b[k].geometry.index.array);
 const p=a[k].geometry.attributes.position,q=b[k].geometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(a[k].matrixWorld),y=new T.Vector3().fromBufferAttribute(q,i).applyMatrix4(b[k].matrixWorld),dz=selected(x.x,x.y,x.z)?-2:0;assert.equal(y.x,x.x);assert.equal(y.y,x.y);assert.ok(Math.abs(y.z-x.z-dz)<1e-5,`vertex ${k}/${i} must follow its ensemble`);if(dz)changed++;}
 for(const key of Object.keys(a[k].geometry.attributes).filter(x=>x!=='position'))assert.deepEqual(b[k].geometry.attributes[key].array,a[k].geometry.attributes[key].array);
 }assert.ok(changed>1000);assert.equal(changed,cfg.asset.spatialFitChangedVertices);
});
test('R34 decoded display, native profile and manifest share an enforced identity',async()=>{
 const r=await decode(bytes),c=r.getObjectByName('TAIHE_CORE_CONTRACT').userData;
 assert.equal(c.spatialFitId,'r34-taihe-display-grid-fit');assert.equal(c.spatialFitDeltaZ,-2);
 assert.equal(c.spatialFitBaseAssetSHA256,createHash('sha256').update(base).digest('hex'));
 assert.equal(c.profileSHA256,createHash('sha256').update(read('data/architecture/taihe-core.json')).digest('hex'));
 assert.deepEqual(validateTaiheCore(r,cfg),{triangles:17924,meshes:8});
 const inventory=JSON.parse(c.inventory);assert.ok(Math.abs(inventory.find(v=>v.name==='dais_lower').min[2]-5.06)<1e-5);
 c.spatialFitDeltaZ=-1;assert.throws(()=>validateTaiheCore(r,cfg),/spatial fit identity mismatch/);
});

test('rollback R33 asset cannot silently install under the R34 current manifest',async()=>{
 const old=await decode(base);assert.throws(()=>validateTaiheCore(old,cfg),/revision mismatch/);
});
