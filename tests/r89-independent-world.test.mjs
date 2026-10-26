import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {buildR52World} from './lib/r52-world.mjs';
import registry from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {PLAYER} from '../src/config/constants.js';
import {staticRoutineNavigation} from '../src/scene/characters/RoutinePath.js';
import {characterBody,bodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';
const report={scope:'Independent CPU actual-world review; no GPU/mobile-browser evidence',variants:[],maximumFrameXZ:0,maximumStepDown:0,maximumStepUp:0,maximumSubstepXZ:0};

test('independent actual B/S 60/10Hz round trips, precise movement budgets, rail rejection and seat/return occupancy',async()=>{
 const W=await buildR52World({loadAll:true}); let player=null,loader;
 const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
 try {const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');const {INTERIORS}=await import('../src/scene/interior/registry.js');loader=new InteriorLoader(W.scene,W.cm,{registry:{qianqing:INTERIORS.qianqing}});} finally {hook.deregister();}
 loader.gltf.load=async(_url,ok,_p,error)=>{try{const b=fs.readFileSync('public/models/interiors/qianqing-r33.glb');ok(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),''));}catch(e){error(e);}};
 const s=new CharacterSystem({scene:W.scene,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:null,getPlayerState:()=>player});
 const st=[...s.manager.states.values()].find(x=>x.actor.templateId==='emperor-ceremonial'),r=s.manager.routines;
 const originalAdvance=r.advanceWork;
 r.advanceWork=function(state,dt){
  const original=this.nav.getValidPosition.bind(this.nav);
  this.nav.getValidPosition=(from,goal,...args)=>{
   const proposed=Math.hypot(goal.x-from.x,goal.z-from.z);assert.ok(proposed<=.150000001);report.maximumSubstepXZ=Math.max(report.maximumSubstepXZ,proposed);
   const answer=original(from,goal,...args);return answer;
  };
  return originalAdvance.call(this,state,dt);
 };
 const reset=()=>{player=null;r.reset([st]);st.binding=s.world.resolve(st.actor,s.metricsFor(st.actor));assert.equal(st.binding.status,'ready');st.interactionSample={position:st.binding.position,rotationYRad:st.binding.rotationYRad};};
 const tick=(minute,dt=.1)=>{
  const before=r.current(st),oldPose=st.actor.behavior.basePose;r.update([st],dt,{minutesOfDay:minute});const after=r.current(st);
  if(oldPose==='standing'&&st.actor.behavior.basePose==='standing'){
   const d=Math.hypot(after.position[0]-before.position[0],after.position[2]-before.position[2]);const cap=PLAYER.SPRINT_SPEED*Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1));assert.ok(d<=cap+1e-6,JSON.stringify({d,cap,before,after}));report.maximumFrameXZ=Math.max(report.maximumFrameXZ,d);
   const dy=after.position[1]-before.position[1];report.maximumStepDown=Math.max(report.maximumStepDown,-dy);report.maximumStepUp=Math.max(report.maximumStepUp,dy);
   assert.ok(after.position.every(Number.isFinite));if(player)assert.equal(bodyIntersectsPlayer(characterBody(st.actor,after),player),false);
  }
 };
 const run=(minute,predicate,dt=.1,max=5000)=>{let n=0;for(;n<max&&!predicate();n++)tick(minute,dt);assert.ok(predicate(),JSON.stringify({n,minute,phase:st.routine?.phase,index:st.routine?.index,pos:r.current(st).position}));return n;};
 try{
  assert.equal(s.manager.states.size,108);
  for(const layer of['B','S']){
   if(layer==='S')assert.equal(await loader.load('qianqing'),true);
   for(const dt of[.1,1/60]){
    reset();tick(1259,dt);assert.equal(st.routine,undefined);tick(1260,dt);const start=[...r.current(st).position];
    for(const invalidDt of[0,-1,NaN,Infinity]){tick(1260,invalidDt);assert.deepEqual(r.current(st).position,start);}
    tick(1260,1000);
    const nf=run(1260,()=>st.routine?.index===st.routine?.points.length,dt);
    assert.equal(st.actor.behavior.basePose,'standing');
    player={position:[0,2.96,322.06],radius:.35,height:1.7};const preSeat=structuredClone(st.routineSample);for(let i=0;i<3;i++)tick(1260,dt);assert.deepEqual(st.routineSample,preSeat);assert.equal(st.routine.phase,'to-work');player=null;tick(1260,dt);assert.equal(st.routine.phase,'working');
    for(const minute of[1439,0,359])tick(minute,dt);assert.equal(st.routine.phase,'working');
    player={position:[1.35,2.86,322.1],radius:.35,height:1.7};const seated=structuredClone(st.routineSample);for(let i=0;i<3;i++)tick(360,dt);assert.deepEqual(st.routineSample,seated);assert.equal(st.routine.phase,'working');player=null;
    const df=run(360,()=>!st.routine,dt);assert.equal(st.actor.behavior.seatVariant,'throne-front-perch');assert.equal(st.actor.id,'taihe-emperor-01');
    report.variants.push({layer,dt,nightTravelSeconds:(nf+2)*dt,returnSeconds:df*dt});
   }
  }
  // Prove actual S rail remains solid for a direct old-side approach.
  const nav=staticRoutineNavigation(W.cm),from=new THREE.Vector3(1.6,2.86+PLAYER.HEIGHT,317.8),goal=new THREE.Vector3(1.6,from.y,318.4);
  const rejected=nav.getValidPosition(from,goal,.36,2.86,PLAYER.STEP_UP,2.86);assert.ok(rejected.z<318.1);report.railRejectedAt=rejected.toArray();
  // Unload/reload while seated, then again while standing in the hall.
  reset();tick(1260);run(1260,()=>st.routine?.phase==='working');const seat=structuredClone(st.routineSample);loader.unload('qianqing');tick(1260);assert.deepEqual(st.routineSample,seat);assert.equal(await loader.load('qianqing'),true);tick(1260);assert.deepEqual(st.routineSample,seat);
  tick(360);const standing=structuredClone(st.routineSample);loader.unload('qianqing');tick(360,0);assert.deepEqual(st.routineSample.position,standing.position);assert.equal(await loader.load('qianqing'),true);tick(360,0);assert.deepEqual(st.routineSample.position,standing.position);run(360,()=>!st.routine);
  reset();tick(1260);for(let i=0;i<80;i++)tick(1260);tick(360);for(let i=0;i<50;i++)tick(360);tick(1260);run(1260,()=>st.routine?.phase==='working');run(360,()=>!st.routine);
  report.streamingAndTimeJumps=true;fs.writeFileSync('reports/r89-time-emperor/independent-review/world-extensions-portable.json',JSON.stringify(report,null,2)+'\n');
 } finally {s.dispose();loader.dispose();W.dispose();}
});
