import test from 'node:test';
import assert from 'node:assert/strict';
import {createOriginalRelief,reliefDepth} from '../../src/scene/palace/special/OriginalBuddhaRelief.js';
const grid={columns:33,rows:49,alpha:new Uint8Array(33*49).fill(255),imageWidth:1024,imageHeight:1536};
test('rear cross section curves continuously instead of retaining an interior plateau',()=>{
 const r=createOriginalRelief(grid),p=r.mesh.geometry.attributes.position,n=p.count/2;
 const values=[];for(let i=0;i<n;i++)if(Math.abs(p.getY(i)-1.125)<1e-6&&p.getX(i)>=0&&p.getX(i)<=.5)values.push([p.getX(i),p.getZ(i+n)]);
 values.sort((a,b)=>a[0]-b[0]);
 assert.ok(new Set(values.map(v=>v[1].toFixed(6))).size>8,'interior rear still planar');r.dispose();
});
test('front, thin silhouette, fit envelope, UV and closed topology stay intact',()=>{
 const r=createOriginalRelief(grid),g=r.mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,n=p.count/2;
 for(let i=0;i<n;i++){
  const u=uv.getX(i),v=1-uv.getY(i),z=p.getZ(i),back=p.getZ(i+n);
  assert.ok(Math.abs(z-reliefDepth(u,v))<1e-6);assert.ok(back>=-.130001&&back<=z-.019999);
  assert.equal(p.getX(i),p.getX(i+n));assert.equal(p.getY(i),p.getY(i+n));
  if(u===0||u===1||v===0||v===1)assert.ok(Math.abs(z-back-.02)<1e-6);
 }
 const edges=new Map(),a=g.index.array;for(let i=0;i<a.length;i+=3)for(const [x,y]of[[a[i],a[i+1]],[a[i+1],a[i+2]],[a[i+2],a[i]]]){const k=x<y?`${x}:${y}`:`${y}:${x}`;edges.set(k,(edges.get(k)||0)+1);}
 assert.ok([...edges.values()].every(n=>n===2));assert.equal(r.meta.defaultProductReplacement,false);assert.equal(r.collisionProxy.activeInProduct,false);r.dispose();r.dispose();
});

import fs from 'node:fs';
import {createOriginalRelief as baseline} from './baseline-relief.mjs';
for(const id of ['shakyamuni','amitabha','bhaisajyaguru'])test(`real ${id} mask preserves front, topology, UV and bounded rear`,()=>{
 const raw=JSON.parse(fs.readFileSync(new URL(`../../public/textures/dafotang-original/${id}-refined-alpha-grid-v2.json`,import.meta.url)));raw.alpha=Uint8Array.from(raw.alpha);
 const before=baseline(raw),after=createOriginalRelief(raw),a=before.mesh.geometry,b=after.mesh.geometry,n=a.attributes.position.count/2;
 assert.deepEqual(b.index.array,a.index.array);assert.deepEqual(b.attributes.uv.array,a.attributes.uv.array);assert.deepEqual(b.groups,a.groups);
 assert.deepEqual(b.attributes.position.array.slice(0,n*3),a.attributes.position.array.slice(0,n*3));
 assert.deepEqual(b.attributes.normal.array.slice(0,n*3),a.attributes.normal.array.slice(0,n*3));
 let changed=0;for(let i=0;i<n;i++){const old=a.attributes.position,newp=b.attributes.position;
  assert.equal(newp.getX(i+n),old.getX(i+n));assert.equal(newp.getY(i+n),old.getY(i+n));
  assert.ok(newp.getZ(i+n)>=-.130001&&newp.getZ(i+n)<=newp.getZ(i)-.019999);
  if(Math.abs(old.getZ(i)-old.getZ(i+n)-.02)<1e-6)assert.equal(newp.getZ(i+n),old.getZ(i+n));
  if(Math.abs(newp.getZ(i+n)-old.getZ(i+n))>1e-5)changed++;
 }
 assert.ok(changed>n*.5);assert.deepEqual(after.collisionProxy,before.collisionProxy);before.dispose();after.dispose();
});
for(const [id,lastRow]of [['shakyamuni',124],['amitabha',116],['bhaisajyaguru',108]])test(`truncated ${id} rear remains smooth at cut boundary`,()=>{
 const raw=JSON.parse(fs.readFileSync(new URL(`../../public/textures/dafotang-original/${id}-refined-alpha-grid-v2.json`,import.meta.url)));raw.alpha=Uint8Array.from(raw.alpha);raw.alpha.fill(0,(lastRow+1)*raw.columns);
 const r=createOriginalRelief(raw),p=r.mesh.geometry.attributes.position,n=p.count/2;const rows=new Map();let max=0;
 for(let i=0;i<n;i++){const x=p.getX(i).toFixed(6),arr=rows.get(x)||[];arr.push([p.getY(i),p.getZ(i+n)]);rows.set(x,arr);}
 for(const arr of rows.values()){arr.sort((a,b)=>a[0]-b[0]);for(let j=1;j<arr.length;j++){const dy=arr[j][0]-arr[j-1][0];if(dy<.012)max=Math.max(max,Math.abs(arr[j][1]-arr[j-1][1]));}}
 assert.ok(max<.06,`rear adjacent step ${max} exceeds 6cm`);r.dispose();
});
