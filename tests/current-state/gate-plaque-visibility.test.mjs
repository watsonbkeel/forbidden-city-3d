import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {captureGate} from '../lib/gate-tower-fixture.mjs';
const c=captureGate('午门'),plaque=c.group.getObjectByName('wumen-south-gate-name-plaque');
const roof=c.group.getObjectByName('roof_wudian'),d=plaque.userData.gatePlaque.dimensions;
const C1=[3,30,-24]; // Existing approved fixed observation pose, never a new camera.
const target=(x,y)=>plaque.localToWorld(new THREE.Vector3(x,y,d.depth));
function hitsTo(from,to,object=c.group){const origin=new THREE.Vector3(...from),delta=to.clone().sub(origin);return new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+1e-5).intersectObject(object,true);}

for(const [id,from]of [['C1',C1],['south-cardinal-close',[0,30,-24]],['F1',[0,22,-85]],['south-ground-line-of-sight',[0,1.7,-70]]])test(`${id}: both glyph centers and conservative ink cells are unoccluded by retained roof/fascia`,()=>{
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
  const to=new THREE.Vector3(x,y,bounds.min.z);assert.equal(hitsTo(C1,to,roof).length,0,'C1 frame band must not be masked by retained roof');
 }
});

test('the rejected old mounting reproduces the exact upper rafter fascia occlusion',()=>{
 const to=new THREE.Vector3(0,30.564271266497677,-9.928),hits=hitsTo(C1,to,roof);
 assert.ok(hits.length);assert.equal(hits[0].object.name,'roof_wudian_rafters');assert.equal(hits[0].object.material.name,'rafters');
 assert.ok(Math.abs(hits[0].point.z+12.06272029876709)<1e-8);assert.ok(Math.abs(hits[0].point.y-30.47867139962704)<1e-8);
});

test('current ordinary spawn lower-eave occlusion is disclosed, never solved by camera pitch claims',()=>{
 for(const cy of [d.innerHeight/4,-d.innerHeight/4]){
  const hits=hitsTo([0,1.7,-50.4],target(0,cy),roof);assert.ok(hits.length,'This fixed spawn limitation must be re-reviewed if geometry changes');
  assert.equal(hits[0].object.material.name,'rafters');
 }
});
