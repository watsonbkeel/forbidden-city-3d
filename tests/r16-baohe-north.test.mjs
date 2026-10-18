import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {traceTerraceGround,replayTerrace} from './lib/terrace-walk.mjs';
import {BAOHE_NORTH_APPROACHES as P,baoheNorthTier,buildBaoheNorthTier,createBaoheNorthDetail,installBaoheNorthDetail} from '../src/scene/palace/BaoheNorthApproaches.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
const W=await buildWorld(),tiers=W.baoheNorthTiers,flights=tiers.flatMap(t=>t.flights),profile={flights};
const near=(a,b,epsilon=1e-6)=>assert.ok(Math.abs(a-b)<epsilon,`${a} != ${b}`);
const pathFor=(kind,side)=>{const rows=tiers.map(t=>t.flights.find(f=>f.kind===kind&&f.side===side));const x=(rows[0].minX+rows[0].maxX)/2;return [[x,rows[0].zToe+1.4],...rows.flatMap((f,i)=>[[x,f.zToe],[x,f.zEdge],[x,f.zEdge-(i===rows.length-1?2:.65)]])];};

test('published exposed bottom stone and three grouped approaches remain distinct from ordinary stairs',()=>{
 assert.equal(tiers.length,3);assert.equal(flights.length,12);assert.deepEqual(tiers.map(t=>t.y1),[8/3,16/3,8]);
 near(Math.hypot(tiers[0].run,tiers[0].y1-tiers[0].y0),16.57);near(P.stoneWidth,3.07);
 assert.equal(P.publicAccessStatus,'UNKNOWN');assert.equal(P.stoneWalkingPolicy,'NO_GAMEPLAY_WALKABLE');
 for(const t of tiers){assert.equal(t.openings.length,3);assert.equal(t.flights.length,4);assert.ok(t.flights.every(f=>f.minX*f.maxX>0));
  for(const f of t.flights){assert.equal(W.cm.walkables.filter(w=>w.type==='ramp'&&Object.keys(f.ramp).every(k=>w[k]===f.ramp[k])).length,1,f.id);assert.ok(f.maxX-f.minX>=1.5-1e-7);}
  assert.equal(W.cm.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.a0===t.zEdge&&w.minX<0&&w.maxX>0).length,0);
 }
});
for(const kind of ['inner','outer'])for(const side of [-1,1])for(const fps of [60,10])for(const sprint of [false,true])for(const backward of [false,true])test(`real controller round trip ${kind}/${side}/${fps}/${sprint}/${backward}`,t=>{
 const saved=W.cm.walkables;W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);const trace=traceTerraceGround(W.cm,profile),go=pathFor(kind,side);
 try{const r=replayTerrace(t,W,[...go,...go.slice(0,-1).reverse()],{fps,sprint,backward});assert.equal(r.arrived,true,JSON.stringify(r));near(r.startFeet,0);near(r.maxFeet,8);near(r.end[2],0);
  for(const f of flights.filter(f=>f.kind===kind&&f.side===side)){assert.ok(trace.samples.some(s=>s.source===f.id&&s.height>s.feetIn+1e-5),`up ${f.id}`);assert.ok(trace.samples.some(s=>s.source===f.id&&s.height<s.feetIn-1e-5),`down ${f.id}`);}
  assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)));assert.ok(Math.max(...trace.samples.map(s=>s.height-s.feetIn))<=.156251);
 }finally{trace.restore();W.cm.walkables=saved;}
});
for(const f of flights)test(`missing registered ramp fails rather than platform rescue: ${f.id}`,t=>{
 const saved=W.cm.walkables;W.cm.walkables=saved.flatMap(w=>w.type==='box'?[{...w,rescue:false}]:w.type==='ramp'&&Object.keys(f.ramp).every(k=>w[k]===f.ramp[k])?[]:[w]);
 try{const r=replayTerrace(t,W,pathFor(f.kind,f.side),{fps:10,sprint:true});assert.ok(!r.arrived||r.maxFeet<8,JSON.stringify(r));}finally{W.cm.walkables=saved;}
});
for(const x of [0,-6,6,-17,17])test(`stone or retaining front is not an ordinary stair at x=${x}`,()=>{
 const t=tiers[0],r=walkStraight(W,[x,t.zToe+1.4],[x,t.zEdge-1],{feet0:0,step:.05});assert.ok(r.reached>=0&&r.reached<r.total-.4&&r.end[1]>=t.zEdge+.49,JSON.stringify(r));assert.equal(r.feet,0);
});
test('near/far stairs are closed, slope toward north, and LOD never changes colliders or walks',()=>{
 const mats=new Map(),lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
 const b=new PalaceBuilder(new THREE.Scene(),lib),g=new THREE.Group(),detail=createBaoheNorthDetail();
 for(const t of tiers)buildBaoheNorthTier(b,g,baoheNorthTier(t),detail);
 assert.equal(detail.fine.children.length,12);assert.equal(detail.coarse.children.length,12);
 for(const mesh of [...detail.fine.children,...detail.coarse.children]){const p=mesh.geometry.attributes.position,idx=mesh.geometry.index,edges=new Map();let volume=0;const at=i=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i):i);
  for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>at(i+j));assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()>1e-7);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;for(let j=0;j<3;j++){const key=[v[j],v[(j+1)%3]].map(v=>v.toArray().map(n=>Math.round(n*1e4)).join(',')).sort().join('|');edges.set(key,(edges.get(key)??0)+1);}}
  assert.ok(volume>0);assert.ok([...edges.values()].every(n=>n===2));
 }
 const slabs=g.children.filter(o=>o.name.endsWith(':carved-surface'));assert.equal(slabs.length,3);
 for(let i=0;i<3;i++){const t=tiers[i],p=slabs[i].geometry.attributes.position,verts=Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i));for(const v of verts)near(v.y,t.y1-(v.z-t.zEdge)*(t.y1-t.y0)/t.run+.04,2e-5);near(new THREE.Vector3().fromBufferAttribute(slabs[i].geometry.attributes.normal,0).y,Math.cos(Math.atan2(t.y1-t.y0,t.run)));}
 g.userData.architecture=[];const cols=[...b.colliders],walks=[...b.walkables],lod=installBaoheNorthDetail(g,detail),camera=new THREE.PerspectiveCamera();g.updateMatrixWorld(true);
 camera.position.set(0,2,200);camera.updateMatrixWorld();lod.update(camera);assert.equal(lod.getCurrentLevel(),0);
 camera.position.set(0,2,-200);camera.updateMatrixWorld();lod.update(camera);assert.equal(lod.getCurrentLevel(),1);assert.deepEqual(b.colliders,cols);assert.deepEqual(b.walkables,walks);
 assert.deepEqual([...mats.keys()].sort(),['balustrade','marble','yulu']);
});
