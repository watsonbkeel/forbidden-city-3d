import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildR52World} from './lib/r52-world.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {applyDonghuaExteriorEnvelope} from '../src/scene/palace/special/DonghuaExteriorEnvelope.js';

// Candidate-only dispatch adapter: production ZoneBase source is NOT edited.
// The parent integrates the same single hook after buildEastWestCityGate.
test('actual merged world / real FirstPersonControls: all three Donghua portals, wall and open leaves at 10/30/60Hz',async t=>{
 const original=ZoneBase.prototype.buildCityGate,adapter=process.env.R158_DONGHUA_PRODUCTION_HOOK!=='1';let hooked=0;
 if(adapter)ZoneBase.prototype.buildCityGate=function(item){const r=original.call(this,item);if(item.name==='东华门'){
  const frame=this.kit.root.children.find(f=>f.name==='city-gate-东华门');
  if(frame?.userData.donghuaExteriorEnvelope||applyDonghuaExteriorEnvelope(this.kit,frame,{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item}))hooked++;
 }return r;};
 let w;try{w=await buildR52World();}finally{ZoneBase.prototype.buildCityGate=original;}
 try{
  if(adapter)assert.equal(hooked,1);let record;w.scene.traverse(g=>{record??=g.userData.architecture?.find(a=>a.id==='city-gates/donghua');});
  assert.equal(record.donghuaExteriorEnvelope.visibleWindowGroups,5);
  const world=(x,z)=>[-365.8+z,-257-x],rows=[];
  function run({a,b,fps,jump=false,interrupt=false,block=false}){
   const doc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};
   const controllerDoc={...doc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
   globalThis.document=controllerDoc;globalThis.window={addEventListener:noop,removeEventListener:noop};
   let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera();
   const ctrl=new FirstPersonControls(camera,{ownerDocument:controllerDoc,addEventListener:noop,removeEventListener:noop},w.cm);
   const start=world(...a),end=world(...b),distance=Math.hypot(end[0]-start[0],end[1]-start[1]),dir=[(end[0]-start[0])/distance,(end[1]-start[1])/distance];
   ctrl.controls.isLocked=true;ctrl.setPosition(start[0],1.7,start[1]);camera.lookAt(end[0],1.7,end[1]);camera.updateMatrixWorld(true);ctrl.moveForward=true;ctrl.canSprint=true;ctrl.jumpQueued=jump;
   let progress=0,peak=0,interrupted=false,pausedAt;
   try{for(let i=0;i<fps*9;i++){
    if(interrupt&&i===fps){ctrl.stop();interrupted=true;pausedAt=camera.position.clone().sub(ctrl.bobOffset);}
    if(interrupt&&i===fps+Math.ceil(fps/2)){assert.ok(camera.position.clone().sub(ctrl.bobOffset).distanceTo(pausedAt)<.08,'stop does not drift through a gate');ctrl.moveForward=true;}
    now+=1000/fps;ctrl.update();
    const x=camera.position.x-ctrl.bobOffset.x,z=camera.position.z-ctrl.bobOffset.z;progress=(x-start[0])*dir[0]+(z-start[1])*dir[1];peak=Math.max(peak,ctrl.feetY);
    assert.equal(w.cm.checkCollision(new THREE.Vector3(x,ctrl.feetY+1.7,z),.5),false,'no body penetration into original solids');
    assert.ok(Math.abs(ctrl.feetY)<2,'ground and jump stay below vault, no roof teleport');
    if(!block&&progress>=distance-.4)break;
   }
   if(block)assert.ok(progress<3,`solid stops controller: ${JSON.stringify({a,b,fps,progress})}`);
   else assert.ok(progress>=distance-.4,`portal route: ${JSON.stringify({a,b,fps,progress,distance})}`);
   if(jump)assert.ok(peak>.7,'actual controller jump occurred');if(interrupt)assert.ok(interrupted);
   rows.push({a,b,fps,jump,interrupt,block,progress,peak,end:camera.position.toArray()});
   }finally{ctrl.dispose();clock.mock.restore();globalThis.document=doc;globalThis.window=oldWindow;}
  }
  for(const fps of[10,30,60])for(const x of[-8.4,0,8.4])for(const sign of[-1,1])run({a:[x,-10*sign],b:[x,10*sign],fps,jump:x===0,interrupt:x===8.4});
  for(const fps of[10,60])for(const x of[-13,-4.2,4.2,13])for(const sign of[-1,1])run({a:[x,-10*sign],b:[x,10*sign],fps,block:true});
  for(const fps of[10,60])for(const x of[-8.4,0,8.4])for(const sign of[-1,1])run({a:[x,-5.18],b:[x+sign*3.5,-5.18],fps,block:true});
  console.log(JSON.stringify({scope:'CPU_ACTUAL_WORLD_REAL_FIRST_PERSON_NOT_BROWSER',dispatchMode:adapter?'CANDIDATE_ADAPTER':'PRODUCTION_HOOK_REQUIRED',portalRoutes:18,masonryRoutes:16,openLeafRoutes:12,rows}));
 }finally{w.dispose();}
});
