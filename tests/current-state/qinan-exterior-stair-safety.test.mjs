import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildWorld} from '../lib/world.mjs';
import {qinanGeometry} from '../../src/scene/palace/special/QinanProfile.js';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {traceProfileSupports} from '../lib/profile-support-trace.mjs';
const W=await buildWorld(),item=W.zones.find(z=>z.json.id==='garden').json.items.find(i=>i.qinanProfile),g=qinanGeometry(item);

// Safety-only bounded incidental climbs: reverse at lower/middle/upper treads.
// This is NOT an accepted terrace approach, platform loop or entrance route.
for(const stair of g.stairs) for(const tread of [2,5,8]) for(const fps of [60,10]) for(const sprint of [false,true]) for(const backward of [false,true]) {
 test(`incidental ${stair.side} stair reversal at tread ${tread}: ${fps}Hz, sprint=${sprint}, backward=${backward}`,t=>{
  const cm=new CollisionManager();for(const c of W.cm.colliders)cm.addCollider(c.mesh,c.tag);for(const w of W.cm.walkables)cm.addWalkable(w.type==='box'?{...w,rescue:false}:w,w.tag);
  const identities=new Map();for(const s of g.supports){const matches=cm.walkables.filter(w=>w.tag==='garden'&&w.type==='box'&&w.box.min.toArray().every((v,i)=>Math.abs(v-s.min[i])<1e-8)&&w.box.max.toArray().every((v,i)=>Math.abs(v-s.max[i])<1e-8));assert.equal(matches.length,1,s.supportId);identities.set(matches[0],s.supportId);}
  const step=g.steps.find(s=>s.supportId===`qinan-${stair.side}-step-${String(tread).padStart(2,'0')}`),z=g.z+(stair.minZ+stair.maxZ)/2;
  const origin=[stair.xToe+stair.sign*2,z],turn=[(step.minX+step.maxX)/2,z],points=[origin,turn,origin],trace=traceProfileSupports(cm,identities);let result;
  const controllerStates=[],update=FirstPersonControls.prototype.update;
  const observer=t.mock.method(FirstPersonControls.prototype,'update',function(...args){
   const before={feet:this.feetY,ground:this.groundY,airborne:this.airborne,verticalVelocity:this.verticalVelocity},dt=Math.min((performance.now()-this.prevTime)/1000,.1);
   const value=update.apply(this,args),x=this.camera.position.x-this.bobOffset.x,z=this.camera.position.z-this.bobOffset.z;
   const logicalBody=new W.THREE.Vector3(x,Math.max(this.feetY,this.groundY)+PLAYER.HEIGHT,z);
   controllerStates.push({x,z,feet:this.feetY,ground:this.groundY,airborne:this.airborne,onSupport:this.onSupport,verticalVelocity:this.verticalVelocity,before,dt,logicalBodyCollision:cm.checkCollision(logicalBody,.5)});return value;
  });
  try{result=replayTerrace(t,{...W,cm},points,{fps,sprint,backward,recordFrames:true});}finally{trace.restore();observer.mock.restore();}
  const unsafe=trace.samples.filter(s=>s.source!=='ground'&&!s.source.startsWith(`qinan-${stair.side}-step-`));
  const maxRise=Math.max(0,...trace.samples.map(s=>s.height-s.feetIn)),maxQueryGap=Math.max(0,...trace.samples.map(s=>s.feetIn-s.height));
  const maxFrameDrop=Math.max(0,...controllerStates.slice(1).map((f,i)=>controllerStates[i].feet-f.feet));
  const maxFrameSupportDrop=Math.max(0,...controllerStates.slice(1).map((f,i)=>controllerStates[i].ground-f.ground));
  const maxSupportTransitionDrop=Math.max(0,...trace.samples.slice(1).map((s,i)=>trace.samples[i].height-s.height));
  if(process.env.QINAN_NAV_EVIDENCE_DIR){const dir=`${process.env.QINAN_NAV_EVIDENCE_DIR}/incidental-stairs`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/${stair.side}-${tread}-${fps}-${sprint?'sprint-braked':'walk'}-${backward?'backward':'forward'}.json`,JSON.stringify({status:'BOUNDED_SAFETY_ONLY_NOT_TERRACE_ROUTE_ACCEPTANCE',profileHash:g.profileHash,side:stair.side,tread,points,waypointDriver:'physical-crossing-v1 (existing helper, unchanged)',result,controllerStates,maxRise,maxQueryGap,maxFrameDrop,maxFrameSupportDrop,maxSupportTransitionDrop,supportQueries:trace.samples},null,2)+'\n');}
  assert.equal(result.startFeet,0);assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.ok(result.maxFeet>0,'must actually enter a physical stair tread');assert.equal(result.end[2],0);
  assert.deepEqual(unsafe,[],'no platform, wrong stair, rescue or unknown support can count as safety reversal');
  assert.ok(maxRise<=.150001,`substep rise ${maxRise}`);
  assert.ok(maxSupportTransitionDrop<=.150001,`successive actual support queries drop ${maxSupportTransitionDrop}`);
  // Production smooths uphill and uses gravity downhill. Measure actual frame
  // drops, not the gap between smoothed feet and a prospective support query.
  // STEP_UP is context only, not a new descent-safety standard. Independently
  // account for each vertical frame using the unchanged smoothing/gravity law.
  for(const state of controllerStates){
   let feet=state.before.feet,v=state.before.verticalVelocity,air=state.before.airborne;const ground=state.ground,dt=state.dt;
   if(!air&&ground<feet-PLAYER.STEP_UP){air=true;v=0;}
   if(air){
    if(feet<ground){feet=ground;if(v<=0){v=0;air=false;}}
    if(air){v=Math.max(v-PLAYER.GRAVITY*dt,-PLAYER.MAX_FALL_SPEED);feet+=v*dt;if(v<=0&&feet<=ground){feet=ground;v=0;air=false;}}
   }else if(ground>=feet-.02){v=0;feet+=(ground-feet)*(1-Math.exp(-14*dt));if(Math.abs(ground-feet)<.005)feet=ground;}
   else{v=Math.max(v-9.8*dt,-12);feet+=v*dt;if(feet<=ground){feet=ground;v=0;}}
   assert.ok(Math.abs(state.feet-feet)<1e-8,'actual feet follow gravity/smoothing, never a snap or teleport');
   assert.ok(Math.abs(state.verticalVelocity-v)<1e-8);assert.equal(state.airborne,air);
   assert.equal(state.logicalBodyCollision,false,'the production logical player body does not penetrate solids');
   assert.ok([state.x,state.z,state.feet,state.ground,state.verticalVelocity].every(Number.isFinite));
  }
  assert.ok(controllerStates.every(f=>f.feet>=0&&f.ground>=0),'no fall below world ground');
  assert.equal(controllerStates.at(-1).airborne,false,'settled back on ground after the bounded reversal');
  assert.equal(controllerStates.at(-1).verticalVelocity,0);

 });
}
