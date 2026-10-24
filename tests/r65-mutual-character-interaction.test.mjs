import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CharacterManager} from '../src/scene/characters/CharacterManager.js';
import {CharacterInteraction} from '../src/scene/characters/CharacterInteraction.js';
import {PatrolController} from '../src/scene/characters/PatrolController.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {characterBody,bodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';

function fixture({formation=1,path=true}={}){
 const actors=Array.from({length:formation},(_,i)=>({id:'guard-'+i,templateId:'guard-duty',priority:'core',zoneRef:'axis',schedule:'guard-duty',placement:path?{mode:'path',pathRef:'route'}:{mode:'surface'},behavior:{basePose:'standing',speedMetersPerSecond:.75,pauseSeconds:3,followerIndex:i,followerSpacingMeters:1.4}}));
 const registry={actors},cm=new CollisionManager();let player={position:[0,0,4],radius:.5,height:1.7},selected=[],revision=1,ready=true;
 const camera=new THREE.PerspectiveCamera(70,1,.1,1000);camera.position.set(0,1.7,4);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 const route={id:'route',status:'ready',points:[[-5,0,0],[5,0,0]],formationSize:formation};
 const interaction=new CharacterInteraction({collisionManager:cm,getPlayerState:()=>player,registry});
 const manager=new CharacterManager({registry,contentEnabled:true,interaction,adapter:{getRevision:()=>revision,resolve:()=>ready?{status:'ready',position:[0,0,0],rotationYRad:0,path:route}:{status:'pending'}},patrolFactory:()=>new PatrolController({path:route,formationSize:formation}),renderer:{render:a=>(selected=a,{}),clear:()=>selected=[],dispose(){}}});
 return{cm,manager,interaction,camera,actors,get selected(){return selected},get player(){return player},setPlayer:p=>player=p,reload(r=true){ready=r;revision++},step(dt=.1,extra={}){manager.update(dt,{camera,...extra});}};
}
test('a stationary player blocks the actual patrol, bounded retreat stays on route, then resume has no catch-up',()=>{
 const f=fixture();f.setPlayer({position:[0,0,0],radius:.5,height:1.7});let sawStop=false,sawRetreat=false,prev=null;
 for(let i=0;i<160;i++){f.step();const s=f.interaction.samples.get('guard-0');assert.ok(s);assert.equal(bodyIntersectsPlayer(characterBody(f.actors[0],s),f.player),false);assert.equal(s.position[1],0);assert.equal(s.position[2],0);if(prev)assert.ok(Math.abs(s.position[0]-prev[0])<=.075001);if(s.speedMetersPerSecond===0&&s.position[0]>-1.1)sawStop=true;sawRetreat ||= f.interaction.last.retreatingGroups>0;prev=s.position;}
 assert.ok(sawStop);assert.ok(sawRetreat);const before=f.interaction.samples.get('guard-0').position[0];f.setPlayer(null);f.step();const after=f.interaction.samples.get('guard-0').position[0];assert.ok(after>before&&after-before<=.075001);f.manager.dispose();
});
for(const formation of[1,3])for(const dt of[1/60,.1])test(`mutual player/NPC sweep, formation=${formation}, dt=${dt}`,()=>{
 const f=fixture({formation});let p=new THREE.Vector3(2,1.7,0);f.setPlayer({position:[p.x,0,0],radius:.5,height:1.7});
 let previous=[];
 for(let i=0;i<Math.ceil(12/dt);i++){
  p=f.cm.getValidPosition(p,new THREE.Vector3(p.x-12*dt,1.7,0),.5,0);f.setPlayer({position:[p.x,0,0],radius:.5,height:1.7});f.step(dt);
  const samples=f.actors.map(a=>f.interaction.samples.get(a.id));
  for(let j=0;j<samples.length;j++){const s=samples[j];if(!s)continue;assert.equal(bodyIntersectsPlayer(characterBody(f.actors[j],s),f.player),false);if(previous[j])assert.ok(Math.abs(s.distanceMeters-previous[j].distanceMeters)<=.75*dt+1e-6);}
  if(samples.every(Boolean))for(let j=1;j<samples.length;j++)assert.ok(Math.abs(samples[j-1].distanceMeters-samples[j].distanceMeters-1.4)<1e-7);
  previous=samples;
 }
 f.manager.dispose();assert.equal(f.cm.dynamicBodies.size,0);
});
test('turning away never removes a near body; toggles, background, revisions and missing support clear ownership',()=>{
 const f=fixture({path:false});f.setPlayer({position:[0,0,2],radius:.5,height:1.7});for(let i=0;i<5;i++)f.step();assert.equal(f.interaction.last.bodies,1);
 f.camera.position.set(0,1.7,2);f.camera.lookAt(0,1.7,20);f.camera.updateMatrixWorld();f.step();assert.equal(f.selected.length,1);assert.equal(f.interaction.last.bodies,1);
 f.step(.1,{hidden:true});assert.equal(f.cm.dynamicBodies.size,0);f.step();assert.equal(f.cm.dynamicBodies.size,1);
 for(let i=0;i<20;i++){f.reload(false);f.step();assert.equal(f.cm.dynamicBodies.size,0);f.reload(true);f.step();assert.equal(f.interaction.last.bodies,1);f.manager.setEnabled(false);assert.equal(f.cm.dynamicBodies.size,0);f.manager.setEnabled(true);f.step();}
 f.manager.dispose();assert.equal(f.cm.dynamicBodies.size,0);assert.equal(f.cm.colliders.length,0);assert.equal(f.cm.walkables.length,0);
});
test('late support activation overlapping a teleported player waits rather than materializing around them',()=>{
 const f=fixture({path:false});f.setPlayer({position:[0,0,0],radius:.5,height:1.7});for(let i=0;i<30;i++)f.step();assert.equal(f.selected.length,0);assert.equal(f.interaction.last.bodies,0);assert.equal(f.interaction.last.activationWaiting,1);assert.equal(f.manager.stats.loaded,1);
 f.setPlayer({position:[0,0,2],radius:.5,height:1.7});f.step();assert.equal(f.selected.length,1);assert.equal(f.interaction.last.bodies,1);assert.ok(f.selected[0].visibility<1);f.manager.dispose();
});
test('flight callback null is not replaced by follow-camera position',()=>{
 const f=fixture();f.setPlayer(null);f.camera.position.set(-4.5,1.7,0);for(let i=0;i<50;i++)f.step();assert.equal(f.interaction.groups.get('route').time,f.manager.simulationSeconds);assert.equal(f.interaction.last.blockedGroups,0);f.manager.dispose();
});

