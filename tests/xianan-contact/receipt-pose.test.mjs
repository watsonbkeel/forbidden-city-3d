import test from 'node:test';
import {makeFixture,contacts,save,assert,T} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {queryXiananContact} from '../../src/scene/palace/special/XiananContactSources.js';
import {xiananGroundCovered} from '../../src/controls/XiananGroundWitness.js';
import {PLAYER} from '../../src/config/constants.js';

const EPS=1e-8,prefix=process.env.XIANAN_STAGE_NAME??'RECEIPT-POSE';
const physical=c=>c.camera.position.clone().sub(c.bobOffset);
const pose=c=>({physicalEye:physical(c).toArray(),renderEye:c.camera.position.toArray(),bobOffset:c.bobOffset.toArray(),verticalVelocity:c.verticalVelocity,airborne:c.airborne});
function exercise(kind){
 const f=makeFixture(),events=[],outputs=[];let injection=null;
 try{
  withTerrainController(f.cm,(c,camera,tick)=>{
   c.setPosition(300.9,PLAYER.HEIGHT,-245.515);
   const initial=pose(c),p=physical(c);
   assert.ok(Math.abs(p.y-PLAYER.HEIGHT)<=EPS,'actual seed is real ground0');
   assert.equal(contacts(p.toArray(),p.y-PLAYER.HEIGHT,f.finishedBoxes).length,0,'clean initial finished full body');
   assert.equal(f.cm.checkCollision(p,.5),false,'original collider preflight');
   assert.equal(f.cm.checkBoundary(p,.5)&&f.cm.checkRiverCrossing(p,.5),true,'boundary/water preflight');
   assert.equal(xiananGroundCovered(f.scene,p,new T.Vector3(300.9,PLAYER.HEIGHT,-245.0),.5,camera),true,'real complete first-sweep ground proof');
   assert.equal(queryXiananContact(f.cm,p,new T.Vector3(300.9,PLAYER.HEIGHT,-245),.5,camera)?.status,'valid','authentic source/finished/current-camera preflight');
   const cmOriginal=f.cm.getValidPosition,verticalOriginal=c.updateGround,copyOriginal=camera.position.copy;
   let didInject=false,frame=0;
   f.cm.getValidPosition=function(...args){
    const result=cmOriginal.apply(this,args);
    events.push({frame,phase:'cm-authentic-return',eye:result.toArray()});
    if(kind==='receipt'&&!didInject){
     const before=result.toArray();result.y+=.125;didInject=true;
     injection={kind,before,after:result.toArray()};events.push({frame,phase:'same-receipt-object-injected',eye:result.toArray()});
    }
    return result;
   };
   camera.position.copy=function(value){
    const result=copyOriginal.call(this,value);
    events.push({frame,phase:'actual-camera-copied-before-consume',eye:this.toArray()});
    return result;
   };
   c.updateGround=function(dt,motion){
    events.push({frame,phase:'after-consume-before-vertical',...pose(this)});
    if(kind==='vertical'&&!didInject){
     const before=physical(this).toArray();camera.position.y+=.125;didInject=true;
     injection={kind,before,after:physical(this).toArray()};events.push({frame,phase:'actual-camera-injected-at-vertical-entry',...pose(this)});
    }
    const result=verticalOriginal.call(this,dt,motion);
    events.push({frame,phase:'after-vertical-before-final-camera-y',...pose(this)});
    return result;
   };
   try{
    c.lookAt(300.9,-240.1);camera.updateMatrixWorld(true);c.moveForward=true;c.canSprint=false;
    frame=1;tick(10);outputs.push({frame,phase:'first-final-output',...pose(c)});
    c.moveForward=false;c.moveBackward=false;c.canSprint=false;
    frame=2;tick(10);outputs.push({frame,phase:'normal-key-up-final-output',...pose(c)});
    if(kind!=='control'){c.jump();frame=3;tick(10);outputs.push({frame,phase:'queued-jump-final-output',...pose(c)});}
   }finally{f.cm.getValidPosition=cmOriginal;c.updateGround=verticalOriginal;camera.position.copy=copyOriginal;}
   save(prefix+'-'+kind+'.json',{kind,initial,injection,events,outputs,identity:f.identity});
  });
 }finally{f.dispose();}
 return {injection,events,outputs};
}

test('receipt pose: unmodified authentic CM wrapper preserves native ground output',()=>{
 const r=exercise('control');assert.equal(r.injection,null);
 assert.ok(Math.abs(r.outputs[0].physicalEye[1]-1.7)<=EPS,'control first native pose stays ground0');
 assert.equal(r.outputs[0].verticalVelocity,0);assert.equal(r.outputs[0].airborne,false);
 assert.ok(r.events.some(e=>e.phase==='actual-camera-copied-before-consume'&&Math.abs(e.eye[1]-1.7)<=EPS));
});
for(const kind of ['receipt','vertical'])test('receipt pose: '+kind+' mismatch cannot write an old transaction height or grant a jump',()=>{
 const r=exercise(kind);
 assert.ok(Math.abs(r.injection.before[1]-1.7)<=EPS,'authentic first pre-injection output is ground0');
 assert.ok(Math.abs(r.injection.after[1]-1.825)<=EPS,'explicit external injection alone is exactly .125');
 const copied=kind==='receipt'?r.events.find(e=>e.phase==='actual-camera-copied-before-consume').eye:r.events.find(e=>e.phase==='actual-camera-injected-at-vertical-entry').physicalEye;
 assert.ok(Math.abs(copied[1]-1.825)<=EPS,'actual camera observed after external injection, not hidden feet');
 for(const row of r.outputs){
  assert.ok(Math.abs(row.physicalEye[1]-1.825)<=EPS,'module must preserve observed injected eye rather than write prior1.7');
  assert.equal(row.verticalVelocity,0,'mismatch preserves actual current vv');
  assert.equal(row.airborne,false,'mismatch grants no new airborne jump');
 }
});
