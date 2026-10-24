// Standalone CPU regression. Copy imports to ../src and ../data when promoting into tests/.
import assert from 'node:assert/strict';
import {DailyRoutine} from '../src/scene/characters/DailyRoutine.js';
import {CollisionManager} from '../src/utils/Collision.js';
import registry from '../data/characters/index.js';
import {NIGHT_BEDS} from '../src/scene/characters/NightBeds.js';
const actor=registry.actors.find(a=>a.id==='chuxiu-maid-01'),bed=NIGHT_BEDS.find(b=>b.actorId===actor.id),sleep=[bed.x,bed.floorY+.6,bed.z];
let player={position:[bed.x,sleep[1]+.7,bed.z],radius:.35,height:1.7};
const routine=new DailyRoutine({world:{isZoneReady:()=>true},collisionManager:new CollisionManager(),interaction:{groups:new Map(),getPlayerState:()=>player},registry});
const day=[bed.x+12,bed.floorY,bed.z],points=[day,[bed.x+6,bed.floorY,bed.z],[bed.x,bed.floorY,bed.z]], originalPoints=structuredClone(points);
const state={actor:routine.effective(actor,'sleeping'),dayActor:actor,binding:{position:day,rotationYRad:0},routineSample:{position:sleep,rotationYRad:0},routine:{kind:'bed',bed,points,index:points.length,phase:'sleeping',daySample:{position:day,rotationYRad:0},originalBinding:{position:day,rotationYRad:0},originalPatrol:null}};
for(let i=0;i<3;i++){routine.update([state],.1,{minutesOfDay:360});assert.equal(state.routine.phase,'sleeping');assert.deepEqual(state.routine.points,originalPoints,'blocked wake must not destructively reverse/truncate the route');assert.equal(state.routine.index,originalPoints.length);}
player=null;
routine.update([state],.1,{minutesOfDay:360});
assert.equal(state.routine.phase,'return');
assert.equal(state.routine.points.length,4);
for(let i=0;i<3;i++)routine.update([state],.1,{minutesOfDay:360});
assert.ok(state.routine,'must walk original return path, not teleport to daytime binding');
assert.ok(Math.hypot(state.routineSample.position[0]-day[0],state.routineSample.position[2]-day[2])>10);
console.log('PASS: three blocked wake ticks preserve the checked route and release resumes walking.');