test('a patrol at route-clock zero resumes after a near-start pedestrian leaves',()=>{
 const f=fixture();f.setPlayer({position:[-4,0,0],radius:.5,height:1.7});for(let i=0;i<30;i++)f.step();
 const before=f.interaction.samples.get('guard-0').position[0];f.setPlayer({position:[100,0,0],radius:.5,height:1.7});for(let i=0;i<100;i++)f.step();
 assert.ok(f.interaction.samples.get('guard-0').position[0]>before+1,'must not retain retreat forever at time zero');f.manager.dispose();
});
test('elevated retreat sweeps the same facing that it commits, including legs',()=>{
 const actor={id:'guard',templateId:'guard-duty',placement:{mode:'path',pathRef:'route'},behavior:{basePose:'standing',speedMetersPerSecond:.75}};
 const patrol=new PatrolController({path:{status:'ready',points:[[-5,1,0],[5,1,0]]},formationSize:1}),player={position:[-2.135,0,0],radius:.5,height:1.7};
 const state={actor,binding:{position:[-5,1,0],rotationYRad:Math.PI/2},patrol,interactionActivated:true,readiness:1};
 const interaction=new CharacterInteraction({registry:{actors:[actor]},getPlayerState:()=>player});
 Object.assign(interaction.groups.get('route'),{time:5,retreat:true});interaction.begin([state],.1);
 assert.equal(bodyIntersectsPlayer(characterBody(actor,interaction.samples.get(actor.id)),player),false);interaction.dispose();
});

test('low-tier suppression then high restoration waits when the player occupies an omitted role',()=>{
 const actors=Array.from({length:7},(_,i)=>({id:'official-'+i,templateId:'official-ceremonial',sceneId:'taihe',placement:{mode:'surface'},behavior:{basePose:'standing'},formation:{side:'left',index:i}}));
 const cm=new CollisionManager();let player=null;
 const interaction=new CharacterInteraction({registry:{actors},collisionManager:cm,getPlayerState:()=>player});
 const states=actors.map((actor,i)=>({actor,binding:{position:[i*10,0,0],rotationYRad:0},readiness:1}));
 interaction.begin(states,.1);interaction.commit(states,actors,'low');
 assert.equal(cm.dynamicBodies.get(interaction).length,6);assert.equal(states[6].interactionActivated,false);
 player={position:[60,0,0],radius:.5,height:1.7};interaction.begin(states,.1);interaction.commit(states,actors,'high');
 assert.equal(interaction.samples.has('official-6'),false);assert.equal(interaction.last.activationWaiting,1);
 assert.ok(cm.dynamicBodies.get(interaction).every(body=>!bodyIntersectsPlayer(body,player)));
 player.position[2]=2;interaction.begin(states,.1);states[6].readiness=.1;interaction.commit(states,actors,'high');assert.equal(cm.dynamicBodies.get(interaction).length,7);interaction.dispose();
});
test('near render-budget suppression is a fresh physical activation on restoration',()=>{
 const f=fixture({path:false});f.setPlayer({position:[0,0,2],radius:.5,height:1.7});for(let i=0;i<5;i++)f.step();
 f.interaction.commit(f.manager.states.values(),[],'high');assert.equal(f.cm.dynamicBodies.size,0);
 f.setPlayer({position:[0,0,0],radius:.5,height:1.7});f.step();assert.equal(f.selected.length,0);assert.equal(f.interaction.last.activationWaiting,1);assert.equal(f.cm.dynamicBodies.size,0);f.manager.dispose();
});

test('background-cleared bodies recheck an occupied spawn on resume without refading clear actors',()=>{
 const f=fixture({path:false});f.setPlayer({position:[0,0,2],radius:.5,height:1.7});for(let i=0;i<5;i++)f.step();
 f.step(.1,{hidden:true});assert.equal(f.cm.dynamicBodies.size,0);f.setPlayer({position:[0,0,0],radius:.5,height:1.7});f.step();
 assert.equal(f.selected.length,0);assert.equal(f.cm.dynamicBodies.size,0);assert.equal(f.interaction.last.activationWaiting,1);
 f.setPlayer({position:[0,0,2],radius:.5,height:1.7});for(let i=0;i<5;i++)f.step();assert.equal(f.selected[0].visibility,1);f.step(.1,{hidden:true});f.step();assert.equal(f.selected[0].visibility,1);f.manager.dispose();
});
