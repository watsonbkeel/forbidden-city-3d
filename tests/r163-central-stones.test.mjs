import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {setupInput, PLAYER} from './lib/input-fixture.mjs';
import {createPhysicalWaypointDriver} from './lib/physical-waypoints.mjs';
import {centralStoneSnapshot} from './lib/r163-central-stone-snapshot.mjs';
import {centralStoneCrossBounds} from '../src/scene/palace/CentralStoneContactBounds.js';
import {resolveBPrincipalStairContact} from '../src/scene/palace/BPrincipalStairContact.js';
import {CollisionManager} from '../src/utils/Collision.js';

// Complete normal three-hall construction, including the visible hall bodies,
// furniture, landings and every adjacent flight. Only DOM/time are test doubles.
const scene = new THREE.Scene(), b = new PalaceBuilder(scene, library());
b.buildAll(PALACE_LAYOUT.filter(h => ['太和殿','中和殿','保和殿'].includes(h.name)));
const stones = Object.fromEntries(b.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.y0===8.6)
  .map(w=>[w.a1<w.a0?'south':'north',{stone:{y0:w.y1,zEdge:w.a0,
    dir:Math.sign(w.a1-w.a0),run:Math.abs(w.a1-w.a0)}}]));
const rows = [
  ...Object.entries(stones).map(([side,{stone:p}]) => ({
    id:`zhonghe-${side}`, startFeet:p.y0,
    points:[[0,p.zEdge+p.dir*(p.run+1.5)],[0,p.zEdge-p.dir*.8]],
  })),
  {id:'baohe-north-to-qianqing', startFeet:9,
    points:[[0,b.baoheHallPlinth.zEdge-.7],[0,b.baoheHallPlinth.zToe+1],
      [0,b.baoheNorthTiers.at(-1).zEdge-.7],
      ...b.baoheNorthTiers.toReversed().flatMap(p=>[[0,p.zEdge],[0,p.zToe]]),
      [0,b.baoheNorthTiers[0].zToe+1.5]]},
];
const controls = [
  ...b.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.y0===8.6&&w.minX*w.maxX>0)
    .map(w=>{const x=(w.minX+w.maxX)/2,dir=Math.sign(w.a1-w.a0);return{
      id:`zhonghe-side-${x}-${dir}`,startFeet:w.y1,
      points:[[x,w.a1+dir*1.5],[x,w.a0-dir*.8]]};}),
  ...['inner','outer'].flatMap(kind=>[-1,1].map(side=>{
    const f=b.baoheHallPlinth.flights.find(f=>f.kind===kind&&f.side===side);
    const x=(f.minX+f.maxX)/2;
    const tiers=b.baoheNorthTiers.toReversed().map(p=>p.flights.find(f=>f.kind===kind&&f.side===side));
    const tx=(tiers[0].minX+tiers[0].maxX)/2;
    return{id:`baohe-side-${kind}-${side}`,startFeet:9,points:[
      [x,f.zEdge-.7],[x,f.zToe+1],[tx,f.zToe+1],
      ...tiers.flatMap(f=>[[tx,f.zEdge],[tx,f.zToe]]),[tx,tiers.at(-1).zToe+1.5]]};
  })),
];
const summaries=[];
const seamRows=[-1,1].flatMap(side=>[1.0,1.3,1.7,1.95].map(offset=>({
  ...rows.find(r=>r.id==='baohe-north-to-qianqing'),id:`baohe-stone-inner-seam-${side*offset}`,
  points:rows.find(r=>r.id==='baohe-north-to-qianqing').points.map(([,z])=>[side*offset,z]),
})));
test.after(()=>{
  b.dispose();
  if(process.env.EVIDENCE_OUT)fs.writeFileSync(process.env.EVIDENCE_OUT,JSON.stringify({
    basisCommit:'ec50ea010340dc3b04f18ec052f36a05c3862702',
    scope:'Real production FirstPersonControls and CollisionManager, normal three-hall scene; DOM/time only mocked; rescue disabled; no jumps',
    routes:summaries},null,2));
});

