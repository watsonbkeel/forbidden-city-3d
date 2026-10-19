import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {taiheFrontPoints} from './lib/taihe-front-route.mjs';
import {traceTerraceGround,replayTerrace} from './lib/terrace-walk.mjs';
import {TAIHE_FRONT_APPROACHES as P,taiheSouthTier,buildTaiheSouthTier} from '../src/scene/palace/TaiheFrontApproaches.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
const W=await buildWorld(),tiers=W.taiheSouthTiers,flights=tiers.flatMap(t=>t.flights),profile={flights};
const almost=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('three separated south-tier approaches and three independent small plinth stairs retain all inherited levels',()=>{
 assert.equal(tiers.length,4);assert.deepEqual(tiers.filter(t=>!t.plinth).map(t=>t.openings),Array(3).fill([[-13,-8],[-3,3],[8,13]]));
 assert.deepEqual(tiers.map(t=>t.y1),[8/3,16/3,8,9.9375]);assert.equal(flights.length,9);
 for(const f of flights){const matches=W.cm.walkables.filter(w=>w.type==='ramp'&&Object.keys(f.ramp).every(k=>w[k]===f.ramp[k]));assert.equal(matches.length,1,f.id);}
 assert.equal(P.currentVisitorAccess,'UNKNOWN');assert.equal(P.evidenceClass,'PHOTO_PLAN_TOPOLOGY_WITH_PROVISIONAL_DIMENSIONS');
 for(const t of tiers.filter(t=>!t.plinth))assert.equal(W.cm.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.a0===t.zEdge&&w.minX<0&&w.maxX>0).length,0,'imperial carving is not an ordinary walking ramp');
});

for(const side of [-1,1])for(const fps of [60,10])for(const sprint of [false,true])for(const backward of [false,true])test(`real controller ascends/descends all south flights without box rescue: ${side},${fps},${sprint},${backward}`,t=>{
 const saved=W.cm.walkables;W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);
 const trace=traceTerraceGround(W.cm,profile),go=taiheFrontPoints(tiers,side),pts=[...go,...go.slice(0,-1).reverse()];
 try{
  const result=replayTerrace(t,W,pts,{fps,sprint,backward});assert.equal(result.arrived,true,JSON.stringify(result));
  almost(result.startFeet,0);almost(result.end[2],0);almost(result.maxFeet,9.9375);
  const expected=[...tiers.filter(q=>!q.plinth).map(q=>q.flights.find(f=>Math.sign(f.centerX)===side)),tiers.find(q=>q.plinth).flights.find(f=>f.centerX===0)];
  for(const f of expected){assert.ok(trace.samples.some(s=>s.source===f.id&&s.height>s.feetIn+1e-5),`ascent ${f.id}`);assert.ok(trace.samples.some(s=>s.source===f.id&&s.height<s.feetIn-1e-5),`descent ${f.id}`);}
  assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)));assert.ok(Math.max(...trace.samples.map(s=>s.height-s.feetIn))<=.156251);
  assert.ok(result.maxSpeed>=(sprint?11.9:4.9));
 }finally{trace.restore();W.cm.walkables=saved;}
});

for(const x of [0,5.5,-5.5,15,-15])test(`imperial slab and inter-stair retaining face block direct ground crossing x=${x}`,()=>{
 const r=walkStraight(W,[x,-64],[x,-40],{feet0:0,step:.05});assert.ok(r.reached>0&&r.reached<10.5,JSON.stringify(r));assert.ok(r.end[1]>-64&&r.end[1]<-53.5,JSON.stringify(r));assert.equal(r.feet,0);
});

for(const side of [-1,1])for(const tier of [1,2,3])test(`missing south ramp ${side}/${tier} cannot pass by platform rescue`,t=>{
 const saved=W.cm.walkables,f=tiers.find(q=>q.tier===tier).flights.find(f=>Math.sign(f.centerX)===side);
 W.cm.walkables=saved.flatMap(w=>w.type==='box'?[{...w,rescue:false}]:w.type==='ramp'&&Object.keys(f.ramp).every(k=>w[k]===f.ramp[k])?[]:[w]);
 const trace=traceTerraceGround(W.cm,profile);
 try{const r=replayTerrace(t,W,taiheFrontPoints(tiers,side),{fps:10,sprint:true});assert.ok(!r.arrived||r.maxFeet<9.9375,JSON.stringify(r));assert.ok(!trace.samples.some(s=>s.source===f.id));}finally{trace.restore();W.cm.walkables=saved;}
});

