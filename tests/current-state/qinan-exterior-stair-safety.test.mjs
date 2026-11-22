import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildWorld} from '../lib/world.mjs';
import {qinanGeometry} from '../../src/scene/palace/special/QinanProfile.js';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {traceProfileSupports} from '../lib/profile-support-trace.mjs';
// Exercise the registered world by reference: private source ownership does
// not transfer to a copy, and no rescue switch is changed.
const W=await buildWorld({realMaterials:true,realFinish:true});
const garden=W.zones.find(z=>z.json.id==='garden').json;
const item=garden.items.find(i=>i.qinanProfile),g=qinanGeometry(item);
const box=b=>[...b.min.toArray(),...b.max.toArray()];
function fingerprint(cm){
 const hash=createHash('sha256'),record=row=>hash.update(JSON.stringify(row)).update('\n');
 record([cm.colliders.length,cm.walkables.length]);
 for(const c of cm.colliders){
  const triangle=c.triangleSupport,surface=c.xiqingRoofSurface;
  record([c.tag,box(c.box),triangle?.id,triangle?.offset.toArray(),c.duixiuTerrain,c.overhead,c.furnitureMotionScope,
   surface&&[surface.id,surface.kind,box(surface.box),surface.template.sourceFaces]]);
 }
 for(const w of cm.walkables)record(w.type==='box'
  ? [w.type,w.tag,box(w.box),w.rescue,w.sideGateGalleryDeck]
  : [w.type,w.tag,w.axis,w.minX,w.maxX,w.minZ,w.maxZ,w.a0,w.a1,w.y0,w.y1,w.crossMin0,w.crossMax0,w.crossMin1,w.crossMax1]);
 return hash.digest('hex');
}
const cm=W.cm, colliders=cm.colliders.slice(), walkables=cm.walkables.slice();
const savedRegistration=fingerprint(cm);
function verifyRegistration(){
 assert.ok(cm.colliders.length===colliders.length&&cm.colliders.every((row,i)=>row===colliders[i]),'full-city collider identity/order remains live');
 assert.ok(cm.walkables.length===walkables.length&&cm.walkables.every((row,i)=>row===walkables[i]),'full-city support identity/order remains live');
 assert.equal(cm.dynamicBodies.size,0);
}
test.after(()=>{
 try {
  verifyRegistration();
  assert.equal(fingerprint(cm),savedRegistration,'all registered bounds, shapes and rescue flags stay unchanged');
 } finally {W.dispose();}
});

// Independent, conservative witness for the generic rescue subsidy in
// CollisionManager.getGroundHeight: fail even if an eligible raised box would
// be masked by a still-higher answer. Do not disable rescue or rewrite rows.
function watchRescue(manager){
 const original=manager.getGroundHeight, candidates=manager.walkables.filter(w=>w.type==='box'&&w.rescue);
 const counts={query:0,before:0,after:0};let hit=null;
 function pose(stage,x,z,feet,stepUp=PLAYER.STEP_UP){
  counts[stage]++;
  assert.ok([x,z,feet,stepUp].every(Number.isFinite),'finite Qin’an rescue observation');
  for(const w of candidates){
   const b=w.box;
   if(b.max.y>feet+stepUp&&x>b.min.x+.6&&x<b.max.x-.6&&z>b.min.z+.6&&z<b.max.z-.6){
    hit??={stage,x,z,feet,stepUp,tag:w.tag,box:box(b)};
    break;
   }
  }
 }
 manager.getGroundHeight=function(x,z,feet=0,stepUp=.6,...rest){
  pose('query',x,z,feet,stepUp);
  return original.call(this,x,z,feet,stepUp,...rest);
 };
 return {pose,counts,get hit(){return hit;},restore(){manager.getGroundHeight=original;}};
}

test.before(()=>{
 // Negative control uses another real manager, not the registered world.
 // The same tall walkable raises the true answer only with rescue enabled.
 const local=new CollisionManager(),z=g.z+(g.stairs[0].minZ+g.stairs[0].maxZ)/2,x=g.stairs[0].xToe-2;
 for(const rescue of [true,false]){
  local.addWalkable({type:'box',rescue,box:new W.THREE.Box3(
   new W.THREE.Vector3(x-2,0,z-2),new W.THREE.Vector3(x+2,2,z+2))},'qinan-rescue-control');
  const witness=watchRescue(local);
  try {
   assert.equal(local.getGroundHeight(x,z,0,.6),rescue?2:0);
   assert.equal(witness.counts.query,1);
   assert.equal(witness.hit?.tag,rescue?'qinan-rescue-control':undefined);
  } finally {witness.restore();local.clear();}
 }
});

