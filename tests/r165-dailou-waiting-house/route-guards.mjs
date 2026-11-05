import {serializeTrace} from './native-ground-trace.mjs';
import assert from 'node:assert/strict';import * as T from 'three';import {PLAYER} from '../../src/config/constants.js';
export function assertJiuqingTop(walkables){
 // Exact local excerpt of the original full-World normalGuard. It does not
 // replace its separate architecture/World/scan assertions, all still deferred.
 const tops=walkables.filter(w=>w.type==='box'&&w.box.min.x>=-92.4&&w.box.max.x<=-82.2&&w.box.min.z>=198.6&&w.box.max.z<=204.6);
 assert.equal(tops.length,1,'original exactly one actual Jiuqing box top');assert.equal(tops[0].rescue,false,'original Jiuqing top rescuefalse');return{tops:1,rescueFalse:true,min:tops[0].box.min.toArray(),max:tops[0].box.max.toArray()};
}
export function assertNativeStart(cm,d){
 const [x,z]=d.points[0],feet=d.startFeet;assert.ok(feet===0||feet===.25,'independently declared fitted start height');
 const actual=cm.getGroundHeight(x,z,feet,.01);assert.equal(actual,feet,'native support exactly matches declared ground/porch start');
 assert.equal(cm.checkCollision(new T.Vector3(x,feet+PLAYER.HEIGHT,z),.5),false,'native fitted route start body is clear');return{x,z,feet,actualSupport:actual,clear:true};
}
export function assertNativeFrames(cm,d,q,observation){
 let index=null,current=null,expected=null;
 try{
  assert.equal(q.startFeet,d.startFeet,'controller native initialization retained expected start surface');assert.ok(Array.isArray(q.frames)&&q.frames.length>0);
  assert.equal(observation?.value,q,'same original native replay result');assert.deepEqual(observation.proof,{readOnlyObservation:true,extraNativeQueries:0,methodDescriptorsRestored:true,controllers:1,updates:observation.rows.length});
  assert.equal(observation.rows.length,q.frames.length+(q.arrived?d.fps*2:0),'every original moving and settling native update observed');
  const eps=1e-8;assert.ok(Number.isFinite(q.minFeet)&&Number.isFinite(q.maxFeet)&&q.minFeet>=-eps&&q.maxFeet<=.25+eps&&q.maxFeet>=q.minFeet,'native aggregate feet range stays on fitted low supports');let platformTopVisited=false;
  for(const[i,row]of observation.rows.entries()){
   index=i;current=row;expected=null;assert.equal(row.index,i);assert.equal(row.forwardCalls,1,'one original updateGround forward');assert.ok(row.post&&!row.error,'native update returned');
   const pre=row.pre,post=row.post;assert.ok([pre.x,pre.z,pre.feet,post.x,post.z,post.feet,post.ground].every(Number.isFinite));assert.ok(pre.ground==null||Number.isFinite(pre.ground));assert.equal(typeof pre.airborne,'boolean');
   let walk;
   if(pre.tracked==null){assert.equal(row.walkQueries.length,1,'nullish tracked ground executes exactly original fallback');const query=row.walkQueries[0];assert.deepEqual(query.args,[pre.x,pre.z,pre.airborne?pre.feet:Math.max(pre.feet,pre.ground??0),PLAYER.STEP_UP??.6],'original update-before walk query arguments');assert.ok(!query.error&&Number.isFinite(query.result));walk=query.result;}
   else{assert.equal(row.walkQueries.length,0,'tracked0/value bypasses fallback');assert.ok(Number.isFinite(pre.tracked));assert.equal(pre.tracked,pre.lastGroundY,'recorded actual movement lastGroundY');walk=pre.tracked;}
   assert.equal(row.supportQueries.length,1,'one original ordinary/triangle support query');const sup=row.supportQueries[0];assert.deepEqual(sup.args,[pre.x,pre.z,pre.feet+.05],'original before-update maxTop and default radius.3');assert.ok(!sup.error&&(Number.isFinite(sup.result)||sup.result===-Infinity));
   expected={walkCandidate:walk,supportCandidate:sup.result,nativeMax:Math.max(walk,sup.result)};assert.equal(post.ground,expected.nativeMax,'original native max(tracked-or-walk,footprint-support) ground');
   assert.ok(post.feet>=-eps&&post.feet<=.25+eps,'native feet stay on/between the declared low ground/porch heights');assert.ok([0,.125,.25].some(y=>Math.abs(post.ground-y)<=eps),'only real declared low supports, no high rescue');assert.ok(Math.abs(post.feet-post.ground)<=.3,'retained explicit feet/ground contact bound');assert.equal(cm.checkCollision(new T.Vector3(post.x,post.feet+PLAYER.HEIGHT,post.z),.5),false,'native recorded body remains nonpenetrating');
   if(i<q.frames.length){const f=q.frames[i];assert.ok([f.x,f.z,f.feet,f.ground].every(Number.isFinite));assert.ok(Math.abs(f.x-post.x)<=eps&&Math.abs(f.z-post.z)<=eps,'same original physical frame position');assert.equal(f.feet,post.feet);assert.equal(f.ground,post.ground);}
   if(Math.abs(post.ground-.25)<=eps&&Math.abs(post.feet-.25)<=.05)platformTopVisited=true;
  }
  if(d.newContacts.requirePlatform)assert.ok(platformTopVisited,'native route actually reads/stays on the real.25 porch platform');
  return{framesChecked:q.frames.length,nativeUpdatesChecked:observation.rows.length,platformTopVisited,feetRange:[q.minFeet,q.maxFeet],realLowSupports:[0,.125,.25],startSurface:d.startFeet,bodyPenetrations:0,oracle:'Exact original update-before tracked/nullish walk query and footprint support candidates; no post-frame point-only substitution'};
 }catch(e){e.nativeFailure={descriptor:d,frameIndex:index,frame:index!==null&&index<q.frames.length?q.frames[index]:null,trace:serializeTrace(current),candidates:serializeTrace(expected),observerProof:observation?.proof,frames:q.frames?.length,updates:observation?.rows?.length};throw e;}
}
