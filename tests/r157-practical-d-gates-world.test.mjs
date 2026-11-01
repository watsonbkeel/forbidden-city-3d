import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildR52World} from './lib/r52-world.mjs';
import {replayKunning} from './lib/kunning-walk.mjs';
import {sideGateGeometry} from '../src/scene/palace/special/SideGateProfiles.js';
const axis=JSON.parse(fs.readFileSync('data/zones/axis-courts.json'));
test('D-group existing gates: actual three-portal side gates and three retained single gates remain traversable',async t=>{
 const w=await buildR52World(),rows=[];
 try{
  for(const profile of ['xiehe','xihe']){
   const g=sideGateGeometry(axis.items.find(i=>i.gateProfile===profile));
   for(const portal of g.portals)for(const lane of [-1,0,1])for(const fps of [10,60])for(const sprint of [false,true]){
    const x=portal.centerX+lane*(portal.clearWidth/2-.85),toe=g.platformDepth/2+Math.max(g.frontRun??17.75,g.rearRun??17.75)+1;
    const points=[-toe,-5.7,-3,3,5.7,toe,5.7,3,-3,-5.7,-toe].map(z=>g.toWorld(x,z));
    rows.push({profile,bay:portal.bay,lane,fps,sprint,...replayKunning(t,w,points,{fps,sprint,startFeet:0,recordFrames:true})});
   }
  }
  for(const [profile,x,south,north,laneWidth] of [['zhongzuo',-77,-23,0,1.29],['houzuo',-76.4,112,134,1.05],['houyou',79.4,112,134,1.05]]){
   for(const lane of [-1,0,1])for(const fps of [10,60])for(const sprint of [false,true]){
    const points=[[x+lane*laneWidth,south],[x+lane*laneWidth,north],[x+lane*laneWidth,south]];
    rows.push({profile,lane,fps,sprint,...replayKunning(t,w,points,{fps,sprint,startFeet:0,recordFrames:true})});
   }
  }
  // Actual gallery porch and the gate apron are both present in this World.
  // This is a real 2.62 -> 2.4m step, not a hidden platform/provider replacement.
  for(const [profile,x,near,far] of [['xiehe-south-gallery',-100.65,-309,-400],['xiehe-north-gallery',-100.65,-291,-230],['xihe-south-gallery',105.1,-310,-400],['xihe-north-gallery',105.1,-292,-230]]){
   for(const fps of [10,60])for(const sprint of [false,true]){
    const row={profile,fps,sprint,...replayKunning(t,w,[[x,near],[x,far],[x,near]],{fps,sprint,startFeet:2.62,recordFrames:true})};
    rows.push(row);
   }
  }
  fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/r157-d-gates-world.json',JSON.stringify({scope:'Real CPU FirstPerson/World traversal, not browser or precise stopping',rows}));
  const failed=rows.filter(r=>!r.arrived).map(({frames,...r})=>r);
  assert.deepEqual(failed,[],'real routes must arrive; do not waive blockage under visual tolerance');
  for(const r of rows)for(const f of r.frames){assert.ok([f.x,f.z,f.feet,f.ground].every(Number.isFinite));if(r.profile.endsWith('-gallery')){assert.ok(f.ground>=2.3&&f.ground<=2.65,`gallery lost real platform: ${r.profile}/${f.ground}`);assert.ok(Math.abs(f.feet-f.ground)<=.3,`visible floating/sinking exceeds .3m: ${r.profile}/${f.feet-f.ground}`);}}
  console.log(JSON.stringify({combinations:rows.length,frames:rows.reduce((n,r)=>n+r.frames.length,0),arrived:rows.filter(r=>r.arrived).length}));
 }finally{w.dispose();}
});
