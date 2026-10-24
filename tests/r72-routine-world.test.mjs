import assert from 'node:assert/strict';
import test from 'node:test';
import {buildR52World} from './lib/r52-world.mjs';
import registry from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
test('all 28 women continuously reach individual beds and return at six without changing IDs',async()=>{
const W=await buildR52World({loadAll:true}),s=new CharacterSystem({scene:W.scene,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:null});
const states=[...s.manager.states.values()].filter(st=>['consort-daily','maid-daily'].includes(st.actor.templateId));for(const st of states){st.binding=s.world.resolve(st.actor,s.metricsFor(st.actor));if(st.binding.status!=='ready')throw Error(st.actor.id+': '+st.binding.reason);if(st.actor.placement.mode==='path')st.patrol=s.manager.patrolFactory(st.actor,st.binding);st.interactionSample=st.patrol?.sample(0,st.actor.behavior.followerIndex??0)??{position:st.binding.position,rotationYRad:st.binding.rotationYRad};}
for(let i=0;i<2200;i++)s.manager.routines.update(states,.1,{minutesOfDay:1260});
const results=states.filter(st=>st.routine).map(st=>({id:st.actor.id,kind:st.routine.kind,phase:st.routine.phase,index:st.routine.index,length:st.routine.points.length,pos:st.routineSample.position,target:st.routine.points[st.routine.index]}));
assert.equal(results.length,28);assert.ok(results.every(r=>r.phase==='sleeping'),JSON.stringify(results.filter(r=>r.phase!=='sleeping')));
assert.equal(new Set(states.map(st=>st.routine.bed.id)).size,28);
for(const st of states){assert.equal(st.actor.behavior.basePose,'sleeping');assert.ok(Math.abs(st.routineSample.position[1]-st.routine.bed.floorY-.60)<1e-8);}
for(let i=0;i<2200;i++)s.manager.routines.update(states,.1,{minutesOfDay:360});
assert.ok(states.every(st=>!st.routine),JSON.stringify(states.filter(st=>st.routine).map(st=>st.actor.id)));assert.equal(registry.actors.length,108);
s.dispose();W.dispose();
});
