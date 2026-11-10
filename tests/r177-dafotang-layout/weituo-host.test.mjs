// Exactly one real current production host; no history import, merge or GPU.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
const repo=process.env.R255_REPO??fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(pathToFileURL(repo+'/package.json'));
const T=await import(pathToFileURL(repo+'/node_modules/three/build/three.module.js'));
const {createCanvas}=require('@napi-rs/canvas');
const {CourtKit}=await import(pathToFileURL(repo+'/src/scene/palace/kit.js'));
const {realTextureLibrary}=await import(pathToFileURL(repo+'/tests/lib/r48-real-texture-library.mjs'));
const {buildRemainingHall,resolveRemainingProfile}=await import(pathToFileURL(repo+'/src/scene/palace/special/RemainingOuterHalls.js'));
const {buildDafotangWeituo}=await import(pathToFileURL(repo+'/src/scene/palace/special/DafotangWeituo.js'));
const {triangleBodyIntersects}=await import(pathToFileURL(repo+'/src/utils/TriangleSupport.js'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-5,msg??`${a} vs ${b}`);
test('R255 real single host installs supported east Weituo without overlapping retained architecture',()=>{
 const previousDocument=globalThis.document;let kit,lib;
 try{
  globalThis.document={createElement:()=>createCanvas(1,1)};lib=realTextureLibrary();kit=new CourtKit(lib,'outer-west');
  const item=JSON.parse(fs.readFileSync(repo+'/data/zones/outer-west.json')).items.find(i=>i.name==='大佛堂'),p=resolveRemainingProfile('outer-west',item),{f,g}=buildRemainingHall(kit,item,p);
  const context={kit,f,g,p,item};kit.root.updateMatrixWorld(true);
  assert.equal(g.id,'place-outer-west-6cae88b6a2');assert.equal(g.inventory.status,'UNKNOWN');assert.equal(kit.walkables.length,2);assert.equal(kit.rooms.length,1);
  assert.equal(g.triadFit.id,'dafotang-three-design-figures-v1');assert.equal(g.photoPresentation.status,'BLOCKED');
  assert.equal(kit.colliders.filter(c=>c.dafotangLayoutMesh).length,85);assert.equal(kit.colliders.filter(c=>c.dafotangTriadMesh).length,495);
  const groups=f.children.filter(o=>o.userData.dafotangWeituo);assert.equal(groups.length,1,'R255_TARGET_MISSING_EAST_WEITUO_VISIBLE_GROUP');
  assert.equal(g.weituoFit.id,'dafotang-east-weituo-source-fit-v1');assert.equal(groups[0].userData.dafotangWeituo,g.weituoFit);
  const meshes=groups[0].children;assert.equal(meshes.length,33);const bounds=new T.Box3().setFromObject(groups[0]);near(bounds.min.y,1.32);near(bounds.max.y,3.49);near(bounds.max.y-bounds.min.y,2.17);
  assert.equal(g.weituoFit.heightSource,'WANG_JIAPENG_2015_PRINTED_304');assert.equal(g.weituoFit.colour,'NEUTRAL_NON_ORIGINAL_COLOR_MODEL_FIT');
  assert.deepEqual(groups[0].position.toArray(),[0,0,0]);assert.deepEqual(groups[0].scale.toArray(),[1,1,1]);
  const allOld=[];f.traverse(m=>{if(m.isMesh&&!m.userData.dafotangWeituoRole)allOld.push([m,new T.Box3().setFromObject(m)]);});
  const materials=new Set(),v=new T.Vector3(),v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3();let triangleCount=0,positionBytes=0,soleVertices=0,minMargin=Infinity;
  for(const m of meshes){
   assert.ok(m.visible);assert.ok(m.material.name.startsWith('dafotang_weituo_'));assert.equal(m.material.metalness,0);assert.equal(m.material.roughness,.95);materials.add(m.material);
   const owners=kit.colliders.filter(c=>c.dafotangWeituoMesh===m.uuid);assert.equal(owners.length,1);const c=owners[0];assert.ok(c.equals(new T.Box3().setFromObject(m)));assert.equal(c.dafotangWeituoRole,m.userData.dafotangWeituoRole);
   const pos=m.geometry.attributes.position,ix=m.geometry.index;triangleCount+=ix.count/3;positionBytes+=pos.array.byteLength;
   assert.equal(c.triangleSupport.template.triangles.length,ix.count/3);
   for(let i=0;i<ix.count;i+=3){
    const q=c.triangleSupport.template.triangles[i/3];assert.ok(q.triangle.getArea()>1e-12);
    for(const[k,b]of[[0,q.triangle.a],[1,q.triangle.b],[2,q.triangle.c]]){v.fromBufferAttribute(pos,ix.getX(i+k)).applyMatrix4(m.matrixWorld);v1.copy(b).add(c.triangleSupport.offset);assert.ok(v.distanceTo(v1)<1e-9);}
   }
   for(const[old,box]of allOld)if(c.intersectsBox(box)){v.copy(c.max).min(box.max);v1.copy(c.min).max(box.min);v.sub(v1);assert.ok(Math.min(v.x,v.y,v.z)<1e-5,`overlap ${m.name} / ${old.name}: ${v.toArray()}`);}
   if(m.userData.dafotangWeituoRole.startsWith('boot-'))for(let i=0;i<pos.count;i++)if(Math.abs(pos.getY(i)-1.32)<1e-5){soleVertices++;minMargin=Math.min(minMargin,.425-Math.abs(pos.getX(i)+2.83),.425-Math.abs(pos.getZ(i)-5.6));}
  }
  assert.equal(materials.size,2);assert.ok([...materials].every(m=>kit.owned.filter(q=>q===m).length===1));assert.ok(triangleCount<=4000&&triangleCount>=3500);assert.ok(positionBytes<128*1024);assert.ok(soleVertices>=12);assert.ok(minMargin>.02,`whole-sole margin ${minMargin}`);
  // Actual baked nose/face geometry, not metadata-only yaw, points toward +X.
  const face=meshes.find(m=>m.userData.dafotangWeituoRole==='plain-face').geometry.boundingBox.getCenter(v2),nose=meshes.find(m=>m.userData.dafotangWeituoRole==='nose').geometry.boundingBox.getCenter(v3);
  assert.ok(nose.x>face.x&&nose.z<face.z,'baked face points inward toward centre +X');
  const breast=meshes.find(m=>m.userData.dafotangWeituoRole==='breast-armour'),breastContact=kit.colliders.find(c=>c.dafotangWeituoMesh===breast.uuid);
  assert.equal(triangleBodyIntersects(breastContact.triangleSupport,breastContact.clone()),true,'visible torso has physical triangles');
  const layout=f.children.find(o=>o.name==='dafotang-historic-spatial-fit-v1');
  for(const[role,oldW,oldD,newW,h,y]of[['guardian-pedestal-foot',.62,.75,.87,.1,.97],['guardian-pedestal-waist',.52,.65,.75,.2,1.12],['guardian-pedestal-top',.60,.73,.85,.1,1.27]]){
   const pair=layout.children.filter(m=>m.userData.dafotangLayoutRole===role);assert.equal(pair.length,2);
   for(const m of pair){const b=m.geometry.boundingBox??(m.geometry.computeBoundingBox(),m.geometry.boundingBox),s=b.getSize(v),center=b.getCenter(v1),east=center.x<0;near(s.x,east?newW:oldW);near(s.z,east?newW:oldD);near(s.y,h);near(center.y,y);near(center.x,east?-2.83:2.83);const c=kit.colliders.filter(c=>c.dafotangLayoutMesh===m.uuid);assert.equal(c.length,1);assert.ok(c[0].equals(new T.Box3().setFromObject(m)));}
  }
  const oldChildren=[...f.children],oldColliders=[...kit.colliders],oldOwned=[...kit.owned];let allocations=0;const original=T.BufferGeometry.prototype.setAttribute;T.BufferGeometry.prototype.setAttribute=function(...args){allocations++;return original.apply(this,args)};
  try{assert.throws(()=>buildDafotangWeituo(context),/Exact unchanged triad host/);}finally{T.BufferGeometry.prototype.setAttribute=original;}
  assert.equal(allocations,0);assert.deepEqual(f.children,oldChildren);assert.deepEqual(kit.colliders,oldColliders);assert.deepEqual(kit.owned,oldOwned);
  console.log('R255_HOST_GREEN '+JSON.stringify({meshes:meshes.length,triangles:triangleCount,positionBytes,soleVertices,minSoleMargin:minMargin,walkables:kit.walkables.length,rooms:kit.rooms.length}));
 }finally{try{kit?.dispose(kit.root);}finally{try{lib?.dispose();}finally{globalThis.document=previousDocument;}}}
});
