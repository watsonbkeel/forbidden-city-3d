import {restoreWumenFootRoundoff} from '../lib/wumen-vertical-profile-controls.mjs';
import {restorePreWumenAscent} from '../lib/wumen-ascent-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {captureGate} from '../lib/gate-tower-fixture.mjs';
import {restoreGatePlaques} from '../lib/gate-plaque-retention.mjs';
import {assertRetainedGate,restoreGateRails,railPaths,atPath,verticalIndices} from '../lib/gate-rail-retention.mjs';
import * as THREE from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {buildGateAscent} from '../../src/scene/palace/gateAscent.js';
import {buildGateTowerShell} from '../../src/scene/palace/special/GateTowerShell.js';
import {shenwuTowerGeometry} from '../../src/scene/palace/special/GateTowerProfiles.js';
const baseline=JSON.parse(fs.readFileSync(new URL('../fixtures/v10-gate-rail-d-baseline.json',import.meta.url)));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function groundLeafBounds(c){
 const leaves=c.group.children.filter(m=>m.isMesh&&m.material.name==='door_studded');
 assert.equal(leaves.length,6,'exactly six visible ground leaves are required');
 c.group.updateMatrixWorld(true);
 return leaves.map(leaf=>{
  const box=new THREE.Box3(),vertices=leaf.geometry.attributes.position;
  for(let i=0;i<vertices.count;i++)box.expandByPoint(new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(leaf.matrixWorld));
  box.min.y=Math.max(0,box.min.y);box.max.y=Math.min(3,box.max.y);
  return box.translate(new THREE.Vector3(c.data.position.x,0,c.data.position.z));
 });
}
function assertRetainedPhysics(c,name){
 const added=new Set();
 for(const leaf of groundLeafBounds(c)){
  const matches=c.builder.colliders.map((box,index)=>box.equals(leaf)?index:-1).filter(index=>index>=0);
  assert.equal(matches.length,1,'each ground leaf requires exactly one exact collider');
  assert.ok(!added.has(matches[0]),'each ground leaf must identify a distinct collider');
  added.add(matches[0]);
 }
 const rounded=name==='午门'?restoreWumenFootRoundoff(c.builder.colliders):c.builder.colliders;
 const colliders=rounded.filter((_,index)=>!added.has(index));
 assert.equal(hash({colliders,walkables:c.builder.walkables}),baseline[name].physics,'historical gate physics changed');
}
for(const name of ['午门','神武门']){
 // Preserve all original capless assertions and mutation probes in their exact
 // historical scope; the newer ascent is completely validated before restoration.
 const c=restorePreWumenAscent(captureGate(name));
 test(`${name}: exact listed rail caps removed; all other D geometry retained after finite V12 plaque restoration`,()=>assertRetainedGate(c,name,baseline[name]));
 test(`${name}: original physics retained after exactly six leaf proxies; historical budget restored only for exact V12 plaque slots`,()=>{
  assertRetainedPhysics(c,name);
  let meshes=0,triangles=0;const materials=new Set();restoreGatePlaques(c,name).group.traverse(m=>{if(m.isMesh){meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;materials.add(m.material);}});
  assert.equal(meshes,baseline[name].meshes);assert.equal(materials.size,baseline[name].materials);
  assert.equal(triangles,baseline[name].triangles-4*railPaths[name].length+(name==='午门'?424:0));
 });
 test(`${name}: physics retention rejects a missing or duplicate proxy for every ground leaf`,()=>{
  for(const leaf of groundLeafBounds(c)){
   const matches=c.builder.colliders.map((box,index)=>box.equals(leaf)?index:-1).filter(index=>index>=0);
   assert.equal(matches.length,1,'the unmutated fixture has exactly one proxy per leaf');
   const index=matches[0],colliders=c.builder.colliders;
   for(const changed of [colliders.filter((_,i)=>i!==index),[...colliders,colliders[index].clone()]]){
    assert.throws(()=>assertRetainedPhysics({...c,builder:{...c.builder,colliders:changed}},name),/each ground leaf requires exactly one exact collider/);
   }
  }
 });
 test(`${name}: exact leaf normalization cannot hide old collider or support drift`,()=>{
  const leaves=groundLeafBounds(c),colliders=c.builder.colliders.map(box=>box.clone());
  const old=colliders.find(box=>!leaves.some(leaf=>box.equals(leaf)));assert.ok(old);old.max.x+=0.001;
  assert.throws(()=>assertRetainedPhysics({...c,builder:{...c.builder,colliders}},name),/historical gate physics changed/);
  const walkables=c.builder.walkables.map(w=>w.type==='box'?{...w,box:w.box.clone()}:{...w});
  const support=walkables.find(w=>w.type==='box');assert.ok(support);support.box.max.y+=0.001;
  assert.throws(()=>assertRetainedPhysics({...c,builder:{...c.builder,walkables}},name),/historical gate physics changed/);
 });
 test(`${name}: narrow restoration never mutates source geometry`,()=>{
  const before=railPaths[name].map(p=>atPath(c.group,p).geometry),arrays=before.map(g=>Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,a.array.slice()])));
  restoreGateRails(c,name);
  railPaths[name].forEach((p,i)=>{const g=atPath(c.group,p).geometry;assert.equal(g,before[i]);for(const [k,a]of Object.entries(arrays[i]))assert.deepEqual(g.attributes[k].array,a);});
 });
 test(`${name}: retention guard rejects unrelated geometry and every rail attribute/index/material drift`,()=>{
  assertRetainedGate(c,name,baseline[name]);
  const changed=c.group.clone(true);let other;changed.traverse(m=>{if(!other&&m.isMesh&&m.material.name!=='balustrade')other=m;});other.geometry=other.geometry.clone();other.geometry.attributes.uv.array[0]+=.25;
  assert.throws(()=>assertRetainedGate({...c,group:changed},name,baseline[name]));
  for(const path of railPaths[name])for(const kind of ['position','normal','uv','cap-uv','cap-position','index','index-type','index-shape','index-normalized','winding','groups','range','normalized','material','flags']){
   const group=c.group.clone(true),m=atPath(group,path);m.geometry=m.geometry.clone();
   if(kind==='material'){m.material=m.material.clone();m.material.alphaTest=.4;}
   else if(kind==='flags')m.castShadow=!m.castShadow;
   else if(kind==='cap-uv')m.geometry.attributes.uv.array[24]+=.25;
   else if(kind==='cap-position')m.geometry.attributes.position.array[36]+=.25;
   else if(kind==='normalized')m.geometry.attributes.normal.normalized=true;
   else if(kind==='range')m.geometry.setDrawRange(0,3);
   else if(kind==='index-type')m.geometry.setIndex(new c.THREE.Uint32BufferAttribute(m.geometry.index.array,1));
   else if(kind==='index-shape'){m.geometry.index.itemSize=2;m.geometry.index.count=12;}
   else if(kind==='index-normalized')m.geometry.index.normalized=true;
   else if(kind==='winding'){const a=m.geometry.index.array;[a[0],a[1]]=[a[1],a[0]];}
   else if(kind==='groups')m.geometry.groups[0].count=3;
   else if(kind==='index')m.geometry.index.array[0]=12;
   else m.geometry.attributes[kind].array[0]+=.25;
   assert.throws(()=>assertRetainedGate({...c,group},name,baseline[name]),`${path} ${kind} must be rejected`);
  }
 });
}

