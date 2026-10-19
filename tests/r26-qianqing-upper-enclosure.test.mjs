import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildRoof} from '../src/scene/RoofBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
import {paintQianqingUpperEnclosure as paint} from '../src/scene/palace/QianqingUpperEnclosure.js';
const d=PALACE_LAYOUT.find(x=>x.name==='乾清宫'),H=THREE.MathUtils.clamp((d.dimensions.height-7)*.38,5,11);
function setup(production=false){const lib=library();if(production){const old=lib.material;lib.material=(n,p)=>{const m=old(n,p);m.name=n+'_material';return m;};}const roof=buildRoof(lib,{type:'wudian',width:d.dimensions.width+.6,depth:d.dimensions.depth+.6,baseY:2.16+H,layers:2,brackets:true,sides:4});return{lib,roof};}
function triangles(roof){const rows=[];roof.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,i=m.geometry.index;for(let j=0;j<(i?.count??p.count);j+=3){const ids=[0,1,2].map(k=>i?i.getX(j+k):j+k);rows.push(JSON.stringify(ids.map(k=>[p.getX(k),p.getY(k),p.getZ(k),n.getX(k),n.getY(k),n.getZ(k)])));}});return rows.sort();}
function dispose(roof){const geos=new Set(),mats=new Set();roof.traverse(m=>{if(m.isMesh){geos.add(m.geometry);mats.add(m.material);}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}

test('only the two existing south-facing body triangles change material, without new geometry',()=>{
 const{lib,roof}=setup(),body=roof.children.find(m=>m.material?.name==='wood_column'),old=body.geometry.clone(),before=triangles(roof),materials=new Set(roof.children.map(m=>m.material)),band=structuredClone(roof.userData.doubleEaveMountingBand);
 try{assert.equal(paint(roof,lib,'乾清宫'),true);assert.deepEqual(triangles(roof),before);assert.deepEqual(roof.userData.doubleEaveMountingBand,band);
  const face=roof.children.find(m=>m.userData.qianqingUpperEnclosure);assert.equal(face.geometry.attributes.position.count,6);assert.equal(body.geometry.attributes.position.count,18);assert.equal(face.material.name,'caihua_beam');assert.ok(materials.has(face.material));assert.equal(new Set(roof.children.map(m=>m.material)).size,materials.size);
  for(const key of Object.keys(old.attributes))assert.deepEqual([...body.geometry.attributes[key].array],[...old.attributes[key].array.slice(6*old.attributes[key].itemSize)],'east/north/west attributes stay exact');
  for(const key of['position','normal'])assert.deepEqual([...face.geometry.attributes[key].array],[...old.attributes[key].array.slice(0,6*old.attributes[key].itemSize)]);
  assert.equal(roof.userData.qianqingUpperEnclosure.trianglesAdded,0);assert.equal(roof.userData.qianqingUpperEnclosure.trianglesReassigned,2);
 }finally{old.dispose();dispose(roof);}
});

test('UV visible top uses body top below the existing narrow beam, not the upper soffit',()=>{
 const{lib,roof}=setup();try{const body=roof.children.find(m=>m.material?.name==='wood_column');body.geometry.computeBoundingBox();const top=body.geometry.boundingBox.max.y;paint(roof,lib,'乾清宫');const f=roof.children.find(m=>m.userData.qianqingUpperEnclosure),p=f.geometry.attributes.position,uv=f.geometry.attributes.uv,meta=f.userData.qianqingUpperEnclosure;
  assert.equal(meta.visibleTop,top);assert.ok(top<roof.userData.doubleEaveMountingBand.upperY);assert.equal(meta.visibleBottom,roof.userData.doubleEaveMountingBand.lowerY);
  for(let i=0;i<p.count;i++)assert.ok(Math.abs(uv.getY(i)-(p.getY(i)-meta.visibleBottom)/(top-meta.visibleBottom))<1e-5);
  assert.match(meta.status,/APPROXIMATE/);assert.equal(meta.face,'south');assert.equal(f.castShadow,true);assert.equal(f.receiveShadow,true);
 }finally{dispose(roof);}
});

test('actual TextureLibrary names work and invalid envelopes or repeated application fail closed',()=>{
 const{lib,roof}=setup(true);try{assert.equal(paint(roof,lib,'乾清宫'),true);assert.throws(()=>paint(roof,lib,'乾清宫'),/Unregistered/);}finally{dispose(roof);}
 for(const mutate of[
  r=>{delete r.userData.doubleEaveMountingBand;},
  r=>{r.userData.doubleEaveMountingBand.halfDepth+=.1;},
  r=>{r.children.find(m=>m.material?.name==='wood_column').material.name='unknown';},
  r=>{r.children.find(m=>m.material?.name==='caihua_beam').material.name='unknown';},
  r=>{const m=r.children.find(m=>m.material?.name==='wood_column');m.geometry.attributes.position.setZ(0,0);},
 ]){const{lib,roof}=setup();try{mutate(roof);assert.throws(()=>paint(roof,lib,'乾清宫'),/Unregistered/);}finally{dispose(roof);}}
});

test('all other named halls are untouched by this dedicated surface correction',()=>{
 const{lib,roof}=setup();try{const before=hash(triangles(roof)),count=roof.children.length;for(const name of['太和殿','保和殿','午门','神武门','中和殿'])assert.equal(paint(roof,lib,name),false);assert.equal(hash(triangles(roof)),before);assert.equal(roof.children.length,count);assert.ok(!roof.userData.qianqingUpperEnclosure);}finally{dispose(roof);}
});
