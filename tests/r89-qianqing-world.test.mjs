import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {registerHooks} from 'node:module';import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {buildR52World} from './lib/r52-world.mjs';import registry from '../data/characters/index.js';import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {PLAYER} from '../src/config/constants.js';
import {characterBody,bodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';
const path='reports/r89-time-emperor';
test('actual Qianqing B/S floor, sprint round trips, player blockage, time reversal and streaming',async()=>{
 const W=await buildR52World({loadAll:true});let player=null;
 const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
 let loader;try{const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'),{INTERIORS}=await import('../src/scene/interior/registry.js');loader=new InteriorLoader(W.scene,W.cm,{registry:{qianqing:INTERIORS.qianqing}});}finally{hook.deregister();}
 loader.gltf.load=async(_url,ok,_p,error)=>{try{const b=fs.readFileSync('public/models/interiors/qianqing-r33.glb');ok(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),''));}catch(e){error(e);}};
 const s=new CharacterSystem({scene:W.scene,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:null,getPlayerState:()=>player});
 const st=[...s.manager.states.values()].find(x=>x.actor.templateId==='emperor-ceremonial'),r=s.manager.routines;
 const reset=()=>{r.reset([st]);st.binding=s.world.resolve(st.actor,s.metricsFor(st.actor));assert.equal(st.binding.status,'ready');st.interactionSample={position:st.binding.position,rotationYRad:st.binding.rotationYRad};};
 const tick=(minute,dt=.1)=>{const old=st.routineSample?.position,oldPose=st.actor.behavior.basePose;r.update([st],dt,{minutesOfDay:minute});if(old&&st.routineSample&&oldPose==='standing'&&st.actor.behavior.basePose==='standing'){const next=st.routineSample.position;assert.ok(Math.hypot(next[0]-old[0],next[2]-old[2])<=PLAYER.SPRINT_SPEED*Math.min(dt,.1)+1e-6,'no travel teleport');if(player)assert.equal(bodyIntersectsPlayer(characterBody(st.actor,st.routineSample),player),false);if(Math.abs(next[0])<.5&&next[2]>307&&next[2]<315.2)assert.ok(Math.abs(next[1]-2.16)<1e-6,'feet match the permanent/visible hall floor at entry');}};
 const run=(minute,done,max=1200)=>{let n=0;for(;n<max&&!done();n++)tick(minute);assert.ok(done(),JSON.stringify({minute,phase:st.routine?.phase,index:st.routine?.index,pos:st.routineSample?.position,target:st.routine?.points[st.routine.index]}));return n;};
 const report={scope:'actual CPU world, GLTFLoader, InteriorLoader and DailyRoutine; no GPU/mobile',variants:[]};
 try{
  assert.ok(Math.abs(loader._floorY(loader.halls.get('qianqing').cfg)-2.16)<1e-8,'Qianqing S base must be permanent floor, not padded stairs');
  for(const layer of['B','S']){
   if(layer==='S'){assert.equal(await loader.load('qianqing'),true);assert.ok(Math.abs(loader.getGroup('qianqing').position.y-2.16)<1e-8);}
   reset();tick(1260);const initial=structuredClone(st.routineSample);const target=st.routine.points[st.routine.index],dx=target[0]-initial.position[0],dz=target[2]-initial.position[2],d=Math.hypot(dx,dz);player={position:[initial.position[0]+dx/d*.8,initial.position[1],initial.position[2]+dz/d*.8],radius:.35,height:1.7};
   for(let i=0;i<8;i++)tick(1260);assert.equal(st.routineSample.speedMetersPerSecond,0);player=null;
   const nightFrames=run(1260,()=>st.routine?.phase==='working');assert.deepEqual(st.routineSample.position,[0,2.96,322.06]);
   for(const minute of[1439,0,359])tick(minute);assert.equal(st.routine.phase,'working');
   // Occupancy also gates the seated-to-standing return, preserving the seated pose.
   player={position:[1.35,2.86,322.1],radius:.35,height:1.7};const seated=structuredClone(st.routineSample);for(let i=0;i<3;i++)tick(360);assert.equal(st.routine.phase,'working');assert.deepEqual(st.routineSample,seated);player=null;
   const dayFrames=run(360,()=>!st.routine);assert.equal(st.actor.behavior.seatVariant,'throne-front-perch');report.variants.push({layer,nightFrames,dayFrames});
   assert.ok(nightFrames<600,'journey uses running speed rather than dense-waypoint frame cap');
  }
  reset();for(let i=0;i<120;i++)tick(1260);const mid=[...st.routineSample.position];tick(360);assert.ok(Math.hypot(st.routineSample.position[0]-mid[0],st.routineSample.position[2]-mid[2])<=1.2+1e-6);run(360,()=>!st.routine);
  reset();tick(1260);run(1260,()=>st.routineSample.position[2]>308);const before=[...st.routineSample.position];loader.unload('qianqing');tick(1260);assert.equal(st.routineSample.position[1],before[1]);assert.equal(await loader.load('qianqing'),true);tick(1260);assert.equal(st.routineSample.position[1],before[1]);run(1260,()=>st.routine?.phase==='working');run(360,()=>!st.routine);
  // A fresh 21:00 jump during return must never relocate the walking actor.
  reset();tick(1260);run(1260,()=>st.routine?.phase==='working');for(let i=0;i<80;i++)tick(360);tick(1260);run(1260,()=>st.routine?.phase==='working');run(360,()=>!st.routine);
  report.timeReversal=true;report.streaming=true;report.actors=s.manager.states.size;fs.mkdirSync(path,{recursive:true});fs.writeFileSync(path+'/qianqing-world.json',JSON.stringify(report,null,2)+'\n');
 }finally{s.dispose();loader.dispose();W.dispose();}
});
