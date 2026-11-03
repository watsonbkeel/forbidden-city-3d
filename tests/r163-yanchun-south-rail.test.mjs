import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture,meshes,meshRow,hash,THREE} from './lib/r66-h/fixture.mjs';
import * as fit from '../src/scene/palace/special/YanchunSouthPhotoFit.js';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r163-yanchun-rail/baseline.json',import.meta.url)));
function members(w){const first=w.f.children.findIndex(m=>m.userData.role==='yanchun-upper-balcony-rail'&&m.position.z<0),south=w.f.children.slice(first,first+27),set=new Set(south),corners=meshes(w.f).filter(m=>!set.has(m)&&m.userData.role==='yanchun-upper-balcony-rail-baluster'&&Math.abs(m.position.z+8.12)<1e-8);return{south,corners};}
function context(w){return{kit:w.kit,f:w.f,item:w.item,p:w.p,g:w.g};}

test('R163 south-only pale turned railing distinguishes observed appearance from retained fitted repeats',()=>{
 const w=fixture('延春阁');try{
  const {south,corners}=members(w),bars=south.slice(2),info=w.f.userData.r163YanchunSouthRail;
  assert.equal(bars.length,25);assert.ok(bars.every(m=>m.geometry.type==='LatheGeometry'),'the 25 retained south bars must be turned, not square');
  assert.equal(info.photo,baseline.source);assert.equal(info.photoSHA256,baseline.sourceSHA256);
  assert.equal(info.status,'PHOTO_FIT_NOT_SURVEYED');assert.equal(info.repeatCountStatus,'RETAINED_MODEL_25_NOT_PHOTO_COUNT');
  assert.equal(info.dimensions,'RETAINED_MODEL_POSITIONS_HEIGHTS_ENVELOPE_NOT_SURVEYED');assert.equal(info.physics,'UNCHANGED_COLLIDERS_AND_NAVIGATION');
  for(const [i,m] of south.entries()){
   assert.deepEqual(m.position.toArray(),baseline.targetMembers[i].position);assert.equal(m.userData.role,baseline.targetMembers[i].role);
   assert.equal(m.material.color.getHexString(),'e6dfca');assert.equal(m.material.name,'yanchun_south_pale_finish_photo_fit');
   assert.equal(m.userData.photo,baseline.source);assert.equal(m.userData.photographyDate,null);
   assert.equal(m.userData.materialInterpretation,'PALE_FINISH_VISIBLE_SUBSTRATE_UNKNOWN');
   if(i<2)assert.deepEqual(m.geometry.parameters,baseline.targetMembers[i].geometry);
   else{
    const geometry=m.geometry;geometry.computeBoundingBox();const b=geometry.boundingBox;
    for(const axis of['x','z']){assert.ok(b.min[axis]>=-.03500001);assert.ok(b.max[axis]<=.03500001);}
    assert.ok(Math.abs(b.min.y+.46)<1e-7);assert.ok(Math.abs(b.max.y-.46)<1e-7);
    const pos=geometry.attributes.position,ix=geometry.index;for(let j=0;j<ix.count;j+=3){const t=new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,ix.getX(j+k))));assert.ok(t.getArea()>1e-10,'no degenerate cap triangles');}
    const profile=geometry.parameters.points;assert.equal(profile[0].x,0);assert.equal(profile.at(-1).x,0,'closed top and bottom');assert.ok(Math.max(...profile.map(p=>p.x))>Math.min(...profile.filter(p=>p.x>0).map(p=>p.x))*1.8,'real turned silhouette, not a plain cylinder');
   }
  }
  assert.equal(corners.length,2);for(const [i,m] of corners.entries()){assert.equal(m.geometry.type,'BoxGeometry','side endpoint silhouette retained');assert.equal(m.material,south[0].material);assert.deepEqual({...meshRow(m),materials:baseline.cornerMembers[i].materials},baseline.cornerMembers[i]);}
 }finally{w.dispose();}
});

test('R163 all non-south/corner mesh bytes, complete collision, routes and whole-building envelope match independent baseline',()=>{
 const w=fixture('延春阁');try{const {south,corners}=members(w),set=new Set([...south,...corners]);assert.equal(meshes(w.f).length,baseline.totalMeshes);assert.equal(hash(meshes(w.f).filter(m=>!set.has(m)).map(meshRow)),baseline.retainedMeshes);for(const field of['colliders','walkables','rooms','mapItems','regions'])assert.equal(hash(w.kit[field]),baseline[field],field);const bounds=new THREE.Box3().setFromObject(w.f);assert.deepEqual({min:bounds.min.toArray(),max:bounds.max.toArray()},baseline.bounds);}finally{w.dispose();}
});

test('R163 exact-host and complete-member guard rejects foreign or repeated application without mutation',()=>{
 const w=fixture('延春阁');try{assert.equal(typeof fit.fitYanchunSouthTurnedRail,'function');const before=hash(meshes(w.f).map(meshRow));assert.throws(()=>fit.fitYanchunSouthTurnedRail({...context(w),item:{...w.item,x:217}}),/exact retained host/);assert.equal(hash(meshes(w.f).map(meshRow)),before);assert.throws(()=>fit.fitYanchunSouthTurnedRail(context(w)),/retained south rail/);assert.equal(hash(meshes(w.f).map(meshRow)),before);}finally{w.dispose();}
});
