import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {withBoundedQaMocks} from './lib/bounded-qa-clock.mjs';
import {buildR52World} from './lib/r52-world.mjs';
import {replayKunning} from './lib/kunning-walk.mjs';
import {WUMEN_PRACTICAL_FIT as FIT} from '../src/scene/palace/special/WumenPracticalFit.js';
import {sideGateGeometry} from '../src/scene/palace/special/SideGateProfiles.js';
const axis=JSON.parse(fs.readFileSync('data/zones/axis-courts.json'));
test('Integrated A/B/D/E production World: complete doors, terraces, galleries, Wumen ascents and bridges',async t=>{
 const w=await buildR52World(),rows=[];
 const run=(points,options)=>withBoundedQaMocks(t,context=>replayKunning(context,w,points,options));
 const output=process.env.EVIDENCE_OUT??'/tmp/r157-integrated-practical-world.json';
 fs.writeFileSync(output+'.ndjson','');
 function record(row){
  for(const f of row.frames){assert.ok([f.x,f.z,f.feet,f.ground].every(Number.isFinite));if(row.profile.endsWith('-gallery')){assert.ok(f.ground>=2.3&&f.ground<=2.65);assert.ok(Math.abs(f.feet-f.ground)<=.3);}}
  if(row.reverse&&['wumen-east-ascent','wumen-west-ascent'].includes(row.profile))assert.ok(row.frames.every(f=>f.feet-f.ground<=.3),'actual Wumen descent must not repeat the 1.28m airborne regression');
  fs.appendFileSync(output+'.ndjson',JSON.stringify(row)+'\n');
  const {frames,...summary}=row;rows.push({...summary,frameCount:frames.length,maxFootGroundDifference:Math.max(0,...frames.map(f=>Math.abs(f.feet-f.ground)))});
  console.log(JSON.stringify({completed:rows.length,profile:row.profile,arrived:row.arrived,fps:row.fps,sprint:row.sprint}));
  if(rows.length%8===0)global.gc?.();
 }
 try{
  for(const profile of ['xiehe','xihe']){
   const g=sideGateGeometry(axis.items.find(i=>i.gateProfile===profile));
   for(const portal of g.portals)for(const lane of [-1,0,1])for(const fps of [10,60])for(const sprint of [false,true]){
    const x=portal.centerX+lane*(portal.clearWidth/2-.85),toe=g.platformDepth/2+Math.max(g.frontRun??17.75,g.rearRun??17.75)+1;
    const points=[-toe,-5.7,-3,3,5.7,toe,5.7,3,-3,-5.7,-toe].map(z=>g.toWorld(x,z));
    record({profile,bay:portal.bay,lane,fps,sprint,...run(points,{fps,sprint,startFeet:0,recordFrames:true})});
   }
  }
  for(const [profile,x,south,north,laneWidth] of [['zhongzuo',-77,-23,0,1.29],['houzuo',-76.4,112,134,1.05],['houyou',79.4,112,134,1.05]]){
   for(const lane of [-1,0,1])for(const fps of [10,60])for(const sprint of [false,true]){
    const points=[[x+lane*laneWidth,south],[x+lane*laneWidth,north],[x+lane*laneWidth,south]];
    record({profile,lane,fps,sprint,...run(points,{fps,sprint,startFeet:0,recordFrames:true})});
   }
  }
  // Actual gallery porch and the gate apron are both present in this World.
  // This is a real 2.62 -> 2.4m step, not a hidden platform/provider replacement.
  for(const [profile,x,near,far] of [['xiehe-south-gallery',-100.65,-309,-400],['xiehe-north-gallery',-100.65,-291,-230],['xihe-south-gallery',105.1,-310,-400],['xihe-north-gallery',105.1,-292,-230]]){
   for(const fps of [10,60])for(const sprint of [false,true]){
    const row={profile,fps,sprint,...run([[x,near],[x,far],[x,near]],{fps,sprint,startFeet:2.62,recordFrames:true})};
    record(row);
   }
  }
  const ascent=side=>{const parts=FIT.platform.recesses.filter(p=>p.id.startsWith(side+'/')),points=parts.map(p=>[p.axis==='x'?(p.a0+p.a1)/2:(p.minX+p.maxX)/2,p.axis==='z'?(p.a0+p.a1)/2:(p.minZ+p.maxZ)/2]),first=parts[0],sign=side==='east'?-1:1;points.unshift([(first.minX+first.maxX)/2,first.maxZ+2]);points.push([sign*60.61837748344371,points.at(-1)[1]]);return points;};
  const wm=[{id:'east-ascent',points:ascent('east')},{id:'west-ascent',points:ascent('west')},{id:'north-deck',points:[[-10,13.5],[10,13.5]],feet:12.3},...[-14.5,0,14.5].map(x=>({id:`central-${x}`,points:[[x,-15.3],[x,20.6]],feet:0})),...[-1,1].map(sign=>({id:`side-${sign}`,points:[[sign*38.6,-16.5],[sign*48,-16.5],[sign*48,20.6]],feet:0}))];
  for(const r of wm)for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){
   const points=(reverse?[...r.points].reverse():r.points).map(([x,z])=>[x,z-419.6]);
   const result=run(points,{fps,sprint,startFeet:r.feet??(reverse?12.3:0),recordFrames:true});
   record({profile:'wumen-'+r.id,fps,sprint,reverse,...result});
  }
  for(const [profile,x,south,north,feet] of [['baohe-west-door',39,119,127,8],['baohe-east-door',-37,119,127,8],['baohe-east-front',-102.37,0,115,.45],['baohe-west-front',106.6,0,115,.45]])for(const fps of[10,60])for(const sprint of[false,true])record({profile,fps,sprint,...run([[x,south],[x,north],[x,south]],{fps,sprint,startFeet:feet,recordFrames:true})});
  for(const fps of[10,60])for(const sprint of[false,true])for(const x of[-3.15,0,3.15,-30,-13,13,30])record({profile:'inner-jinshui',x,fps,sprint,...run([[x,-326],[x,-296],[x,-326]],{startFeet:0,fps,sprint,recordFrames:true})});
  for(const fps of[10,60])for(const sprint of[false,true])for(const lane of[-.85,0,.85])record({profile:'zhongyou',lane,fps,sprint,...run([[80+lane,-40],[80+lane,12],[80+lane,-40]],{startFeet:0,fps,sprint,recordFrames:true})});
  fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/r157-integrated-practical-world.json',JSON.stringify({scope:'Real CPU FirstPerson/World traversal, not browser or precise stopping',rows}));
  const failed=rows.filter(r=>!r.arrived).map(({frames,...r})=>r);
  assert.deepEqual(failed,[],'real routes must arrive; do not waive blockage under visual tolerance');

  console.log(JSON.stringify({combinations:rows.length,frames:rows.reduce((n,r)=>n+r.frameCount,0),arrived:rows.filter(r=>r.arrived).length}));
 }finally{w.dispose();}
});
