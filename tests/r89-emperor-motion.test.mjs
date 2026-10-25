import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {DailyRoutine} from '../src/scene/characters/DailyRoutine.js';
import {CollisionManager} from '../src/utils/Collision.js';import {PLAYER} from '../src/config/constants.js';
import {characterBody,bodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';
function flat({points=Array.from({length:101},(_,i)=>[i*.05,0,0]),player=null}={}){
 const cm=new CollisionManager();cm.rivers=[];cm.moats=[];
 const actor={id:'emperor-test',templateId:'emperor-ceremonial',zoneRef:'test',placement:{mode:'fixed'},behavior:{basePose:'standing'}};
 const state={actor,dayActor:actor,binding:{},routine:{kind:'work',phase:'to-work',points,index:1,daySample:{position:points[0],rotationYRad:0}},routineSample:{position:[...points[0]],rotationYRad:0,speedMetersPerSecond:0}};
 const routine=new DailyRoutine({world:{},collisionManager:cm,interaction:{getPlayerState:()=>player},registry:{}});
 return{cm,state,routine,setPlayer:p=>{player=p;}};
}
test('emperor covers the actual player sprint distance across many small waypoints, independent of frame rate',()=>{
 for(const dt of[1/60,.1]){const {state,routine}=flat();for(let t=0;t<.1-1e-8;t+=dt)routine.update([state],dt,{minutesOfDay:1260});assert.ok(Math.abs(state.routineSample.position[0]-PLAYER.SPRINT_SPEED*.1)<1e-8,JSON.stringify({dt,actual:state.routineSample.position[0],expected:PLAYER.SPRINT_SPEED*.1}));assert.equal(state.routineSample.speedMetersPerSecond,PLAYER.SPRINT_SPEED);}
});
test('low-FPS emperor sweep cannot cross a thin wall between clear frame endpoints',()=>{
 const {cm,state,routine}=flat({points:[[0,0,0],[10,0,0]]});cm.addCollider(new THREE.Box3(new THREE.Vector3(.65,0,-1),new THREE.Vector3(.67,3,1)),'thin-wall');
 for(let i=0;i<8;i++)routine.update([state],.5,{minutesOfDay:1260});assert.ok(state.routineSample.position[0]<.65-.36);assert.equal(state.routineSample.speedMetersPerSecond,0);
});
test('low-FPS running emperor pauses at player, never penetrates, then resumes at sprint speed',()=>{
 const player={position:[.9,0,0],radius:.35,height:1.7},{state,routine,setPlayer}=flat({points:[[0,0,0],[10,0,0]],player});
 for(let i=0;i<8;i++){routine.update([state],.5,{minutesOfDay:1260});assert.equal(bodyIntersectsPlayer(characterBody(state.actor,state.routineSample),player),false);assert.ok(state.routineSample.position[0]<.9);}
 assert.equal(state.routineSample.speedMetersPerSecond,0);setPlayer(null);const before=state.routineSample.position[0];routine.update([state],.1,{minutesOfDay:1260});assert.ok(Math.abs(state.routineSample.position[0]-before-PLAYER.SPRINT_SPEED*.1)<1e-8);
});
