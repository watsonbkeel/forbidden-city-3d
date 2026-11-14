import test from 'node:test';
import assert from 'node:assert/strict';
import {actualWenhuaFixture} from './fixture.mjs';
const api=await import('../lib/wenhua-current-access.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const withW=run=>{const W=actualWenhuaFixture();try{return run(W);}finally{W.dispose();}};
test('actual current Wenhua source derives exact cap and asymmetric toes, never the old nominal datum',()=>{
 assert.equal(typeof api.bindWenhuaCurrentAccess,'function','source-bound Wenhua access binding required');
 withW(W=>{const b=api.bindWenhuaCurrentAccess(W,W.gates[0]);assert.equal(b.receipt.capY,0.8100000023841858);assert.equal(b.receipt.legacyFeet,.8);assert.equal(Number.isFinite(b.receipt.legacyFeet),true);assert.equal(b.receipt.legacyCenterBlocked,true);assert.equal(b.receipt.centerBlocked,false);assert.equal(b.receipt.southToe,Math.fround(-257.11));assert.equal(b.receipt.northToe,Math.fround(-227.85));assert.ok(b.receipt.northExtent>b.receipt.southExtent+5);assert.equal(b.receipt.colliders,30);assert.equal(W.cm.colliders.length,36);});
});
test('actual continuous ground roundtrips retain all owners at 10/30/60Hz and four metre clearance plus twelve metre outside reach',()=>{
 assert.equal(typeof api.checkWenhuaCurrentAccess,'function','native Wenhua source access checker required');
 withW(W=>{const r=api.checkWenhuaCurrentAccess(W,W.gates[0]);assert.deepEqual(r.faults,[]);assert.equal(r.runs.length,6);assert.equal(r.outside.length,2);for(const row of r.runs){assert.equal(row.arrived,true);assert.equal(row.endFeet,0);assert.ok(row.crossings>=12);}for(const q of r.outside){assert.equal(q.blockedStart,false);assert.ok(q.maxDist>=q.required);}assert.equal(W.platform.stats.fetches,0);});
});
test('missing, duplicate, foreign and shifted original registered owners fail closed',()=>{
 assert.equal(typeof api.bindWenhuaCurrentAccess,'function');
 withW(W=>{assert.throws(()=>api.bindWenhuaCurrentAccess({...W,finishedZones:[]},W.gates[0]),/finished/);assert.throws(()=>api.bindWenhuaCurrentAccess(W,{...W.gates[0],platformY:NaN}),/datum/);const f=W.finishedZones[0],group=f.group;f.group=group.clone();f.data={...f.data,group:f.group};try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,W.gates[0]),/builder.*group/);}finally{f.group=group;f.data={...f.data,group};}const i=W.cm.colliders.findIndex(c=>c.xiqingRoofSurface?.id==='wenhua-gate-approach-north'),c=W.cm.colliders[i];
  W.cm.colliders.splice(i,1);try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,W.gates[0]),/source|owner|count/);}finally{W.cm.colliders.splice(i,0,c);}
  W.cm.colliders.push(c);try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,W.gates[0]),/source|owner|count|duplicate/);}finally{W.cm.colliders.pop();}
  assert.throws(()=>api.bindWenhuaCurrentAccess({...W,ownerOf:q=>q===c?{zone:'outer-east',item:{...W.gates[0].item}}:W.ownerOf(q)},W.gates[0]),/source|owner|count/);
  c.box.min.z-=1;try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,W.gates[0]),/bounds|source/);}finally{c.box.min.z+=1;}
 });
});
test('fake equal-looking source, missing cap face and missing Environment cannot provide authority',()=>{
 assert.equal(typeof api.bindWenhuaCurrentAccess,'function');
 withW(W=>{const c=W.cm.colliders.find(c=>c.xiqingRoofSurface?.id==='wenhua-gate-approach-south'),original=c.mesh;const clone=original.clone();clone.xiqingRoofSurface=original.xiqingRoofSurface;c.mesh=clone;try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,W.gates[0]),/source|owner/);}finally{c.mesh=original;}
  const shape=c.xiqingRoofSurface;c.xiqingRoofSurface={...shape,template:{...shape.template,triangles:shape.template.triangles.filter(q=>q.source.retainedOriginalTriangle===undefined)}};try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,W.gates[0]),/source|template|cap/);}finally{c.xiqingRoofSurface=shape;}
  assert.throws(()=>api.bindWenhuaCurrentAccess({...W,environmentScene:null},W.gates[0]),/Environment/);
 });
});
test('a true neighboring obstruction at corrected height is not filtered from the gate query',()=>{
 assert.equal(typeof api.bindWenhuaCurrentAccess,'function');
 withW(W=>{const g=W.gates[0];W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(g.x-.8,.82,g.z-.2),new W.THREE.Vector3(g.x+.8,3,g.z+.2)),'r367-foreign-blocker');try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,g),/center.*blocked/);}finally{W.cm.removeByTag('r367-foreign-blocker');}});
});
test('real closed end window and approach rail keep original collision semantics',()=>{
 assert.equal(typeof api.bindWenhuaCurrentAccess,'function');
 withW(W=>{const g=W.gates[0];api.bindWenhuaCurrentAccess(W,g);assert.equal(W.cm.checkCollision(new W.THREE.Vector3(g.x-13.24,4,g.z),.5),true);assert.equal(W.cm.checkCollision(new W.THREE.Vector3(g.x-1.4,1.8,g.z-10.63),.5),true);});
});
test('a thin real midroute wall remains fatal to all six native routes with a clear gate center',()=>{
 assert.equal(typeof api.checkWenhuaCurrentAccess,'function');
 withW(W=>{const g=W.gates[0];W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(g.x-1,.82,g.z-5.005),new W.THREE.Vector3(g.x+3.1,3,g.z-4.995)),'r367-thin-wall');try{const r=api.checkWenhuaCurrentAccess(W,g);assert.equal(r.centerBlocked,false);assert.equal(r.runs.filter(q=>q.arrived).length,0);assert.equal(r.faults.filter(q=>q.includes('route blocked')).length,6);}finally{W.cm.removeByTag('r367-thin-wall');}});
});
test('a real dynamic person at source-height center cannot be dropped by the adapter',()=>{
 assert.equal(typeof api.bindWenhuaCurrentAccess,'function');
 withW(W=>{const g=W.gates[0];W.cm.setDynamicBodies('r367-person',[{id:'actual-person',parts:[{ax:g.x,az:g.z,bx:g.x,bz:g.z,radius:.1,minY:.81,maxY:3}]}]);try{assert.throws(()=>api.bindWenhuaCurrentAccess(W,g),/center.*blocked/);}finally{W.cm.clearDynamicBodies('r367-person');}assert.equal(api.bindWenhuaCurrentAccess(W,g).receipt.centerBlocked,false);});
});
