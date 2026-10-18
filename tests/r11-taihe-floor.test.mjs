import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {TAIHE_FLOOR as P,taiheFloorPixels,taiheFloorMaterial} from '../src/scene/palace/special/TaiheFloorMaterial.js';
import {captureTaiheControl,serialMesh,hash} from './lib/taihe-core-fixture.mjs';
const B=JSON.parse(fs.readFileSync(new URL('./fixtures/r11-floor-baseline.json',import.meta.url)));
test('deterministic square-brick illustration has bounded neutral pixels and no transparent holes',()=>{
 const a=taiheFloorPixels(),b=taiheFloorPixels();assert.deepEqual(a,b);
 assert.equal(createHash('sha256').update(a).digest('hex'),'2904216bbd11f82d713f99899c26bb6b8e5fff080a4ca6b19bbaa9b30caa3841');
 assert.equal(a.length,P.size*P.size*4);assert.equal(P.tileMetres/P.tiles,P.estimatedBrickMetres);
 for(let i=0;i<a.length;i+=4){assert.equal(a[i+3],255);assert.ok(a[i]>=39&&a[i]<=79);assert.ok(a[i]>=a[i+1]&&a[i+1]>=a[i+2]);}
 // Four straight, un-staggered horizontal and vertical joints.
 for(let k=0;k<4;k++){let c=k*128;assert.ok(a[(64*512+c)*4]>a[(64*512+c+8)*4]);assert.ok(a[(c*512+64)*4]>a[((c+8)*512+64)*4]);}
});
test('floor material uses explicit color space, bounded mip storage, caching and disposal',()=>{
 const owner={_own:new Map(),library:{anisotropy:16},ownMat(k,p){const m=new THREE.MeshStandardMaterial(p);this._own.set(k,m);return m;}};
 const m=taiheFloorMaterial(owner);assert.equal(taiheFloorMaterial(owner),m);assert.equal(owner._own.size,1);
 assert.equal(m.map.colorSpace,THREE.SRGBColorSpace);assert.equal(m.map.wrapS,THREE.RepeatWrapping);assert.equal(m.map.wrapT,THREE.RepeatWrapping);
 assert.equal(m.map.anisotropy,4);assert.equal(m.map.minFilter,THREE.LinearMipmapLinearFilter);assert.equal(m.normalMap,null);assert.equal(m.metalness,0);assert.equal(m.roughness,.32);
 let bytes=0;for(let size=P.size;size>=1;size/=2)bytes+=size*size*4;assert.equal(bytes,P.rgbaMipBytes);
 let n=0;m.map.addEventListener('dispose',()=>n++);m.dispose();m.dispose();assert.equal(n,1);
});
test('only Taihe floor UV and material change; all positions, nonfloor geometry and navigation remain exact',()=>{
 const{builder,group}=captureTaiheControl('太和殿'),rows=group.children.filter(o=>o.isMesh).map(o=>serialMesh(o)),b=B['太和殿'];
 assert.equal(rows.length,b.meshCount);assert.equal(hash(rows.filter((_,i)=>i!==b.floorIndex)),b.nonfloor);
 const r=rows[b.floorIndex],old=b.floor;assert.equal(r.material.name,P.cacheKey);assert.deepEqual(r.matrix,old.matrix);assert.equal(r.index,old.index);
 for(const k of Object.keys(r.attributes))if(k!=='uv')assert.deepEqual(r.attributes[k],old.attributes[k]);
 assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),b.navigation);
 const mesh=group.children.filter(o=>o.isMesh)[b.floorIndex],pos=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
 for(let i=0;i<uv.count;i++){assert.ok(Math.abs(uv.getX(i)-pos.getX(i)/P.tileMetres)<1e-6);assert.ok(Math.abs(uv.getY(i)-pos.getZ(i)/P.tileMetres)<1e-6);}
 assert.equal(mesh.receiveShadow,true);builder.dispose();
});
for(const name of ['保和殿','乾清宫'])test(`${name} retains exact floor, materials, geometry and navigation`,()=>{
 const{builder,group}=captureTaiheControl(name);assert.equal(hash(group.children.filter(o=>o.isMesh).map(o=>serialMesh(o))),B[name].geometry);assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),B[name].navigation);assert.ok(!builder._own.has(P.cacheKey));builder.dispose();
});
