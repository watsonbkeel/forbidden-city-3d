import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {baselineTopologyFixture} from './baseline.mjs';
import {topologyFixture,T} from './fixture.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
export const plans=[
 {name:'original-entrance',pts:[[254.7,448],[254.7,451.2],[277.2,451.2],[277.2,452.6],[277.2,454.9],[277.2,457],[277.2,459]]},
 {name:'cross-street',pts:[[250,451.2],[305,451.2]]},
 {name:'original-west-bypass',pts:[[277.2,457],[285,457],[285,476],[277.2,476]]},
 ...[-1,1].map(side=>({name:'stele-hall-'+side,pts:[[277.2,451.2],[277.2,464.5],[277.2,467.75],[277.2+side*1.9,467.75],[277.2+side*1.9,470.25],[277.2,470.25],[277.2,473.5],[277.2,480.5]]})),
 ...[-3.65,0,3.65].map(dx=>({name:'new-arch-'+dx,pts:[[277.2+dx,452.4],[277.2+dx,457.4]]})),
 {name:'east-corner',pts:[[269.4,459],[269.4,464]]}
];
test('unchanged old approach/cross-street/bypass and new three arches return with real controller',t=>{
 const w=topologyFixture(),baseline=baselineTopologyFixture(),rows=[];try{for(const p of plans)for(const fps of[10,60,144])for(const sprint of[false,true]){
  const points=[...p.pts,...p.pts.slice(0,-1).reverse()],q=withBoundedQaMocks(t,k=>replayKunning(k,w,points,{fps,sprint,startFeet:w.cm.getGroundHeight(...points[0]),recordFrames:true}));
  rows.push({name:p.name,fps,sprint,...q});assert.ok(q.arrived,JSON.stringify({name:p.name,fps,sprint,stuckAt:q.stuckAt,end:q.end}));
  assert.equal(w.cm.checkCollision(new T.Vector3(q.end[0],q.end[2]+1.7,q.end[1]),.5),false,'settled body '+p.name);
  // Native 10Hz sprint stops .62177m past the unchanged cross-street endpoint
  // on the public baseline too. Require the full old trajectory, not a new
  // .6m promise that even the original controller never made.
  if(['cross-street','original-west-bypass'].includes(p.name)){const old=withBoundedQaMocks(t,k=>replayKunning(k,baseline,points,{fps,sprint,startFeet:0,recordFrames:true}));assert.deepEqual(q,old,'original untouched trajectory '+p.name);}
  else if(p.name==='original-entrance')assert.ok(Math.hypot(q.end[0]-points[0][0],q.end[1]-points[0][1])<.6,'original entrance native stop');
  else {const [sx,sz]=points[0];assert.ok(Math.abs(q.end[0]-sx)<.25,'aligned return');assert.ok(q.end[1]>=sz-1&&q.end[1]<=sz+.25,'native stop remains in the fixed unobstructed initial metre');assert.ok(Math.abs(q.end[2]-w.cm.getGroundHeight(q.end[0],q.end[1]))<1e-6,'settled on real ground');}
 }}finally{if(process.env.H39_ROUTES_EVIDENCE)fs.writeFileSync(process.env.H39_ROUTES_EVIDENCE,JSON.stringify(rows));w.dispose();baseline.dispose();}
});
