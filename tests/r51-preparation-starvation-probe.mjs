// Controlled-cost scheduling reproduction. Rendering cost is simulated; no GPU timing claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {CharacterWorkQueue} from '../src/scene/characters/CharacterWorkQueue.js';
let clock=0;const desc=Object.getOwnPropertyDescriptor(performance,'now');Object.defineProperty(performance,'now',{configurable:true,value:()=>clock});
const queue=new CharacterWorkQueue(),camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,1.7,-10);camera.lookAt(0,1,0);camera.updateMatrixWorld(true);let renders=0;
const adapter={getRevision:()=>1,request:actor=>queue.request(actor.id,function*(){for(let i=0;i<4;i++){clock+=.025;yield{kind:'synthetic-bounded-support',workUnits:1,maxWorkUnits:1};}return{status:'ready',position:[0,0,0],rotationYRad:0};},{version:1,identity:actor.id}),advance:o=>queue.advance({...o,version:1}),cancelPending:()=>queue.cancel(),dispose:()=>queue.dispose(),stats:{},work:queue};
const renderer={render:()=>{renders++;clock+=1.25;return{};},clear(){},dispose(){},snapshot:()=>({})};
const system=new CharacterSystem({scene:new THREE.Scene(),camera,adapter,renderer,documentObject:null});
try{for(let i=0;i<600;i++){system.update(1/60,{daylight:1});await Promise.resolve();}const report={kind:'Deterministic scheduling-unit reproduction. 1.25 ms Manager/Renderer cost injected into controlled clock, not measured device performance.',frames:600,budgetMs:1,simulatedSubmissionMs:1.25,renders,queue:queue.snapshot(),system:system.statusSnapshot()};fs.writeFileSync('reports/r51-visibility/preparation-starvation-before.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));assert.ok(queue.snapshot().steps>0,'Pending preparation must eventually progress when render submission alone exceeds the total nominal 1ms budget');}finally{system.dispose();if(desc)Object.defineProperty(performance,'now',desc);else delete performance.now;}
