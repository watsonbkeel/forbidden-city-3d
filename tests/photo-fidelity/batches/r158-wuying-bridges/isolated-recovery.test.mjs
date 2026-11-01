// Blocking independent-review reproduction. Do not skip/todo or soften this
// gate: an elevated square-body impact is not a circular-foot support.
import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {library} from '../../../lib/inner-palace-fixture.mjs';import {buildSouthWaterSystem} from '../../../../src/scene/palace/special/SouthWaterSystem.js';import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';import {createAuthoredWuyingCrownRecovery}from '../../../../src/scene/palace/special/WuyingThreeBridgeRails.js';import{createRecoveryHarness}from'./recovery-harness.mjs';import{triangleBodyIntersects}from '../../../../src/utils/TriangleSupport.js';
const river=PALACE_LAYOUT.find(p=>p.southWaterProfile);
test('ISOLATED candidate: real pointed-crown outer-edge drops permit inward escape without changing production controls',async t=>{
 const {CollisionManager,FirstPersonControls}=await createRecoveryHarness(createAuthoredWuyingCrownRecovery());
 const lib=library(),water=buildSouthWaterSystem(lib,river,lib.material('water')),cm=new CollisionManager();cm.addColliders(water.colliders);cm.addWalkables(water.walkables);const owned=cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('wuying-bridge-rails:')),rows=[];
 try{for(const fps of[10,30,60])for(const [direction,dx,dz]of[['inward',-1,0],['outward',1,0],['north',0,1],['south',0,-1],['inward-north',-1,1],['inward-south',-1,-1],['outward-north',1,1],['outward-south',1,-1]]){
  const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new T.PerspectiveCamera(),ctrl=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},cm);
  try{ctrl.controls.isLocked=true;ctrl.setPosition(223.83,7.7,-277.83);ctrl.feetY=6;ctrl.groundY=0;ctrl.airborne=true;ctrl.verticalVelocity=0;camera.position.y=7.7;let impact=null,reachedDeck=false;
   for(let i=0;i<fps*8;i++){
    now+=1000/fps;if(i>=fps*2){ctrl.moveForward=true;camera.position.sub(ctrl.bobOffset);camera.lookAt(camera.position.x+dx,camera.position.y,camera.position.z+dz);camera.position.add(ctrl.bobOffset);camera.updateMatrixWorld(true);if(i%fps===0)ctrl.jump();}ctrl.update();
    const x=camera.position.x-ctrl.bobOffset.x,z=camera.position.z-ctrl.bobOffset.z,feet=ctrl.feetY,body=new T.Box3(new T.Vector3(x-.5,feet+1e-6,z-.5),new T.Vector3(x+.5,feet+1.7,z+.5));
    assert.ok(!owned.some(c=>triangleBodyIntersects(c.triangleSupport,body)),`${fps}/${direction}: positive-depth body intersection`);
    if(i===fps*2-1)impact={x,z,feet,airborne:ctrl.airborne};
    if(i>=fps*2&&Math.abs(x-220.8)<1.9&&feet<.5&&!ctrl.airborne){reachedDeck=true;break;}
   }
   rows.push({fps,direction,impact,final:{x:camera.position.x-ctrl.bobOffset.x,z:camera.position.z-ctrl.bobOffset.z,feet:ctrl.feetY,airborne:ctrl.airborne},reachedDeck});
  }finally{ctrl.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
 }console.log('wuying-crown-edge-reproduction',JSON.stringify(rows));
  assert.equal(rows.length,24);assert.ok(rows.filter(r=>r.direction.startsWith('inward')).every(r=>r.reachedDeck),'each frame rate must escape the real crown body-impact onto the bridge without a rescue floor');
 }finally{water.group.traverse(m=>m.geometry?.dispose());}
});
