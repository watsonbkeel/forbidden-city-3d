import test from 'node:test';
import {assert,physical,feet,close,hit,intent,adapter,rig,inspectChain,motion,save,EPS} from './protocol-fixture.mjs';
const prefix=process.env.XIANAN_STAGE_NAME??'PROTOCOL-SLIDING';
const one={min:[300.20,.7,-244.94],max:[300.35,1,-244.90]},wallX={min:[300.27,.7,-246.1],max:[300.32,1,-244.8]},wallZ={min:[300.2,.7,-244.94],max:[301.6,1,-244.90]},liftWall={min:[300.3,.9,-244.50],max:[301.5,1.3,-244.48]};
function diagonalPreflight(from,to,radius,boxes,mode){
 const p=intent(from,to,radius);assert.ok(p.dx<0&&p.dz>0,'SETUP actualnorth-right signs');assert.equal(p.steps,2);const a=feet(from),diag=[a[0]+p.dx,a[1],a[2]+p.dz],x=[a[0]+p.dx,a[1],a[2]],oldZ=[a[0],a[1],a[2]+p.dz],newZ=[x[0],x[1],x[2]+p.dz],hits=(u,v)=>boxes.some(b=>hit(u,v,b,true));
 assert.equal(hits(a,a),false,'SETUP initialclean');assert.equal(hits(a,diag),true,'SETUP diagblocked');assert.equal(hits(a,x),mode==='all','SETUP X expectedclear/block');assert.equal(hits(mode==='all'?a:x,mode==='all'?oldZ:newZ),true,'SETUP Zblocked');if(mode!=='all')assert.equal(hits(a,oldZ),false,'SETUP wrongoldX Zgeometricallyclear');return p;
}
test('S1 real Collision: failed diagonal retains accepted X and rejects latest-origin Z',()=>rig([one],({f,c,tick})=>{
 c.moveRight=true;const before=physical(c),original=f.cm.getValidPosition;let plan;
 f.cm.getValidPosition=function(...args){plan=diagonalPreflight(args[0],args[1],args[2],[one],'x');return original.apply(this,args);};
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 const after=physical(c);close(after.toArray(),[before.x+2*plan.dx,before.y,before.z],'actual X-only movement');assert.ok(after.x<before.x-EPS,'not allblocked');const s=inspectChain(f,c,before,{noLift:true});assert.ok(s.committedSegments.length>0);assert.ok(s.committedSegments.every(a=>a.fromFeet[2]===a.toFeet[2]));save(prefix+'-S1.json',{raw:f.protocolRawFrames,plan,before:before.toArray(),after:after.toArray(),s});
}));
test('S2 adapter: stale-origin Z is rejected even where that geometric path would be clear',()=>rig([one],({f,c,tick,eligibility})=>{
 c.moveRight=true;const before=physical(c),original=f.cm.getValidPosition;let state;
 f.cm.getValidPosition=function(...args){diagonalPreflight(args[0],args[1],args[2],[one],'x');state=adapter(this,args,a=>{assert.equal(a.request(a.p.x+a.plan.dx,a.p.z+a.plan.dz,'MAIN').accepted,false);assert.equal(a.request(a.p.x+a.plan.dx,a.p.z,'X').accepted,true);a.request(a.from.x,a.p.z+a.plan.dz,'wrong-old-origin-Z');motion.finishXiananMove(a.h,a.p);});return state.p;};
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 close(physical(c).toArray(),[before.x+state.plan.dx,before.y,before.z],'legitimate Xprefix only');assert.equal(eligibility.at(-1),false,'realconsumer no currentpermission');const s=inspectChain(f,c,before,{blocked:true});save(prefix+'-S2.json',{raw:f.protocolRawFrames,plan:state.plan,requests:state.requests,eligibility,s});
}));
test('S3 real Collision: diagonal, X and Z all blocked leave no accepted candidate',()=>rig([wallX,wallZ],({f,c,tick})=>{
 c.moveRight=true;const before=physical(c),original=f.cm.getValidPosition;let plan;
 f.cm.getValidPosition=function(...args){plan=diagonalPreflight(args[0],args[1],args[2],[wallX,wallZ],'all');return original.apply(this,args);};
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 close(physical(c).toArray(),before.toArray(),'allblocked retainsactualseed');assert.equal(c.verticalVelocity,0);const s=inspectChain(f,c,before,{noLift:true});assert.equal(s.committedSegments.length,0);save(prefix+'-S3.json',{raw:f.protocolRawFrames,plan,s});
}));
test('S4 zero axis: original loop stays valid, extra zero/X/Z calls cannot renew budget',()=>rig([wallZ],({f,c,tick,eligibility})=>{
 const before=physical(c),original=f.cm.getValidPosition;let firstPlan;
 f.cm.getValidPosition=function(...args){firstPlan=intent(args[0],args[1],args[2]);assert.equal(firstPlan.dx,0,'SETUP realzero X');const a=feet(args[0]),z=[a[0],a[1],a[2]+firstPlan.dz];assert.equal(hit(a,z,wallZ,true),true,'SETUP Zblocked');assert.equal(hit(a,a,wallZ,true),false,'SETUP zeroXclean');return original.apply(this,args);};
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 close(physical(c).toArray(),before.toArray(),'normal zeroaxis stays');assert.equal(eligibility.at(-1),true,'normal consumer retains realground0support');const normal=inspectChain(f,c,before,{noLift:true});let state;
 f.cm.getValidPosition=function(...args){state=adapter(this,args,a=>{a.complete();a.request(a.p.x,a.p.z,'extra-zero');a.request(a.p.x+a.plan.dx,a.p.z,'extra-X');a.request(a.p.x,a.p.z+a.plan.dz,'extra-Z');motion.finishXiananMove(a.h,a.p);});return state.p;};
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 assert.ok(state.requests.slice(-3).every(r=>!r.accepted));assert.equal(eligibility.at(-1),false,'extra requests revoke currentframe rights');close(physical(c).toArray(),before.toArray(),'extra attempts do not move');const blocked=inspectChain(f,c,before,{blocked:true});save(prefix+'-S4.json',{raw:f.protocolRawFrames,firstPlan,normal,requests:state.requests,eligibility,blocked});
}));
test('S5 real Collision: cleared trial lift followed by blocked horizontal never leaks capheight',()=>rig([liftWall],({f,c,tick})=>{
 tick(10);const before=physical(c);assert.ok(Math.abs(before.y-1.7)<=EPS,'SETUP firstnativeapproach remainsground0');const cap=f.finishedBoxes.find(b=>b.label==='cap'),original=f.cm.getValidPosition;let plan;
 f.cm.getValidPosition=function(...args){plan=intent(args[0],args[1],args[2]);assert.equal(plan.dx,0);const a=feet(before),up=[a[0],cap.max[1],a[2]],end=[up[0],up[1],up[2]+plan.dz];assert.equal(hit(a,up,liftWall,true),false,'SETUP verticaltrialclear');assert.equal(hit(up,end,liftWall,true),true,'SETUP raisedhorizontalblocked');assert.equal(hit(a,a,liftWall,true),false,'SETUP zeroXclear');for(const b of f.finishedBoxes)assert.equal(hit(a,up,b),false,'SETUP fiveboxliftclear');return original.apply(this,args);};
 try{tick(10);}finally{f.cm.getValidPosition=original;}
 close(physical(c).toArray(),before.toArray(),'failed lift-horizontal retains actualground0');assert.equal(c.verticalVelocity,0);const s=inspectChain(f,c,before,{noLift:true});save(prefix+'-S5.json',{raw:f.protocolRawFrames,plan,before:before.toArray(),after:physical(c).toArray(),s});
}));
