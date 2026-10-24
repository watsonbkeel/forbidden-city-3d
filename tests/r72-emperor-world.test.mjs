import test from 'node:test';
import assert from 'node:assert/strict';
import {buildR52World} from './lib/r52-world.mjs';
import registry from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
test('single emperor walks from Taihe to Qianqing and returns at six',async()=>{
const W=await buildR52World({loadAll:true}),s=new CharacterSystem({scene:W.scene,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:null});
const states=[...s.manager.states.values()].filter(st=>st.actor.templateId==='emperor-ceremonial');for(const st of states){st.binding=s.world.resolve(st.actor,s.metricsFor(st.actor));if(st.binding.status!=='ready')throw Error(st.actor.id+': '+st.binding.reason);if(st.actor.placement.mode==='path')st.patrol=s.manager.patrolFactory(st.actor,st.binding);st.interactionSample=st.patrol?.sample(0,st.actor.behavior.followerIndex??0)??{position:st.binding.position,rotationYRad:st.binding.rotationYRad};}
for(let i=0;i<12000;i++)s.manager.routines.update(states,.1,{minutesOfDay:1260});
assert.equal(states.length,1);const st=states[0];assert.equal(st.routine.phase,'working');assert.equal(st.actor.behavior.seatVariant,'qianqing-low-foot');assert.deepEqual(st.routineSample.position,[0,2.96,322.06]);
for(let i=0;i<12000;i++)s.manager.routines.update(states,.1,{minutesOfDay:360});assert.equal(st.routine,undefined);assert.equal(st.actor.behavior.seatVariant,'throne-front-perch');assert.equal(st.actor.id,'taihe-emperor-01');
s.dispose();W.dispose();});