function replay(t, row, {fps=60,sprint=false,backward=false}={}) {
  const f=setupInput(t,{map:true});
  f.cm.rivers=[];
  f.cm.addColliders(b.colliders);
  f.cm.addWalkables(b.walkables.map(w=>w.type==='box'?{...w,rescue:false}:w));
  const points=[...row.points,...row.points.slice(0,-1).reverse()];
  f.c.setPosition(points[0][0],row.startFeet+PLAYER.HEIGHT,points[0][1]);
  f.c.headBobEnabled=false;
  f.c.moveForward=!backward;f.c.moveBackward=backward;
  const driver=createPhysicalWaypointDriver(points),frames=[];
  let stuck=0,last=points[0];
  for(let n=0;n<fps*90&&!driver.complete;n++) {
    const before=f.logical(),command=driver.command([before.x,before.z],sprint),[x,z]=command.target;
    f.camera.lookAt(backward?2*before.x-x:x,before.y,backward?2*before.z-z:z);
    f.c.canSprint=command.canSprint;
    const after=f.frame(1000/fps);
    frames.push({x:after.x,z:after.z,feet:f.c.feetY,ground:f.c.groundY,
      airborne:f.c.airborne,jumpQueued:f.c.jumpQueued,speed:f.c.motion.speed});
    driver.observe([before.x,before.z],[after.x,after.z]);
    if(n%fps===fps-1) {
      stuck=Math.hypot(after.x-last[0],after.z-last[1])<.1?stuck+1:0;
      last=[after.x,after.z];
      if(stuck>=2)break;
    }
  }
  f.c.moveForward=false;f.c.moveBackward=false;
  for(let n=0;n<fps*2;n++)f.frame(1000/fps);
  return {arrived:driver.complete,end:[f.logical().x,f.logical().z,f.c.feetY],frames};
}

for(const row of [...rows,...seamRows,...controls])for(const fps of[60,10])for(const sprint of[false,true])for(const backward of[false,true])
test(`R163 no-jump central roundtrip ${row.id} ${fps}Hz sprint=${sprint} backward=${backward}`,t=>{
  const r=replay(t,row,{fps,sprint,backward});
  assert.equal(r.arrived,true,JSON.stringify({...r,frames:r.frames.slice(-2)}));
  assert.ok(Math.abs(r.end[2]-row.startFeet)<.02,'returns to its original landing');
  assert.ok(r.frames.every(f=>!f.jumpQueued),'never asks to jump');
  if(rows.includes(row)||seamRows.includes(row))assert.ok(r.frames.every(f=>Math.abs(f.feet-f.ground)<=.3),
    'central descent must stay attached instead of launching off a steep ramp');
  summaries.push({route:row.id,fps,sprint,backward,arrived:r.arrived,end:r.end,frames:r.frames.length,
    maxFeetGroundGap:Math.max(...r.frames.map(f=>Math.abs(f.feet-f.ground)))});
});

const reviewedTaihe=JSON.parse(fs.readFileSync(new URL('./fixtures/r163-central-stones-reviewed-taihe.json',import.meta.url)));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
test('R163 exact retention accepts only independently reproduced reviewed Taihe changes outside the six central stones',()=>{
  const oldBytes=fs.readFileSync(new URL('./fixtures/r163-central-stones-baseline.json',import.meta.url));
  assert.equal(sha(oldBytes),reviewedTaihe.originalFixtureSHA256,'never replace the original central-stone baseline');
  assert.deepEqual(JSON.parse(oldBytes).snapshot,reviewedTaihe.originalSnapshot,'reviewed capture reproduced the original baseline');
  for(const [path,expected]of Object.entries(reviewedTaihe.sourceSHA256))
    assert.equal(sha(fs.readFileSync(new URL('../'+path,import.meta.url))),expected,'exact reviewed Taihe source: '+path);
  assert.deepEqual(centralStoneSnapshot(scene,b),reviewedTaihe.snapshot);
});

