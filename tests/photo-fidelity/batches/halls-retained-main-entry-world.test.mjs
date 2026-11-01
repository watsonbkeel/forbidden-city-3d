// B retained main-entry verification: real current World, one initial placement
// per route, actual controller and source-derived legal doors/stairs. No GPU claim.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildR52World} from '../../lib/r52-world.mjs';
import {replayKunning} from '../../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../../lib/bounded-qa-clock.mjs';
import {taiheFrontPoints} from '../../lib/taihe-front-route.mjs';
import {ZHONGHE_DISPLAY_ROUTE} from '../../lib/r55-zhonghe-world-check.mjs';
import {pavilionGeometry} from '../../../src/scene/palace/special/PavilionProfiles.js';
import axis from '../../../data/zones/axis-courts.json' with {type:'json'};
import taihe from '../../../data/architecture/taihe-core.json' with {type:'json'};
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';
const dedupe=points=>points.filter((p,i)=>!i||p.some((v,k)=>v!==points[i-1][k]));
const roundTrip=go=>dedupe([...go,...go.slice(0,-1).reverse()]);
test('retained B six route families plus three-tier approaches in the actual cumulative World',async t=>{
 const W=await buildR52World(),out=process.env.EVIDENCE_OUT??'/tmp/b-retained-world.json',rows=[],definitions=[],negatives=[],headProbes=[];fs.writeFileSync(out+'.ndjson','');
 const run=(points,o)=>withBoundedQaMocks(t,c=>replayKunning(c,W,points,{...o,recordFrames:true}));
 try{
  const taiheView=taihe.dais.z0-taihe.dais.steps*taihe.dais.stepRun-1;
  definitions.push({name:'taihe-south-stairs-main-entry',source:'taiheFrontPoints + existing pre-dais viewing point',startFeet:0,points:roundTrip(taiheFrontPoints(W.taiheSouthTiers,-1,taiheView))});
  const waist=W.terraceProfiles.find(p=>p.id==='three-hall-waist-stairs'),approach=waist.approaches.east.points.map(p=>[p.x,p.z]);
  const circuit=ZHONGHE_DISPLAY_ROUTE.slice(0,-1),index=circuit.findIndex(([x,z])=>x===-10.8&&z===65),loop=[...circuit.slice(index),...circuit.slice(0,index+1)];
  definitions.push({name:'zhonghe-east-waist-four-doors',source:'actual waist.approaches.east + existing four-door display circuit; adjacent duplicate junction vertices removed, no throne crossing',startFeet:0,points:dedupe([...approach,...loop,...approach.toReversed()])});
  const flights=W.baoheNorthTiers.map(p=>p.flights.find(f=>f.kind==='outer'&&f.side===1)),x=(flights[0].minX+flights[0].maxX)/2;
  const baoheZ=PALACE_LAYOUT.find(p=>p.name==='保和殿').position.z;
  const baoheGo=[[x,flights[0].zToe+1.4],...flights.flatMap((f,i)=>[[x,f.zToe],[x,f.zEdge],[x,f.zEdge-(i===flights.length-1?2:.65)]]),[6.4,140.2],[6.4,133.2],[6.4,119.5],[16,119.5],[16,baoheZ],[22,baoheZ],[22,baoheZ+4],[22,baoheZ],[16,baoheZ]];
  definitions.push({name:'baohe-north-stairs-warm-room-entry',source:'r48-review-baohe-routes existing western side-room detour, not rear-post collision line',startFeet:0,points:roundTrip(baoheGo)});
  for(const[key,side]of[['tiren','frontLeft'],['hongyi','frontRight']]){const item=axis.items.find(p=>p.pavilionProfile===key&&p.kind==='hall'),g=pavilionGeometry(item),go=g.approaches[side].worldPoints.map(p=>[p.x,p.z]);definitions.push({name:key+'-front-stair-main-door',source:'own pavilionGeometry.approaches.'+side,startFeet:0,points:roundTrip(go)});const p=g.approaches[side].worldPoints.at(-1);headProbes.push({name:key+'-interior',x:p.x,z:p.z,feet:p.y});}
  const structure=[];W.scene.traverse(o=>{if(o.userData.structure)structure.push(o.userData.structure);structure.push(...(o.userData.architecture??[]));});
  for(const side of['east','west']){const p=structure.find(p=>p.id===`taihe-${side}-stepped-firewall`);assert.ok(p,'actual merged wall metadata '+side);const d=p.passage;definitions.push({name:`taihe-${side}-wall-door`,source:'own current wall passage; flank stays solid',startFeet:d.floorY,points:[[d.centerX,p.z-4],[d.centerX,p.z+4],[d.centerX,p.z-4]]});headProbes.push({name:side+'-wall-door',x:d.centerX,z:p.z,feet:d.floorY});negatives.push({name:side+'-wall-flank',blocked:W.cm.checkCollision(new W.THREE.Vector3(d.centerX+3,d.floorY+1.7,p.z),.5)});}
  for(const def of definitions)for(const fps of[10,60])for(const sprint of[false,true]){
   const r=run(def.points,{fps,sprint,startFeet:def.startFeet}),row={name:def.name,fps,sprint,...r};fs.appendFileSync(out+'.ndjson',JSON.stringify(row)+'\n');
   let consecutive=0,longest=0;for(const f of r.frames){consecutive=Math.abs(f.feet-f.ground)>.3?consecutive+1:0;longest=Math.max(longest,consecutive);}
   const{frames,...summary}=row;rows.push({...summary,frameCount:frames.length,maxFootGroundDifference:Math.max(0,...frames.map(f=>Math.abs(f.feet-f.ground))),overBudgetFrames:frames.filter(f=>Math.abs(f.feet-f.ground)>.3).length,longestOverBudgetSeconds:longest/fps});
   console.log(JSON.stringify({completed:rows.length,name:def.name,fps,sprint,arrived:r.arrived,peak:rows.at(-1).maxFootGroundDifference}));
  }
  headProbes.push({name:'taihe-main-view',x:0,z:taiheView,feet:9.9375},{name:'zhonghe-front-inside',x:0,z:62,feet:8.6},{name:'baohe-west-side-room-door',x:19.9,z:baoheZ,feet:9});
  for(const p of headProbes){const at=new W.THREE.Vector3(p.x,p.feet+1.7,p.z);p.bodyClear=!W.cm.checkCollision(at,.5);p.nearHeadTriangles=new W.THREE.Raycaster(at,new W.THREE.Vector3(0,1,0),0,.2).intersectObject(W.scene,true).length;}
  fs.writeFileSync(out,JSON.stringify({scope:process.env.EVIDENCE_SCOPE??'REAL_WORKTREE_WORLD_UNINJECTED_NOT_GPU',definitions,rows,negatives,headProbes},null,2)+'\n');
  assert.equal(rows.length,28);assert.deepEqual(rows.filter(r=>!r.arrived),[],'preserve blocked raw routes; diagnose path versus model before repairs');assert.ok(negatives.every(p=>p.blocked));assert.ok(headProbes.every(p=>p.bodyClear&&p.nearHeadTriangles===0));
  assert.deepEqual(rows.filter(r=>r.maxFootGroundDifference>.3),[],'record actual above-budget stair tracking; do not waive visible gaps as modelling precision');
 }finally{W.dispose();}
});
