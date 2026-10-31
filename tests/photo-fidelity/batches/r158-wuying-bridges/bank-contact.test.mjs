import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {library} from '../../../lib/inner-palace-fixture.mjs';import {buildSouthWaterSystem} from '../../../../src/scene/palace/special/SouthWaterSystem.js';import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';import {CollisionManager}from '../../../../src/utils/Collision.js';import {FirstPersonControls}from '../../../../src/controls/FirstPerson.js';import{triangleBodyIntersects}from '../../../../src/utils/TriangleSupport.js';
const river=PALACE_LAYOUT.find(p=>p.southWaterProfile);
test('All twelve wider end feet remain on dry bank interfaces, with 6m body drops and outward bank exits at 10/30/60Hz',t=>{
 const lib=library(),water=buildSouthWaterSystem(lib,river,lib.material('water')),cm=new CollisionManager();cm.addColliders(water.colliders);cm.addWalkables(water.walkables);const owned=cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('wuying-bridge-rails:'));let cases=0;
 try{for(const fps of[10,30,60])for(const b of water.profile.bridges.filter(b=>b.family==='wuying'))for(const side of[-1,1])for(const end of[-1,1]){
  const x=b.x+side*(b.width/2-.12),z=b.z+end*9.42,oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new T.PerspectiveCamera(),ctrl=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},cm);
  try{ctrl.controls.isLocked=true;ctrl.setPosition(x,7.7,z);ctrl.feetY=6;ctrl.groundY=0;ctrl.airborne=true;ctrl.verticalVelocity=0;camera.position.y=7.7;let impact=false;
   for(let i=0;i<fps*8;i++){
    now+=1000/fps;if(i>=fps*2){ctrl.moveForward=true;camera.position.sub(ctrl.bobOffset);camera.lookAt(camera.position.x,camera.position.y,b.z+end*15);camera.position.add(ctrl.bobOffset);camera.updateMatrixWorld(true);}ctrl.update();
    const px=camera.position.x-ctrl.bobOffset.x,pz=camera.position.z-ctrl.bobOffset.z,feet=ctrl.feetY,body=new T.Box3(new T.Vector3(px-.5,feet+1e-6,pz-.5),new T.Vector3(px+.5,feet+1.7,pz+.5));
    assert.ok(!owned.some(c=>triangleBodyIntersects(c.triangleSupport,body)),`${b.id} side${side} end${end} fps${fps}: positive-depth body intersection`);
    if(i<fps*2&&feet<.3&&feet>0)impact=true;
    if(i>=fps*2&&end*(pz-b.z)>11&&feet<.03)break;
   }
   assert.ok(impact,'actual low end contact must occur before exiting');assert.ok(end*(camera.position.z-ctrl.bobOffset.z-b.z)>11,`${b.id} did not exit end ${end}`);assert.ok(ctrl.feetY<.03);cases++;
  }finally{ctrl.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
 }assert.equal(cases,36);}finally{water.group.traverse(m=>m.geometry?.dispose());}
});
