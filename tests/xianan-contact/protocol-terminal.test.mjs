import test from 'node:test';
import {assert,physical,close,adapter,rig,inspectChain,motion,save,EPS} from './protocol-fixture.mjs';
const prefix=process.env.XIANAN_STAGE_NAME??'PROTOCOL-TERMINAL';
for(const name of ['T1','T2','T3','T4','T5'])test(name+' real native terminal and consumer authority',()=>rig([],({f,c,tick,eligibility})=>{
 if(name==='T5')c.moveRight=true;
 const before=physical(c),original=f.cm.getValidPosition;let state,returnedOriginal=null,secondHandleAccepted=null;
 f.cm.getValidPosition=function(...args){
  state=adapter(this,args,a=>{
   if(name==='T5'){
    assert.ok(a.plan.dx<0&&a.plan.dz>0,'SETUP actual two-axis command');
    a.request(a.p.x+a.plan.dx,a.p.z,'X-before-MAIN');a.request(a.p.x+a.plan.dx,a.p.z+a.plan.dz,'MAIN-after-poison');motion.finishXiananMove(a.h,a.p);return;
   }
   assert.equal(a.plan.steps,2,'SETUP original two-substep command');assert.equal(a.plan.dx,0,'SETUP real north-only input');
   if(name==='T2')a.request(a.p.x+a.plan.dx,a.p.z+a.plan.dz,'only-first-MAIN');else a.complete();
   motion.finishXiananMove(a.h,a.p);
   if(name==='T3'){const clone=a.p.clone();assert.equal(clone===a.p,false);motion.finishXiananMove(a.h,clone);returnedOriginal=true;}
   if(name==='T4'){const other=motion.beginXiananMove(this,a.token,a.from,a.to,a.radius,a.step);secondHandleAccepted=motion.tryXiananGroundedStep(other,a.p.x+a.plan.dx,a.p.z+a.plan.dz)?.accepted===true;returnedOriginal=true;}
  });
  return state.p; // T3/T4 return the original first-finish object, not clone.
 };
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 const after=physical(c);
 if(name==='T1'){
  close(after.toArray(),state.to.toArray(),'valid complete finish matches native target');assert.equal(eligibility.at(-1),true,'current real consumer support remains available');
  const a=inspectChain(f,c,before),b=motion.inspectXiananGroundedMotion(c);assert.notEqual(a,b);assert.notEqual(a.endEye,b.endEye);assert.throws(()=>{a.endEye[1]+=1;},TypeError);assert.deepEqual(motion.inspectXiananGroundedMotion(c),b);save(prefix+'-'+name+'.json',{raw:f.protocolRawFrames,plan:state.plan,requests:state.requests,eligibility,snapshot:a});
 }else{
  const expected=name==='T2'?[before.x+state.plan.dx,before.y,before.z+state.plan.dz]:name==='T5'?before.toArray():state.to.toArray();
  close(after.toArray(),expected,'only actual legitimate prefix is retained');assert.ok(Math.abs(after.y-1.7)<=EPS);assert.equal(eligibility.at(-1),false,'real consumer revoked same-frame new grounded eligibility');
  if(name==='T3'||name==='T4')assert.equal(returnedOriginal,true,'old originalreceipt object was returned');if(name==='T4')assert.equal(secondHandleAccepted,false,'no reset budget');if(name==='T5')assert.ok(state.requests.every(r=>!r.accepted),'wrong-order poisoned call cannot resume');
  const s=inspectChain(f,c,before,{blocked:true});save(prefix+'-'+name+'.json',{raw:f.protocolRawFrames,plan:state.plan,requests:state.requests,returnedOriginal,secondHandleAccepted,eligibility,snapshot:s});
 }
}));
