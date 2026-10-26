import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';import {canCrossPalaceWater,southWaterProfile} from '../src/scene/palace/special/SouthWaterSystem.js';
const bytes=fs.readFileSync(new URL('./fixtures/r89/south-water-r88.js.txt',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'1df723ef5261d7a37447fb8566c089f16a7335c2e9e254a5d386b1fbb7440a83');
const origin=new URL('../src/scene/palace/special/SouthWaterSystem.js',import.meta.url),source=bytes.toString().replace(/from ['"](\.[^'"]+)['"]/g,(_match,path)=>'from '+JSON.stringify(new URL(path,origin).href));
const resolvedSource=source.replace("from 'three'", 'from '+JSON.stringify(import.meta.resolve('three')));
const old=await import('data:text/javascript;base64,'+Buffer.from(resolvedSource).toString('base64'));
const river=PALACE_LAYOUT.find(p=>p.type==='river'&&p.southWaterProfile),profile=southWaterProfile(river),poly=profile.waterPolygons[0];

test('far northern movement reuses conservative bounds without rescanning polygon vertices',()=>{
 canCrossPalaceWater(river,{x:0,z:400},.36);let reads=0;const descriptors=[];
 try{for(const point of poly)for(const key of['x','z']){const descriptor=Object.getOwnPropertyDescriptor(point,key);descriptors.push([point,key,descriptor]);Object.defineProperty(point,key,{configurable:true,enumerable:true,get(){reads++;return descriptor.value;}});}
  for(let i=0;i<108;i++)assert.equal(canCrossPalaceWater(river,{x:i-54,z:400},.36),true);
  assert.equal(reads,0,'cached bounds must reject far-away NPC footprints before any narrow-phase polygon traversal');
 }finally{for(const[point,key,descriptor]of descriptors)Object.defineProperty(point,key,descriptor);}
});

test('optimized water decisions equal the frozen R88 narrow phase at banks, AABB borders, bridge edges and random footprints',()=>{
 const bounds={minX:Math.min(...poly.map(p=>p.x)),maxX:Math.max(...poly.map(p=>p.x)),minZ:Math.min(...poly.map(p=>p.z)),maxZ:Math.max(...poly.map(p=>p.z))};let count=0;
 const check=(x,z,r)=>{assert.equal(canCrossPalaceWater(river,{x,z},r),old.canCrossPalaceWater(river,{x,z},r),JSON.stringify({x,z,r}));count++;};
 for(const r of[0,.3,.36,.5,1,10]){
  for(const e of[-1e-7,0,1e-7])for(const x of[bounds.minX-r+e,bounds.maxX+r+e])for(const z of[bounds.minZ-r+e,bounds.maxZ+r+e,(bounds.minZ+bounds.maxZ)/2])check(x,z,r);
  for(let i=0;i<poly.length;i+=19)for(const e of[-1e-7,0,1e-7])check(poly[i].x+r+e,poly[i].z,r);
  for(const b of profile.bridges)for(const side of[-1,0,1])for(const e of[-1e-7,0,1e-7])check(b.x+side*(b.width/2-r)+e,b.z,r);
 }
 let seed=89;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let i=0;i<1000;i++)check(-400+rand()*800,-470+rand()*1000,[.3,.36,.5][i%3]);assert.ok(count>2000);
 for(const bad of[-1,NaN,Infinity])assert.throws(()=>canCrossPalaceWater(river,{x:0,z:400},bad));
});