test('retention still rejects an unrelated Baohe visible vertex change',()=>{
  let point;
  scene.traverse(m=>{
    if(point||!m.isMesh)return;
    const p=m.geometry.attributes.position;
    for(let i=0;i<p.count;i++)if(p.getZ(i)>100&&p.getY(i)>16&&p.getX(i)>8){point={p,i,x:p.getX(i)};break;}
  });
  assert.ok(point,'actual Baohe roof vertex outside all central stone footprints');
  try{point.p.setX(point.i,point.x+.01);assert.throws(()=>assert.deepEqual(centralStoneSnapshot(scene,b),reviewedTaihe.snapshot));}
  finally{point.p.setX(point.i,point.x);}
});

test('retention still rejects an unrelated Baohe collider change',()=>{
  const c=b.colliders.find(c=>c.min.x>20&&c.min.z>100),old=c.max.y;
  try{c.max.y+=.01;assert.throws(()=>assert.deepEqual(centralStoneSnapshot(scene,b),reviewedTaihe.snapshot));}
  finally{c.max.y=old;}
});

test('retention still rejects a noncentral north-stair support change',()=>{
  const r=b.walkables.find(r=>r.bPrincipalStairId==='three-halls/baohe-north-separated-approaches:3:outer:1'),old=r.y0;
  try{r.y0+=.01;assert.throws(()=>assert.deepEqual(centralStoneSnapshot(scene,b),reviewedTaihe.snapshot));}
  finally{r.y0=old;}
});

test('central seam clearance is read-only and excludes outer stairs, foreign slopes and gaps',()=>{
  const ramps=b.walkables.filter(w=>w.type==='ramp'),before=JSON.stringify(ramps);
  const central=ramps.find(r=>r.bPrincipalStairId==='three-halls/central-stone:baohe-north-3');
  assert.deepEqual(centralStoneCrossBounds(central,ramps),[-3.035,3.035]);
  for(const r of ramps.filter(r=>r.bPrincipalStairId?.includes('baohe-north-separated-approaches:3:inner:')))
    assert.deepEqual(centralStoneCrossBounds(r,ramps),[-3.035,3.035]);
  const outer=ramps.find(r=>r.bPrincipalStairId?.includes('baohe-north-separated-approaches:3:outer:'));
  assert.equal(centralStoneCrossBounds(outer,ramps),null);
  assert.equal(centralStoneCrossBounds(undefined,ramps),null);
  assert.equal(centralStoneCrossBounds({...central,bPrincipalStairId:'foreign'},ramps),null);
  assert.equal(centralStoneCrossBounds({...central,y0:central.y0+.01},ramps),null);
  assert.equal(centralStoneCrossBounds(central,ramps.filter(r=>r!==central)),null);
  const disconnected={...central,bPrincipalStairId:'three-halls/baohe-north-separated-approaches:3:inner:1',minX:4,maxX:5};
  assert.equal(centralStoneCrossBounds(disconnected,[central,disconnected]),null);
  assert.equal(JSON.stringify(ramps),before);
});

test('central contact still rejects jumps, high falls, lateral exits and a swept body obstruction',()=>{
  const make=()=>{const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.colliders);cm.addWalkables(b.walkables);return cm;};
  const state=(cm,z)=>{const feet=cm.getGroundHeight(1.3,z,9,0);return{x:1.3,z,feetY:feet,groundY:feet,airborne:false,verticalVelocity:0};};
  for(const kind of['plain','jump','fall','side-exit','wall']) {
    const cm=make(),a=state(cm,168),next={...a,z:169.2};
    resolveBPrincipalStairContact(cm,a,.1);
    if(kind==='jump'){next.airborne=true;next.verticalVelocity=6;}
    if(kind==='fall'){next.airborne=true;next.feetY+=4;next.verticalVelocity=-8;}
    if(kind==='side-exit')next.x=3.0;
    if(kind==='wall')cm.addCollider(new THREE.Box3(new THREE.Vector3(-2,0,168.595),new THREE.Vector3(3,12,168.605)));
    const result=resolveBPrincipalStairContact(cm,next,.1);
    if(kind==='plain')assert.ok(result?.bPrincipalStairContact);
    else assert.equal(result,null,kind);
  }
});