test('closed treads are nondegenerate manifolds and sloped rails reuse existing materials',()=>{
 const mats=new Map(),lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>2};
 const b=new PalaceBuilder(new THREE.Scene(),lib),g=new THREE.Group();buildTaiheSouthTier(b,g,taiheSouthTier({zEdge:-54,y0:0,y1:8/3,run:64/15,halfWidth:65,tier:1}));
 const meshes=[];g.traverse(o=>{if(o.isMesh&&o.name.endsWith(':closed-treads'))meshes.push(o);});assert.equal(meshes.length,2);
 for(const m of meshes){const p=m.geometry.attributes.position,edges=new Map();let volume=0;
  assert.equal(p.count/3,140);
  for(let i=0;i<p.count;i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j));assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()>1e-7);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;for(let j=0;j<3;j++){const key=[v[j],v[(j+1)%3]].map(v=>v.toArray().map(x=>Math.round(x*1e5)).join(',')).sort().join('|');edges.set(key,(edges.get(key)??0)+1);}}
  assert.ok(volume>0);assert.ok([...edges.values()].every(n=>n===2));
 }
 assert.deepEqual([...mats.keys()].sort(),['balustrade','marble','yulu']);assert.equal(b.walkables.length,2);
 const rails=[];g.traverse(o=>{if(o.name.includes(':slope-rail:'))rails.push(o);});assert.equal(rails.length,4);
});

for(const side of [-1,1])for(const fps of [60,10])for(const sprint of [false,true])test(`side plinth staircase itself is walkable to its veranda landing: ${side},${fps},${sprint}`,t=>{
 const outer=taiheFrontPoints(tiers,side).slice(0,-5),f=tiers.find(q=>q.plinth).flights.find(f=>Math.sign(f.centerX)===side);
 const go=[...outer,[f.centerX,f.zToe-2.9],[f.centerX,f.zToe],[f.centerX,f.zEdge],[f.centerX,f.zEdge+.35],[0,f.zEdge+.35],[0,-10]],pts=[...go,...go.slice(0,-1).reverse()];
 const saved=W.cm.walkables;W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);const trace=traceTerraceGround(W.cm,profile);
 try{const r=replayTerrace(t,W,pts,{fps,sprint});assert.equal(r.arrived,true,JSON.stringify(r));almost(r.maxFeet,9.9375);almost(r.end[2],0);assert.ok(trace.samples.some(s=>s.source===f.id&&s.height>s.feetIn));assert.ok(trace.samples.some(s=>s.source===f.id&&s.height<s.feetIn));assert.ok(!trace.samples.some(s=>s.source==='rescue'));}
 finally{trace.restore();W.cm.walkables=saved;}
});

test('historical source/route normalization is exact and rejects any unrelated drift',async()=>{
 const fs=await import('node:fs'),{restorePreTaiheFrontSource,withLegacyTaiheFrontRoute}=await import('./lib/r7-taihe-front-retention.mjs');
 const delta=JSON.parse(fs.readFileSync(new URL('./fixtures/r7-taihe-front-source-delta.json',import.meta.url))),route=JSON.parse(fs.readFileSync(new URL('./fixtures/r7-taihe-front-route-delta.json',import.meta.url)));
 const bytes=fs.readFileSync(new URL('../'+delta.path,import.meta.url));assert.ok(restorePreTaiheFrontSource(delta.path,bytes).length<bytes.length);
 assert.throws(()=>restorePreTaiheFrontSource(delta.path,Buffer.concat([bytes,Buffer.from('\n')])));
 assert.deepEqual(withLegacyTaiheFrontRoute([route.after]),[route.before]);assert.throws(()=>withLegacyTaiheFrontRoute([{...route.after,pts:route.after.pts.slice(1)}]));
});
