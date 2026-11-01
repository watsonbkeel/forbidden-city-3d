import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildR52World} from '../../../../tests/lib/r52-world.mjs';
import {FirstPersonControls} from '../../../../src/controls/FirstPerson.js';
import {triangleBodyIntersects} from '../../../../src/utils/TriangleSupport.js';
import {overheadIntersectsBox} from '../../../../src/utils/OverheadShape.js';

test('Five Wumen heads stop real airborne ascents and retained base slabs catch high drops at10/60Hz',async t=>{
 const w=await buildR52World(),rows=[];
 try{
  const Z=-419.6,owners=w.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('axis/wumen-lower/')),overheads=w.cm.colliders.filter(c=>c.overhead?.sourceId==='axis/wumen-lower/flat-soffit'),slabs=w.cm.colliders.filter(c=>c.mesh?.wumenLowerSlab).map(c=>({box:c.box,id:c.mesh.wumenLowerSlab}));
  assert.equal(slabs.length,3);
  // Actual box volume, not a triangle-only filter. Exact floor contact is
  // not penetration; numerical tolerance1e-8 is explicitly bounded.
  const slabHits=(x,y,z)=>slabs.filter(({box:b})=>x+.5>b.min.x+1e-8&&x-.5<b.max.x-1e-8&&z+.5>b.min.z+1e-8&&z-.5<b.max.z-1e-8&&y+1.7>b.min.y+1e-8&&y<b.max.y-1e-8).map(b=>b.id);
  assert.deepEqual(slabHits(0,12.15,Z),['axis/wumen-lower/main-top'],'negative control must detect body volume inside slab');
  assert.deepEqual(slabHits(0,12.3,Z),[],'real top contact must remain non-penetrating');
  const heads=[[-48,3.8],[-14.5,4.7],[0,5.4],[14.5,4.7],[48,3.8]],cases=[];
  for(const[x,width]of heads)for(const side of[-1,1])cases.push({kind:'head',x:x+side*(width/2-.55),z:18.1,feet:1.5,velocity:8});
  for(const[x,z]of[[0,0],[-48,-16.5],[48,-16.5],[-48,10],[48,10],[-47,-40],[47,-40]])cases.push({kind:'drop',x,z,feet:16,velocity:0});
  for(const fps of[10,60])for(const q of cases){
   const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
   let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new w.THREE.PerspectiveCamera(),ctrl=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},w.cm),frames=[];
   ctrl.controls.isLocked=true;ctrl.setPosition(q.x,q.feet+1.7,q.z+Z);ctrl.feetY=q.feet;ctrl.groundY=0;ctrl.airborne=true;ctrl.verticalVelocity=q.velocity;camera.position.y=q.feet+1.7;
   try{for(let i=0;i<fps*5;i++){now+=1000/fps;ctrl.update();const x=camera.position.x-ctrl.bobOffset.x,z=camera.position.z-ctrl.bobOffset.z,y=ctrl.feetY,body=new w.THREE.Box3(new w.THREE.Vector3(x-.5,y+1e-4,z-.5),new w.THREE.Vector3(x+.5,y+1.7,z+.5));frames.push({x,z,y,airborne:ctrl.airborne,velocity:ctrl.verticalVelocity,hits:[...owners.filter(c=>triangleBodyIntersects(c.triangleSupport,body)).map(c=>c.triangleSupport.id),...overheads.filter(c=>overheadIntersectsBox(c.overhead,body)).map(c=>c.overhead.sourceId),...slabHits(x,y,z)]});}rows.push({...q,fps,frames});}
   finally{ctrl.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
  }
  fs.writeFileSync(process.env.EVIDENCE_OUT??'../audit-wumen-completion-20261031/lower-vertical.json',JSON.stringify(rows));
  for(const r of rows){const last=r.frames.at(-1);assert.equal(r.frames.filter(f=>f.hits.length).length,0,JSON.stringify({...r,frames:undefined,firstBad:r.frames.find(f=>f.hits.length)}));assert.equal(last.airborne,false,JSON.stringify({...r,frames:undefined,last}));if(r.kind==='drop')assert.ok(Math.abs(last.y-12.3)<.01,JSON.stringify({...r,frames:undefined,last}));else{assert.ok(Math.max(...r.frames.map(f=>f.y))>1.5,'real upward flight occurred');assert.ok(last.y<.01,'head hit returns to actual ground, no rescue support');}}
 }finally{w.dispose();}
});
