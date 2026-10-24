import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CharacterManager} from '../src/scene/characters/CharacterManager.js';
import {getBeijingDayCycle} from '../src/scene/sky/BeijingDayCycle.js';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
function fixture(){
 const camera=new THREE.PerspectiveCamera(80,1,.1,2000);camera.position.set(0,1.7,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 let selected=[],revision=1,ready=true;
 const registry={actors:CHARACTER_REGISTRY.actors};
 const manager=new CharacterManager({registry,contentEnabled:true,adapter:{getRevision:()=>revision,resolve:()=>ready?{status:'ready',position:[0,0,0],rotationYRad:0}:{status:'pending'}},renderer:{render:a=>(selected=a,{}),clear:()=>selected=[],dispose(){}}});
 return{manager,camera,get selected(){return selected},reload(){revision++},setReady:r=>ready=r,step(daylight,options={}){manager.update(.1,{camera,daylight,...options});}};
}
const instants=['2026-10-23T17:24:00','2026-10-23T17:24:47','2026-10-23T17:24:48','2026-10-23T17:25:00','2026-10-23T17:26:00','2026-10-23T18:00:00','2026-10-23T23:59:59','2026-10-24T00:00:00','2026-10-24T05:00:00','2026-10-24T07:00:00','2026-06-21T19:46:00','2026-12-21T16:53:00'];
for(const instant of instants)test(`all 108 retain time eligibility at Beijing ${instant}; quality budgets remain distinct`,()=>{
 const f=fixture(),daylight=getBeijingDayCycle(new Date(instant+'+08:00')).lighting.daylight;
 for(let i=0;i<30;i++)f.step(daylight);
 assert.equal(f.manager.stats.loaded,108);assert.ok([...f.manager.states.values()].every(s=>s.activeSchedule===true&&s.visibility===1));
 assert.equal(f.selected.length,64);const ids=f.selected.map(a=>a.id);
 f.step(1);assert.deepEqual(f.selected.map(a=>a.id),ids);
 f.step(daylight,{quality:'low'});assert.equal(f.selected.length,32);assert.ok(f.selected.every(a=>a.visibility===1));f.manager.dispose();
});
test('night offscreen return, hidden resume and rebind keep normal fade/content gates, never the obsolete night disappearance',()=>{
 const f=fixture();for(let i=0;i<5;i++)f.step(0);f.camera.lookAt(0,1,30);f.camera.updateMatrixWorld();f.step(0);assert.equal(f.selected.length,0);
 f.camera.lookAt(0,1,0);f.camera.updateMatrixWorld();f.step(0);assert.equal(f.selected.length,64);
 const time=f.manager.simulationSeconds;f.step(0,{hidden:true});f.step(0);assert.equal(f.manager.simulationSeconds,time);
 f.reload();f.step(0);assert.ok(f.selected.every(a=>a.visibility>0&&a.visibility<1));
 f.manager.setEnabled(false);assert.equal(f.selected.length,0);f.manager.setEnabled(true);f.step(0);assert.equal(f.selected.length,64);
 f.setReady(false);f.reload();f.step(0);assert.equal(f.selected.length,0);assert.equal(f.manager.stats.pending,108);f.manager.dispose();
});
