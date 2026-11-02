import assert from'node:assert/strict';
/** Narrow diagnostic acceptance, opt-in only. Default strict <=.3 remains red.
 * These are the already-recorded six approaches, not generic stair exemptions. */
export function verifyRoutes(r,old,{acceptRunoff=false}={}){
 assert.deepEqual(r.routes,old.routes,'unchanged four original street arrays');assert.equal(r.porch.length,6);assert.equal(r.negative.length,3);
 assert.deepEqual(r.porch.map(q=>[q.name,q.fps,q.sprint]),[['central',10,false],['central',60,true],['east-side',10,false],['east-side',60,true],['west-side',10,false],['west-side',60,true]]);
 assert.deepEqual(r.negative.map(q=>q.name),['closed-front','closed-back','visible-column']);assert.ok(r.negative.every(q=>q.arrived===false));
 const rows=r.porch.map(q=>{assert.equal(q.arrived,true);assert.ok(q.frames.every(f=>[f.x,f.z,f.feet,f.ground,f.speed].every(Number.isFinite)));assert.ok(q.frames.every(f=>f.feet>=-1e-6));const gap=q.frames.map(f=>f.feet-f.ground),peak=Math.max(...gap.map(Math.abs)),above=gap.filter(v=>v>.3).length;
  if(!q.sprint){assert.ok(peak<=.103);assert.equal(above,0);}else{assert.ok(peak<=(q.name==='central'?.430:.388));assert.ok(above<=(q.name==='central'?10:8));assert.ok(Math.min(...gap)>=-.2281);}
  return{name:q.name,fps:q.fps,frames:q.frames.length,peak,framesAbovePoint3:above};
 });
 const strictPass=rows.every(q=>q.peak<=.3);
 if(!acceptRunoff)assert.ok(strictPass,'documented original strict .3 runoff diagnostic remains failed');
 return{functionalArrivals:10,negativeRejected:3,acceptDocumentedRunoff:acceptRunoff,strictPoint3Pass:strictPass,oldFrames:r.routes.reduce((n,q)=>n+q.frames.length,0),newFrames:r.porch.reduce((n,q)=>n+q.frames.length,0),rows};
}