// Safety-only bounded incidental climbs: reverse at lower/middle/upper treads.
// This is NOT an accepted terrace approach, platform loop or entrance route.
for(const stair of g.stairs) for(const tread of [2,5,8]) for(const fps of [60,10]) for(const sprint of [false,true]) for(const backward of [false,true]) {
 test(`incidental ${stair.side} stair reversal at tread ${tread}: ${fps}Hz, sprint=${sprint}, backward=${backward}`,t=>{
  verifyRegistration();
  // Preserve the manager's physical rows and owners; restore only the scratch
  // state and observers used by the latest trial. Each controller is fresh.
  const scratch=['lastGroundY','lastDuixiuStepFeet','lastFurnitureStepFeet','getGroundHeight','getValidPosition'];
  const saved=scratch.map(key=>[key,Object.getOwnPropertyDescriptor(cm,key)]);
  t.after(()=>{
   try {verifyRegistration();}
   finally {
    for(const [key,descriptor] of saved)if(descriptor)Object.defineProperty(cm,key,descriptor);else delete cm[key];
    t.mock.reset();
   }
  });
  const identities=new Map();for(const s of g.supports){const matches=cm.walkables.filter(w=>w.tag==='garden'&&w.type==='box'&&w.box.min.toArray().every((v,i)=>Math.abs(v-s.min[i])<1e-8)&&w.box.max.toArray().every((v,i)=>Math.abs(v-s.max[i])<1e-8));assert.equal(matches.length,1,s.supportId);identities.set(matches[0],s.supportId);}
  const step=g.steps.find(s=>s.supportId===`qinan-${stair.side}-step-${String(tread).padStart(2,'0')}`),z=g.z+(stair.minZ+stair.maxZ)/2;
  const origin=[stair.xToe+stair.sign*2,z],turn=[(step.minX+step.maxX)/2,z],points=[origin,turn,origin];
  const rescue=watchRescue(cm),trace=traceProfileSupports(cm,identities);let result;
  const controllerStates=[],update=FirstPersonControls.prototype.update;
  const observer=t.mock.method(FirstPersonControls.prototype,'update',function(...args){
   const before={feet:this.feetY,ground:this.groundY,airborne:this.airborne,verticalVelocity:this.verticalVelocity},dt=Math.min((performance.now()-this.prevTime)/1000,.1);
   rescue.pose('before',this.camera.position.x-this.bobOffset.x,this.camera.position.z-this.bobOffset.z,before.feet);
   const value=update.apply(this,args),x=this.camera.position.x-this.bobOffset.x,z=this.camera.position.z-this.bobOffset.z;
   rescue.pose('after',x,z,this.feetY);
   const logicalBody=new W.THREE.Vector3(x,Math.max(this.feetY,this.groundY)+PLAYER.HEIGHT,z);
   controllerStates.push({x,z,feet:this.feetY,ground:this.groundY,airborne:this.airborne,onSupport:this.onSupport,verticalVelocity:this.verticalVelocity,before,dt,logicalBodyCollision:cm.checkCollision(logicalBody,.5)});return value;
  });
  try{result=replayTerrace(t,{...W,cm},points,{fps,sprint,backward,recordFrames:true});}finally{trace.restore();rescue.restore();observer.mock.restore();}
  assert.ok(trace.samples.length>0&&controllerStates.length>0,'actual query and pose evidence is not empty');
  assert.deepEqual(rescue.counts,{query:trace.samples.length,before:controllerStates.length,after:controllerStates.length},'observe every actual support call and frame');
  assert.equal(rescue.hit,null,JSON.stringify(rescue.hit));
  const unsafe=trace.samples.filter(s=>s.source!=='ground'&&!s.source.startsWith(`qinan-${stair.side}-step-`));
  const maxRise=Math.max(0,...trace.samples.map(s=>s.height-s.feetIn)),maxQueryGap=Math.max(0,...trace.samples.map(s=>s.feetIn-s.height));
  const maxFrameDrop=Math.max(0,...controllerStates.slice(1).map((f,i)=>controllerStates[i].feet-f.feet));
  const maxFrameSupportDrop=Math.max(0,...controllerStates.slice(1).map((f,i)=>controllerStates[i].ground-f.ground));
  const maxSupportTransitionDrop=Math.max(0,...trace.samples.slice(1).map((s,i)=>trace.samples[i].height-s.height));
  // One maximum sprint frame plus body radius bounds the original out/back sweep.
  const margin=PLAYER.SPRINT_SPEED*.1+.5;
  const low=Math.min(origin[0],turn[0])-margin,high=Math.max(origin[0],turn[0])+margin;
  assert.ok(low>garden.bounds.x0&&high<garden.bounds.x1&&z-margin>garden.bounds.z0&&z+margin<garden.bounds.z1,'the full body sweep remains within the resident Garden bounds');
  for(const q of [...trace.samples,...controllerStates]){
   assert.ok(q.x>=low&&q.x<=high&&Math.abs(q.z-z)<=margin,'movement and support queries remain within the bounded stair sweep');
  }
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