for(const quality of ['hd','sd'])test(`${quality}: existing 3m U/materials retained, only opt-in rail sides use full-height V`,()=>{
 const lib=new TextureLibrary({quality});
 lib.manifest=JSON.parse(fs.readFileSync(new URL(`../../public/textures/${quality}/manifest.json`,import.meta.url)));
 // Real material/wrapping factories with placeholder textures; no decode/GPU claim.
 for(const name of Object.keys(TEXTURE_SPECS)){
  lib.colors.set(name,lib.configure(new THREE.Texture(),name,'color'));
  if(lib.manifest.textures[name]?.normal)lib.normals.set(name,lib.configure(new THREE.Texture(),name,'normal'));
 }
 const mat=lib.material('balustrade',{alphaTest:.5,side:THREE.DoubleSide});
 assert.equal(lib.tileSize('balustrade'),3);
 for(const t of [mat.map,mat.normalMap]){assert.equal(t.wrapS,THREE.RepeatWrapping);assert.equal(t.wrapT,THREE.ClampToEdgeWrapping);assert.deepEqual(t.repeat.toArray(),[1,1]);}
 for(const edge of ['rail','wall',null]){
  const before=new THREE.Group(),after=new THREE.Group(),options={W:120,D:31.9,topY:12.3,band:[9.95,15.95],edge};
  const oldPhysics=buildGateAscent(lib,before,options),newPhysics=buildGateAscent(lib,after,{...options,railFacadeOnly:true});
  assert.deepEqual(newPhysics,oldPhysics);assert.equal(after.children.length,before.children.length);let rails=0;
  before.children.forEach((m,i)=>{const n=after.children[i],a=m.geometry,b=n.geometry;
   assert.equal(n.material,m.material);assert.deepEqual(n.position,m.position);
   assert.deepEqual(b.attributes.position.array,a.attributes.position.array);assert.deepEqual(b.attributes.normal.array,a.attributes.normal.array);
   const expected=a.attributes.uv.array.slice();
   if(m.material===mat){
    rails++;assert.equal(a.index,null,'non-opt-in rails retain original caps');
    assert.deepEqual(Array.from(b.index.array),verticalIndices);
    const ys=verticalIndices.map(j=>a.attributes.position.getY(j)),lo=Math.min(...ys),h=Math.max(...ys)-lo;
    for(const j of verticalIndices)expected[j*2+1]=(a.attributes.position.getY(j)-lo)/h;
   }else{assert.deepEqual(b.index,a.index);assert.deepEqual(b.groups,a.groups);}
   assert.deepEqual(b.attributes.uv.array,expected,'all U bytes and non-opt-in UVs retained');
  });assert.equal(rails,edge==='rail'?4:0);
 }
 const tower=buildGateTowerShell(lib,shenwuTowerGeometry()),rails=tower.children.filter(m=>m.userData.gatePart==='local-hall-balustrade');
 assert.equal(rails.length,8);
 for(const m of rails){
  assert.equal(m.material,mat);const g=m.geometry,{position:p,normal:n,uv}=g.attributes,expected=new Float32Array(uv.array.length);
  const ys=Array.from({length:p.count},(_,i)=>p.getY(i)),lo=Math.min(...ys),h=Math.max(...ys)-lo;
  for(let i=0;i<p.count;i++){const cap=Math.abs(n.getY(i))>.5;expected[i*2]=(cap||Math.abs(n.getZ(i))>.5?p.getX(i):p.getZ(i))/3;expected[i*2+1]=cap?.5:(p.getY(i)-lo)/h;}
  assert.deepEqual(uv.array,expected,'Shenwu full original band UV, including unused caps');
 }
 lib.dispose();
});
