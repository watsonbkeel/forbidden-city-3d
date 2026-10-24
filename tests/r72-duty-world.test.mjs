import assert from 'node:assert/strict';
import test from 'node:test';
import {buildR52World} from './lib/r52-world.mjs';
import registry from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
test('all 51 guards and eunuchs keep existing patrols or move near their posts at night',async()=>{
const W=await buildR52World({loadAll:true}),s=new CharacterSystem({scene:W.scene,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:null});
const states=[...s.manager.states.values()].filter(st=>['guard-duty','eunuch-daily'].includes(st.actor.templateId));for(const st of states){st.binding=s.world.resolve(st.actor,s.metricsFor(st.actor));if(st.binding.status!=='ready')throw Error(st.actor.id+': '+st.binding.reason);if(st.actor.placement.mode==='path')st.patrol=s.manager.patrolFactory(st.actor,st.binding);st.interactionSample=st.patrol?.sample(0,st.actor.behavior.followerIndex??0)??{position:st.binding.position,rotationYRad:st.binding.rotationYRad};}
const starts=new Map(states.map(st=>[st.actor.id,[...st.interactionSample.position]]));for(let i=0;i<100;i++){s.manager.routines.update(states,.1,{minutesOfDay:1260});s.interaction.begin(states,.1);}
const results=states.map(st=>({id:st.actor.id,patrol:!!st.patrol,routine:st.routine?.kind,delta:Math.hypot(...s.interaction.samples.get(st.actor.id).position.map((v,i)=>v-starts.get(st.actor.id)[i]))}));assert.equal(results.length,51);assert.equal(results.filter(r=>r.patrol).length,17);assert.equal(results.filter(r=>r.routine==='duty').length,34);assert.ok(results.every(r=>r.delta>.1),JSON.stringify(results.filter(r=>r.delta<=.1)));s.dispose();W.dispose();});
