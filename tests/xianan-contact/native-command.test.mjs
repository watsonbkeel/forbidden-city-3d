import test from 'node:test';
import {makeFixture,contacts,save,assert,T} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {queryXiananContact} from '../../src/scene/palace/special/XiananContactSources.js';
import {xiananGroundCovered} from '../../src/controls/XiananGroundWitness.js';
import {beginXiananMove,xiananMoveStart,tryXiananGroundedStep,finishXiananMove} from '../../src/controls/XiananContactMotion.js';
import {PLAYER} from '../../src/config/constants.js';
const EPS=1e-8,prefix=process.env.XIANAN_STAGE_NAME??'NATIVE-COMMAND';
const physical=c=>c.camera.position.clone().sub(c.bobOffset);
function run(kind){
 const f=makeFixture(),report={kind,requests:[]};
 try{
  withTerrainController(f.cm,(c,camera,tick)=>{
   c.setPosition(300.9,PLAYER.HEIGHT,-245.515);const seed=physical(c);report.initial=seed.toArray();
   assert.ok(Math.abs(seed.y-PLAYER.HEIGHT)<=EPS,'actual initial ground0');
   assert.equal(contacts(seed.toArray(),seed.y-PLAYER.HEIGHT,f.finishedBoxes).length,0,'initial five-box full-body clean');
   assert.equal(f.cm.checkCollision(seed,.5),false,'initial original colliders clean');
   assert.equal(f.cm.checkBoundary(seed,.5)&&f.cm.checkRiverCrossing(seed,.5),true,'original boundary and water');
   const proposed=seed.clone();proposed.z+=1.2;
   assert.equal(xiananGroundCovered(f.scene,seed,proposed,.5,camera),true,'real entire proposed path ground cover');
   assert.equal(queryXiananContact(f.cm,seed,proposed,.5,camera)?.status,'valid','source/finished/currentcamera proof');
   const original=f.cm.getValidPosition;
   f.cm.getValidPosition=function(from,to,radius,feet,step,airFeet,motion){
    report.nativeIntent={from:from.toArray(),to:to.toArray(),radius,step,actualTentativeCamera:camera.position.toArray()};
    const handle=beginXiananMove(this,motion,from,to,radius,step);
    assert.ok(handle!==null,'real native boundary received a local call handle');
    const current=xiananMoveStart(handle),distance=Math.hypot(to.x-from.x,to.z-from.z),steps=Math.max(1,Math.ceil(distance/Math.max(radius*.5,.05))),dx=(to.x-from.x)/steps,dz=(to.z-from.z)/steps;
    report.subdivision={distance,steps,dx,dz};
    const request=(x,z,label)=>{
     const before=current.toArray(),r=tryXiananGroundedStep(handle,x,z);
     if(r?.accepted)current.copy(r.position);
     report.requests.push({label,before,requested:[x,z],accepted:r?.accepted===true,returned:current.toArray()});
    };
    if(kind==='oversized')request(from.x,from.z+1.2,'one-expanded-request');
    else {
     for(let i=0;i<steps;i++)request(current.x+dx,current.z+dz,'native-step-'+i);
     if(kind==='extra')request(current.x+dx,current.z+dz,'one-extra-native-sized-step');
    }
    report.finished=current.toArray();finishXiananMove(handle,current);return current;
   };
   try{
    c.lookAt(300.9,-240.1);camera.updateMatrixWorld(true);c.moveForward=true;c.canSprint=false;tick(10);
    const output=physical(c);report.output={physicalEye:output.toArray(),derivedFeet:output.y-PLAYER.HEIGHT,renderEye:camera.position.toArray(),bobOffset:c.bobOffset.toArray(),vv:c.verticalVelocity,airborne:c.airborne,finishedContacts:contacts(output.toArray(),output.y-PLAYER.HEIGHT,f.finishedBoxes)};
   }finally{f.cm.getValidPosition=original;}
  });
  save(prefix+'-'+kind+'.json',report);
 }finally{f.dispose();}
 return report;
}
test('native command: exact authorized subdivision reaches native target',()=>{
 const r=run('control');assert.equal(r.subdivision.steps,2);assert.ok(Math.abs(r.subdivision.distance-.31606027941427883)<=EPS,'original5m/s native acceleration');
 for(let i=0;i<3;i++)assert.ok(Math.abs(r.output.physicalEye[i]-r.nativeIntent.to[i])<=EPS,'actual native output equals bound native target');
 assert.equal(r.output.finishedContacts.length,0);
});
test('native command: one oversized request cannot expand authentic native intent or lift to cap',()=>{
 const r=run('oversized');
 for(let i=0;i<3;i++)assert.ok(Math.abs(r.output.physicalEye[i]-r.initial[i])<=EPS,'oversized request must retain actual initial pose without extra cap lift');
 assert.ok(Math.abs(r.output.derivedFeet)<=EPS,'no cap height obtained');
});
test('native command: an extra exact-sized subdivision cannot exceed the bound total target',()=>{
 const r=run('extra');assert.equal(r.requests.length,r.subdivision.steps+1);
 assert.ok(r.output.physicalEye[2]<=r.nativeIntent.to[2]+EPS,'extra repeated native-sized step must not exceed original total target');
 assert.ok(r.output.physicalEye[2]>=r.initial[2]-EPS,'valid prefix may remain, no reverse teleport');
 assert.ok(Math.abs(r.output.derivedFeet)<=EPS,'extra step must not obtain cap height');
});
