import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {captureZhongheApproaches} from './lib/zhonghe-approach-route.mjs';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {buildZhongheImperialApproach,ZHONGHE_IMPERIAL_APPROACH as P} from '../src/scene/palace/ZhongheImperialApproach.js';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {restorePreZhongheApproaches,withLegacyZhongheApproaches} from './lib/r8-zhonghe-retention.mjs';
import routeDelta from './fixtures/r8-zhonghe-route-delta.json' with {type:'json'};
const W=await buildWorld();

test('only two central ramps disappear; official north/south stones have no walking surface',()=>{
 const p=captureZhongheApproaches();assert.equal(P.currentVisitorAccess,'UNKNOWN');
 for(const {stone:s} of Object.values(p)){
  assert.equal(s.y0,8);assert.equal(s.y1,8.6);assert.equal(s.width,4.6);
  assert.equal(W.cm.walkables.filter(r=>r.type==='ramp'&&r.axis==='z'&&r.a0===s.zEdge&&r.minX<0&&r.maxX>0).length,0);
  assert.equal(W.cm.walkables.filter(r=>r.type==='ramp'&&r.axis==='z'&&r.a0===s.zEdge&&r.y0===s.y1).length,2);
  const r=walkStraight(W,[0,s.zEdge+s.dir*2],[0,s.zEdge-s.dir*.7],{feet0:8,step:.04});
  assert.ok(r.reached<r.total-1,JSON.stringify(r));assert.equal(r.feet,8);
 }
});

for(const side of [-1,1])for(const step of [.04,.4])test(`four real side flights ascend/descend with box rescue disabled ${side}/${step}`,()=>{
 const saved=W.cm.walkables;W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);
 try{for(const {points} of Object.values(captureZhongheApproaches(side))){
  let feet=8;const pts=[...points,...points.slice(0,-1).reverse()];let max=feet;
  for(let i=1;i<pts.length;i++){const r=walkStraight(W,pts[i-1],pts[i],{feet0:feet,step});assert.ok(r.total-r.reached<=.051,JSON.stringify({i,r}));feet=r.feet;max=Math.max(max,feet);}
  assert.equal(max,8.6);assert.equal(feet,8);
 }}finally{W.cm.walkables=saved;}
});

for(const dir of [-1,1])test(`stone is closed, nondegenerate and reuses materials ${dir}`,()=>{
 const mats=new Map(),lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
 const b=new PalaceBuilder(new THREE.Scene(),lib),g=new THREE.Group();
 buildZhongheImperialApproach(b,g,{zEdge:51,dir,y0:8,y1:8.6,run:.96,width:4.6});
 assert.equal(b.walkables.length,0);assert.equal(b.colliders.length,16);assert.deepEqual([...mats.keys()].sort(),['marble','yulu']);
 let triangles=0;
 for(const m of g.children){const geo=m.geometry,p=geo.attributes.position,idx=geo.index,edges=new Map();triangles+=(idx?.count??p.count)/3;let volume=0;
  for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j));
   assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()>1e-8);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;
   for(let j=0;j<3;j++){const k=[v[j],v[(j+1)%3]].map(v=>v.toArray().map(q=>Math.round(q*1e5)).join(',')).sort().join('|');edges.set(k,(edges.get(k)??0)+1);}}
  assert.ok(volume>0);assert.ok([...edges.values()].every(n=>n===2));
 }
 assert.equal(triangles,44,'fewer than the previous 72 triangles per approach');
});

test('only exact two current routes and four integration hunks can be version normalized',()=>{
 const bytes=fs.readFileSync(new URL('../src/scene/PalaceBuilder.js',import.meta.url));
 assert.ok(restorePreZhongheApproaches('src/scene/PalaceBuilder.js',bytes).length<bytes.length);
 assert.throws(()=>restorePreZhongheApproaches('src/scene/PalaceBuilder.js',Buffer.concat([bytes,Buffer.from('\n')])));
 const current=execFileSync(process.execPath,['tests/stepwalk.cjs','60,10','0,1','all'],{env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const i=line.indexOf('[[');return{name:line.slice(0,i).trim(),pts:JSON.parse(line.slice(i))};});
 assert.equal(current.length,33);assert.equal(routeDelta.delta.length,2);
 for(const d of routeDelta.delta){assert.deepEqual(current.find(r=>r.name===d.after.name),d.after);assert.deepEqual(withLegacyZhongheApproaches([d.after]),[d.before]);assert.throws(()=>withLegacyZhongheApproaches([{...d.after,pts:d.after.pts.slice(1)}]));}
});

for(const fps of [60,10])for(const speed of [5,12])for(const reverse of [false,true])test(`updated through-hall and approach routes retain physical traversal ${fps}/${speed}/${reverse}`,()=>{
 const saved=W.cm.walkables;W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);
 try{for(const {after:r} of routeDelta.delta){
  const pts=reverse?r.pts.toReversed():r.pts,start=pts[0];
  let feet=W.cm.getGroundHeight(...start,0,999),p=new THREE.Vector3(start[0],feet+1.7,start[1]);
  assert.equal(W.cm.checkCollision(p,.5),false);
  for(const [x,z]of pts.slice(1)){let n=0;const max=Math.ceil(Math.hypot(x-p.x,z-p.z)/(speed/fps))+8;
   while(Math.hypot(x-p.x,z-p.z)>1e-7&&n++<max){const dist=Math.hypot(x-p.x,z-p.z),step=Math.min(speed/fps,dist);
    const next=W.cm.getValidPosition(p,new THREE.Vector3(p.x+(x-p.x)*step/dist,p.y,p.z+(z-p.z)*step/dist),.5,p.y-1.7);
    assert.equal(W.cm.checkCollision(next,.5),false);assert.ok(next.y-1.7>=7.99);p=next;
   }
   assert.ok(Math.hypot(x-p.x,z-p.z)<1e-5,JSON.stringify({route:r.name,target:[x,z],at:p.toArray()}));
  }
 }}finally{W.cm.walkables=saved;}
});
