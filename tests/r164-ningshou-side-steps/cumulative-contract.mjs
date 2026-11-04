// Test-only separation of the side builder from two precisely identified later features.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {library} from '../lib/inner-palace-fixture.mjs';
import {rawSnapshot,hash} from './snapshot.mjs';
const root=new URL('../../',import.meta.url),origin=new URL('src/scene/zones/ZoneBase.js',root);
export const gateHooks=['buildNingshouSideApproach','fitNingshouFrontHall','buildYangxingFrontCeiling'].map(fn=>`    ${fn}(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});\n`);
export function assertGateHookOrder(source){
 for(const line of gateHooks)assert.equal(source.split(line).length-1,1,'one exact '+line.trim());
 assert.ok(source.includes(gateHooks.join('')),'side approach, front hall, ceiling order is exact');
}
export function sideOnlySource(source){
 assertGateHookOrder(source);
 const isolated=source.replace(gateHooks[1],'').replace(gateHooks[2],'');
 assert.equal(isolated.replace(gateHooks[0],gateHooks.join('')),source,'only two later hook lines removed');
 return isolated;
}
const source=sideOnlySource(fs.readFileSync(origin,'utf8'));
const code=source.replace(/(^import[^\n]*?\bfrom\s*)(['"])([^'"]+)\2/gm,(_m,prefix,q,p)=>prefix+q+(p==='three'?new URL('node_modules/three/build/three.module.js',root).href:new URL(p,origin).href)+q);
const SideOnlyZone=(await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).ZoneBase;
export function sideOnlyFixture(name='宁寿门'){
 const zone=JSON.parse(fs.readFileSync(new URL('data/zones/ningshou.json',root))),item=zone.items.find(i=>i.kind==='gate'&&i.name===name),b=new SideOnlyZone(library(),zone),width=b.buildGate(item),f=b.kit.root.children.at(-1);
 return {b,kit:b.kit,f,width,dispose:()=>b.kit.dispose(b.kit.root)};
}
export function assertOriginalObjects(actual,expected){
 const steps=[];actual.f.traverse(m=>{if(m.isMesh&&m.userData.r164NingshouSideStep===true)steps.push(m)});
 assert.ok(steps.length===0||steps.length===10,'only the ten real side-step meshes may be excluded');
 const names=steps.map(m=>m.name);assert.equal(new Set(names).size,steps.length);
 for(const collection of ['colliders','walkables']){
  const added=actual.kit[collection].filter(c=>c.r164NingshouSideStep);assert.equal(added.length,steps.length,'exact side-step '+collection+' membership');
  assert.deepEqual(added.map(c=>c.ningshouStepId).toSorted(),names.toSorted(),'only named real step physics may be excluded');
 }
 assert.deepEqual(rawSnapshot(actual.f),rawSnapshot(expected.f));
 assert.equal(hash(actual.kit.colliders.filter(c=>!c.r164NingshouSideStep)),hash(expected.kit.colliders));
 assert.equal(hash(actual.kit.walkables.filter(c=>!c.r164NingshouSideStep)),hash(expected.kit.walkables));
 for(const key of ['rooms','mapItems','regions'])assert.equal(hash(actual.kit[key]),hash(expected.kit[key]),key);
 const plaques=q=>q.kit.plaques.map(({mesh,frame,text})=>({text,mesh:rawSnapshot(mesh),frame:rawSnapshot(frame)}));
 assert.deepEqual(plaques(actual),plaques(expected));assert.equal(actual.width,expected.width);
}
// The expected changes are fixed independently of fitNingshouFrontHall and its selectors.
export function applyFrozenFrontHallExpectation(frozen){
 const fixed=[{index:22,name:'wall_red',x:-3.14,y:3.75,depth:8.62},{index:23,name:'wall_brick',x:-3.14,y:.95,depth:8.72},{index:24,name:'wall_red',x:3.14,y:3.75,depth:8.62},{index:25,name:'wall_brick',x:3.14,y:.95,depth:8.72}];
 for(const {index,name,x,y,depth} of fixed){
  const m=frozen.f.children[index];assert.ok(m.isMesh);assert.equal(m.material.name,name);assert.ok(Math.abs(m.position.x-x)<1e-12);assert.equal(m.position.y,y);assert.equal(m.position.z,0);
  // Cloning gives the expected fixture its own geometry; it never calls production fitting.
  m.geometry=m.geometry.clone().scale(1,1,.5).translate(0,0,depth/4);
 }
 for(const [index,x] of [[19,-297.64],[20,-291.36]]){
  const c=frozen.kit.colliders[index];assert.deepEqual(c.min.toArray(),[x,.45,219.69]);assert.deepEqual(c.max.toArray(),[x+1,3.45,228.31]);c.min.z=224;c.r164NingshouFrontPier=true;
 }
 return frozen;
}
const ceilingId='place-ningshou-65cdb57c48-front-ceiling',ceilingName='yangxing-central-front-flat-ceiling';
export function assertYangxingRetained(actual,frozen){
 const groups=[];actual.f.traverse(q=>{if(q.userData.structure?.id===ceilingId)groups.push(q)});
 assert.equal(groups.length,1,'one exact ceiling group');const g=groups[0];assert.ok(g.parent===actual.f,'ceiling parent is the original gate');assert.equal(g.name,ceilingName);assert.ok(actual.f.children.at(-1)===g,'ceiling is the sole final addition');assert.equal(g.children.length,2);
 assert.deepEqual(g.position.toArray(),[0,0,0]);assert.deepEqual(g.quaternion.toArray(),[0,0,0,1]);assert.deepEqual(g.scale.toArray(),[1,1,1]);
 const tagged=[];actual.f.traverse(q=>{if(q.userData.yangxingFrontCeiling===true)tagged.push(q)});assert.equal(tagged.length,2,'exact two ceiling-marked objects');assert.ok(tagged.every((m,i)=>m===g.children[i]),'no unknown ceiling-marked object');
 const expected=new T.Group(),edgeMaterial=new T.MeshStandardMaterial({color:0x173d60,roughness:.85}),paintedMaterial=new T.MeshStandardMaterial({roughness:.85}),texture=new T.Texture();
 edgeMaterial.name='r164_yangxing_ceiling_edge_fit';paintedMaterial.name='r164_yangxing_ceiling_paint_fit';texture.name='r164_yangxing_flat_grid_ceiling_fit';paintedMaterial.map=texture;
 const edge=new T.Mesh(new T.BoxGeometry(3.62,.06,2.815),edgeMaterial),face=new T.Mesh(new T.PlaneGeometry(3.62,2.815).rotateX(Math.PI/2),paintedMaterial);
 edge.name=ceilingName+'/thin-backing';face.name=ceilingName+'/painted-underside';edge.position.set(0,6.48,-2.0575);face.position.set(0,6.449,-2.0575);
 for(const m of [edge,face]){m.castShadow=false;m.receiveShadow=true;expected.add(m)}
 expected.position.copy(actual.f.position);expected.updateWorldMatrix(true,true);
 try{
  assert.deepEqual(g.children.map(m=>m.name),[edge.name,face.name]);assert.ok(g.children.every(m=>m.isMesh&&m.userData.yangxingFrontCeiling===true));
  const snapshot=rawSnapshot(g);assert.equal(snapshot.meshes,2);assert.equal(snapshot.triangles,14);assert.deepEqual(snapshot,rawSnapshot(expected),'exact ceiling geometry/material/placement');
  actual.f.remove(g);try{assertOriginalObjects(actual,frozen)}finally{actual.f.add(g)}
 }finally{edge.geometry.dispose();face.geometry.dispose();edgeMaterial.dispose();paintedMaterial.dispose();texture.dispose()}
}
