import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {captureGate} from '../lib/gate-tower-fixture.mjs';
const c=captureGate('午门'),plaque=c.group.getObjectByName('wumen-south-gate-name-plaque');
const roof=c.group.getObjectByName('roof_wudian'),d=plaque.userData.gatePlaque.dimensions;
const C1=[3,30,-24],C3=[3,25,-40]; // Frozen new C3; old C1 is retained below as a diagnostic.
const target=(x,y)=>plaque.localToWorld(new THREE.Vector3(x,y,d.depth));
function hitsTo(from,to,object=c.group){const origin=new THREE.Vector3(...from),delta=to.clone().sub(origin);return new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+1e-5).intersectObject(object,true);}

for(const [id,from]of [['C3',C3],['unchanged-actual-entry',[0,1.7,-74.4]],['F1',[0,22,-85]],['south-ground-line-of-sight',[0,1.7,-70]]])test(`${id}: both glyph centers and conservative ink cells are unoccluded by retained roof/fascia`,()=>{
 const halfInk=Math.min(d.innerHeight/2*.83,d.innerWidth*.72)/2;
 for(const [char,cy]of [['午',d.innerHeight/4],['門',-d.innerHeight/4]])for(const dx of [-.95,0,.95])for(const dy of [-.95,0,.95]){
  const hits=hitsTo(from,target(dx*halfInk,cy+dy*halfInk));assert.ok(hits.length,`${char} has no front hit`);
  assert.ok(hits[0].object===plaque,`${id}: ${char} blocked by ${hits[0].object.name}`);
  assert.equal(hits[0].face.materialIndex,1,'front lettering is the first visible surface');
 }
});

test('entire plaque stays below actual central upper-eave fascia and above the actual lower roof surface',()=>{
 const b=roof.userData.doubleEaveMountingBand,s=b.upperSoffit,bounds=new THREE.Box3().setFromObject(plaque);
 // hipSurface constructs the vertical eave face at t=1 with yOff=-th*1.5.
 const fasciaBottom=s.eaveY-s.thickness*1.5;
 assert.equal(plaque.userData.gatePlaque.mount.upperFasciaBottomY,fasciaBottom);
 assert.ok(bounds.max.y<=fasciaBottom-.0999);
 assert.ok(bounds.min.y>=plaque.userData.gatePlaque.mount.lowerY+.0999);
 for(const y of [bounds.min.y,bounds.max.y])for(const x of [-d.width*.4,0,d.width*.4]){
  const to=new THREE.Vector3(x,y,bounds.min.z);assert.equal(hitsTo(C3,to,roof).length,0,'C3 frame band must not be masked by corrected roof');
 }
});

test('the rejected old mounting reproduces the exact upper rafter fascia occlusion',()=>{
 const to=new THREE.Vector3(0,30.564271266497677,-9.928),hits=hitsTo(C1,to,legacyRoof);
 assert.ok(hits.length);assert.equal(hits[0].object.name,'roof_wudian_rafters');assert.equal(hits[0].object.material.name,'rafters');
 assert.ok(Math.abs(hits[0].point.z+12.06272029876709)<1e-8);assert.ok(Math.abs(hits[0].point.y-30.47867139962704)<1e-8);
});

// Historical ray reproduction uses the unchanged generic generator and frozen
// V14 roof inputs, not the corrected current tower or a moved camera.
import {buildRoof} from '../../src/scene/RoofBuilder.js';
const legacyRoof=buildRoof(c.lib,{type:'wudian',width:60.65,depth:25.6,baseY:25.3,layers:2,brackets:true,height:9});
test('historical old spawn occlusion is retained on the exact old generic roof',()=>{
 for(const cy of [1.124572868600904/4,-1.124572868600904/4]){
  const to=new THREE.Vector3(0,29.335767583966962+cy,-10.158399772644043);
  const hits=hitsTo([0,1.7,-50.4],to,legacyRoof);assert.ok(hits.length);assert.equal(hits[0].object.material.name,'rafters');
 }
});
for(const [label,from]of [['historical-C1',C1],['historical-close-cardinal',[0,30,-24]]])test(`${label} remains unchanged and honestly reports 3 of 18 ink cells blocked`,()=>{
 const halfInk=Math.min(d.innerHeight/2*.83,d.innerWidth*.72)/2;let visible=0,blocked=0;
 for(const cy of [d.innerHeight/4,-d.innerHeight/4])for(const dx of [-.95,0,.95])for(const dy of [-.95,0,.95]){
  const first=hitsTo(from,target(dx*halfInk,cy+dy*halfInk))[0];
  if(first?.object===plaque)visible++;else{blocked++;assert.equal(first?.object.material.name,'rafters');}
 }
 assert.equal(visible,15);assert.equal(blocked,3);
});
for(const [label,from]of [['actual-entry',[0,1.7,-74.4]],['C3',C3]])test(`${label}: every front-frame vertex clears the actual roof without camera tuning`,()=>{
 const a=plaque.geometry.attributes.position,n=plaque.geometry.attributes.normal;let tested=0;
 for(let i=0;i<a.count;i++)if(n.getZ(i)>.99){const to=plaque.localToWorld(new THREE.Vector3().fromBufferAttribute(a,i));assert.equal(hitsTo(from,to,roof).length,0);tested++;}
 assert.equal(tested,90);
});
