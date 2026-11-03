import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CharacterInteraction} from '../../src/scene/characters/CharacterInteraction.js';
import {characterBody,bodyIntersectsPlayer} from '../../src/scene/characters/CharacterBody.js';
import {PatrolController} from '../../src/scene/characters/PatrolController.js';
import {furnitureDynamicSweep,furnitureScope} from '../../src/controls/FurnitureMotion.js';
import {buildWestWorld} from './west-world.mjs';

const actor={id:'chuxiu-maid-02',templateId:'maid-daily',placement:{mode:'path',pathRef:'chuxiu-maid-02-r54-stroll'},behavior:{basePose:'standing',speedMetersPerSecond:.48,pauseSeconds:3}};
test('patrol cannot enter the actual Chuxiu square player footprint at its circular edge',async()=>{
 const w=await buildWestWorld();let interaction;
 try{
 const player={position:[98.71928039071275,0,413.2119234140886],radius:.5,height:1.7},feet=new THREE.Vector3(...player.position);
 assert.equal(furnitureScope(w.cm,feet,feet,.5,0,undefined,0),true,'real Chuxiu court uses furniture square collision');
 const path={status:'ready',points:[[97.8,0,414],[101.8,0,414]]},patrol=new PatrolController({path,speedMetersPerSecond:.48,pauseSeconds:3,formationSize:1}),state={actor,binding:{position:path.points[0],rotationYRad:Math.PI/2},patrol,readiness:1};
 interaction=new CharacterInteraction({collisionManager:w.cm,getPlayerState:()=>player,registry:{actors:[actor]}});
 let stopped=false;
 for(let i=0;i<600;i++){
  interaction.begin([state],1/60);const sample=interaction.samples.get(actor.id);if(!sample)continue;
  const body=characterBody(actor,sample);
  assert.equal(bodyIntersectsPlayer(body,player),false,'unchanged circular exclusion');
  assert.equal(furnitureDynamicSweep(feet,feet,body,.5,1.7),null,`frame ${i}: NPC must not enter player square geometry`);
  stopped ||= interaction.last.blockedGroups>0;
 }
 assert.equal(stopped,true,'patrol stops before the real player contact boundary');
 }finally{interaction?.dispose();w.dispose();}
});

test('square body contact distinguishes corners, clear edges, vertical separation and ordinary circle semantics',()=>{
 const body=characterBody(actor,{position:[.75,0,.75],rotationYRad:0}),player={position:[0,0,0],radius:.5,height:1.7};
 assert.equal(bodyIntersectsPlayer(body,player),false);
 assert.equal(bodyIntersectsPlayer(body,{...player,footprint:'square'}),false,'0.353m corner distance exceeds capsule radius');
 const corner=characterBody(actor,{position:[.7,0,.7],rotationYRad:0});
 assert.equal(bodyIntersectsPlayer(corner,player),false);
 assert.equal(bodyIntersectsPlayer(corner,{...player,footprint:'square'}),true,'real square corner contact must be recognized');
 assert.equal(bodyIntersectsPlayer(corner,{...player,position:[0,3,0],footprint:'square'}),false);
});

test('late activation waits at the square corner while the same circle-only location remains unchanged',async()=>{
 const w=await buildWestWorld();const {CollisionManager}=await import('../../src/utils/Collision.js');let local,ordinary;
 try{
 let player={position:[94.8,0,414.4],radius:.5,height:1.7};
 const stationary={...actor,placement:{mode:'surface'}},binding={position:[95.5,0,415.1],rotationYRad:0};
 const makeState=()=>({actor:stationary,binding,readiness:1});
 const localState=makeState(),ordinaryState=makeState(),registry={actors:[stationary]};
 local=new CharacterInteraction({registry,collisionManager:w.cm,getPlayerState:()=>player});
 ordinary=new CharacterInteraction({registry,collisionManager:new CollisionManager(),getPlayerState:()=>player});
 local.begin([localState],1/60);ordinary.begin([ordinaryState],1/60);
 assert.equal(local.getPlayerState().footprint,'square');assert.equal(ordinary.getPlayerState().footprint,'circle');
 assert.equal(local.samples.has(actor.id),false);assert.equal(local.last.activationWaiting,1);
 assert.equal(ordinary.samples.has(actor.id),true,'ordinary circular contact unchanged');
 player={...player,position:[94.8,0,413.4]};local.begin([localState],1/60);
 assert.equal(local.samples.has(actor.id),true,'moving clear permits activation again');
 player=null;assert.equal(local.getPlayerState(),null,'flight does not gain a pedestrian body');
 }finally{local?.dispose();ordinary?.dispose();w.dispose();}
});
