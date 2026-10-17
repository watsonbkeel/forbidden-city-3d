import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildWorld } from './lib/world.mjs';
import { captureGate } from './lib/gate-tower-fixture.mjs';
import { replayKunning } from './lib/kunning-walk.mjs';
import { traceProfileSupports } from './lib/profile-support-trace.mjs';
import { wumenAscentGeometry } from '../src/scene/palace/special/WumenAscentProfile.js';
import { LAYOUT, PLAYER } from '../src/config/constants.js';

const world = await buildWorld(), gate = captureGate('午门'), G = wumenAscentGeometry();
const keys = ['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
const labels = G.sides.flatMap(s => [...s.flights.map(f=>f.id), ...s.landings.map(l=>l.id)]).concat('wumen-platform');
assert.equal(gate.builder.walkables.length, labels.length);
const same = (a,b) => a.type===b.type && (a.type==='box' ? a.box.equals(b.box) : keys.every(k=>a[k]===b[k]));
function bind() {
 const ids = new Map();
 for (let i=0;i<labels.length;i++) {
  const matches=world.cm.walkables.filter(w=>same(w,gate.builder.walkables[i]));
  assert.equal(matches.length,1,`${labels[i]} must have one actual registered support`);ids.set(matches[0],labels[i]);
 }return ids;
}
const routeFor = side => {
 const go=[...side.route,[side.sign*58,11.2],[side.sign*35,11.2],[0,11.2],[0,0]];
 return [...go,...go.slice(0,-1).reverse()].map(([x,z])=>[x,z+LAYOUT.WUMEN_Z]);
};
function run(t,side,options={},mutation=null) {
 const saved=world.cm.walkables;
 world.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);
 const ids=bind();
 if(mutation) world.cm.walkables=world.cm.walkables.filter(w=>ids.get(w)!==mutation);
 const trace=traceProfileSupports(world.cm,ids);
 try {
  const points=routeFor(side), result=replayKunning(t,world,points,{...options,startFeet:0,recordFrames:true});
  const allowed=new Set(['ground','wumen-platform',...side.flights.map(f=>f.id),...side.landings.map(l=>l.id)]);
  const unsafe=trace.samples.filter(s=>!allowed.has(s.source));
  const collisions=result.frames.filter(f=>world.cm.checkCollision(new world.THREE.Vector3(f.x,Math.max(f.feet,f.ground)+PLAYER.HEIGHT,f.z),.5));
  const ascending=side.flights.filter(f=>trace.samples.some(s=>s.source===f.id&&s.height-s.feetIn>1e-5)).map(f=>f.id);
  const descending=side.flights.filter(f=>trace.samples.some(s=>s.source===f.id&&s.height-s.feetIn< -1e-5)).map(f=>f.id);
  const sequence=trace.samples.map(s=>s.source).filter((s,i,a)=>i===0||s!==a[i-1]);
  return {arrived:result.arrived,startFeet:result.startFeet,end:result.end,stuckAt:result.stuckAt,maxFeet:result.maxFeet,maxSpeed:result.maxSpeed,
   frames:result.frames.length,queryCount:trace.samples.length,collisions:collisions.slice(0,3),collisionCount:collisions.length,
   unsafe:unsafe.slice(0,3),unsafeCount:unsafe.length,ascending,descending,sequence,driver:result.driver,expectedCrossings:points.length-1};
 } finally {trace.restore();world.cm.walkables=saved;}
}
for (const side of G.sides) for (const fps of [60,10]) for (const sprint of [false,true]) for (const backward of [false,true]) {
 test(`whole-world three-flight and platform roundtrip: ${side.name},${fps}Hz,sprint=${sprint},backward=${backward}`,t=>{
  const r=run(t,side,{fps,sprint,backward}); const note=JSON.stringify({...r,driver:undefined,sequence:undefined});
  assert.equal(r.arrived,true,note); assert.equal(r.startFeet,0); assert.equal(r.end[2],0);
  assert.ok(r.maxFeet>=12.29,note); assert.equal(r.collisionCount,0,note); assert.equal(r.unsafeCount,0,note);
  assert.deepEqual(r.ascending,side.flights.map(f=>f.id));assert.deepEqual(r.descending,side.flights.map(f=>f.id));
  assert.ok(r.sequence.includes('wumen-platform'));for(const l of side.landings)assert.ok(r.sequence.includes(l.id),l.id);
  assert.equal(r.driver.crossings.length,r.expectedCrossings); assert.ok(r.driver.crossings.every(c=>c.lateralDistance<.6));
  assert.ok(r.maxSpeed>=(sprint?11.9:4.9));assert.equal(r.driver.brakingFrames>0,sprint,'sprint is braked within2m of corners');
  if(process.env.WUMEN_ASCENT_EVIDENCE_DIR){fs.mkdirSync(process.env.WUMEN_ASCENT_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.WUMEN_ASCENT_EVIDENCE_DIR,`${side.name}-${fps}-${sprint?'sprint-braked':'walk'}-${backward?'backward':'forward'}.json`),JSON.stringify(r,null,2)+'\n');}
 });
}
for(const side of G.sides)for(const flight of side.flights)test(`removing ${flight.id} cannot be accepted by arrival or rescue`,t=>{
 const r=run(t,side,{fps:10,sprint:true},flight.id);
 assert.ok(!r.arrived||r.maxFeet<12.29||r.ascending.length<3||r.descending.length<3||r.unsafeCount>0);
 assert.ok(!r.ascending.includes(flight.id));assert.ok(!r.sequence.includes('rescue'));
});
