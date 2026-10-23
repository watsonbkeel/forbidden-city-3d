import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CharacterManager} from '../src/scene/characters/CharacterManager.js';
import {selectCharacterBudget,selectCharacterLOD} from '../src/scene/characters/CharacterLOD.js';
const role=(id,distance,lod,priority='core')=>({id,sceneId:'unit-courtyard',templateId:'eunuch-daily',distance,lod,priority});
function crowded(){return [role('emperor',500,2,'essential'),...Array.from({length:98},(_,i)=>role('distant-core-'+i,100+i,2)),role('near-ambient-guard',4,0,'ambient'),role('mid-ambient-attendant',30,1,'ambient')];}
test('near and middle required surroundings are not displaced by distant core crowds under unchanged high64',()=>{
 const actors=crowded(),selected=selectCharacterBudget(actors,'high',actors);
 assert.equal(selected.length,64);for(const id of ['emperor','near-ambient-guard','mid-ambient-attendant'])assert.ok(selected.some(a=>a.id===id),id);
 assert.ok(selected.filter(a=>a.lod===0).length<=2);assert.equal(actors.find(a=>a.id==='near-ambient-guard').lod,0);
});
test('low32 also includes local noncourt roles while retaining essential selection',()=>{
 const actors=crowded().map(a=>({...a,lod:Math.max(1,a.lod)})),selected=selectCharacterBudget(actors,'low',actors);
 assert.equal(selected.length,32);for(const id of ['emperor','near-ambient-guard','mid-ambient-attendant'])assert.ok(selected.some(a=>a.id===id),id);assert.equal(selected.some(a=>a.lod===0),false);
});
test('identity priority remains within the same stable distance band and input order never changes ties',()=>{
 const actors=[role('z-ambient',3,0,'ambient'),role('b-core',5,0),role('a-core',5,0),role('essential',200,2,'essential')];
 const a=selectCharacterBudget(actors,'high',actors),b=selectCharacterBudget([...actors].reverse(),'high',actors);
 assert.deepEqual(a.map(a=>a.id),b.map(a=>a.id));assert.deepEqual(a.map(a=>a.id),['essential','a-core','b-core','z-ambient']);
});

test('already-hysteretic LOD boundaries do not churn selection during small camera jitter',()=>{
 const far=Array.from({length:64},(_,i)=>role('far-core-'+i,150+i,2));
 let lod=0;for(const distance of [11.9,12.1,11.95,12.05,14.15,14.0]){
  lod=selectCharacterLOD({distance,projectedHeight:100,inFrustum:true,previousLOD:lod});assert.equal(lod,0);
  const local=role('local',distance,lod,'ambient');assert.ok(selectCharacterBudget([...far,local],'high').some(a=>a.id==='local'));
 }
 lod=selectCharacterLOD({distance:14.2,projectedHeight:100,inFrustum:true,previousLOD:lod});assert.equal(lod,1);
 for(const distance of [12.1,11.9,12.05,9.85,40.1,39.9,47.19]){lod=selectCharacterLOD({distance,projectedHeight:100,inFrustum:true,previousLOD:lod});assert.equal(lod,1);}
 lod=selectCharacterLOD({distance:47.21,projectedHeight:100,inFrustum:true,previousLOD:lod});assert.equal(lod,2);
 for(const distance of [40.1,39.9,32.81]){lod=selectCharacterLOD({distance,projectedHeight:100,inFrustum:true,previousLOD:lod});assert.equal(lod,2);}
 lod=selectCharacterLOD({distance:32.79,projectedHeight:100,inFrustum:true,previousLOD:lod});assert.equal(lod,1);
});
test('deterministic same candidates and inherited near-slot hysteresis keep render identities stable',()=>{
 const actors=crowded();const expected=selectCharacterBudget(actors,'high',actors).map(a=>[a.id,a.lod]);
 for(let i=0;i<120;i++){const selected=selectCharacterBudget([...actors].reverse(),'high',actors,new Set(['near-ambient-guard']));assert.deepEqual(selected.map(a=>[a.id,a.lod]),expected);}
 const near=[role('a',4,0),role('b',4.2,0),role('c',4.1,0)];
 assert.deepEqual(selectCharacterBudget(near,'high',near,new Set(['a','b'])).filter(a=>a.lod===0).map(a=>a.id).sort(),['a','b']);
});

test('actual low Manager retains the geometric near band even though rendering demotes to LOD1',()=>{
 const actors=[...Array.from({length:36},(_,i)=>({...role('middle-core-'+i,20,1),position:[(i%5)-2,0,20+i*.1],schedule:'daily-daylight',behavior:{basePose:'standing'}})),{...role('near-ambient',4,0,'ambient'),position:[0,0,0],schedule:'daily-daylight',behavior:{basePose:'standing'}}];
 let submitted=[];const manager=new CharacterManager({registry:{actors},enabled:true,contentEnabled:true,adapter:{getRevision:()=>1,resolve:a=>({status:'ready',position:a.position,rotationYRad:0})},renderer:{render:a=>{submitted=a;return{}},clear(){},dispose(){}}});
 const camera=new THREE.PerspectiveCamera(65,16/9,.1,1000);camera.position.set(0,1.7,-4);camera.lookAt(0,1,20);camera.updateMatrixWorld(true);
 for(let i=0;i<100;i++){manager.update(.1,{camera,quality:'low',daylight:1});if(i>10){assert.equal(submitted.length,32);assert.ok(submitted.some(a=>a.id==='near-ambient'),'eye-level ambient survives middle core crowd');assert.equal(submitted.some(a=>a.lod===0),false);}}
 assert.equal(manager.states.get('near-ambient').lod,0);manager.dispose();
});
