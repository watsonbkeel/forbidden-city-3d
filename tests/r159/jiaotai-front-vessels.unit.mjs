import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {hallFragment, meshRows, hash} from '../lib/r54-jiaotai-fragment.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
const module = await import('../../src/scene/palace/special/JiaotaiFrontVessels.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const install = (...args)=>{assert.equal(typeof module.buildJiaotaiFrontVessels,'function','missing own-photo pair of tall front vessels');return module.buildJiaotaiFrontVessels(...args);};
const serial=c=>({min:c.min.toArray(),max:c.max.toArray()});

test('own-photo tall lidded pair sits on the existing low platform, distinct from blue braziers and red stands',()=>{
 const h=hallFragment();try {
  const baseline=meshRows(h.group),colliders=h.builder.colliders.map(serial),walkables=hash(h.builder.walkables);
  const record=install(h.builder,h.shell);
  assert.equal(record.id,'jiaotai-front-vessels-r159');assert.equal(record.count,2);
  assert.equal(record.photographyDate,null);assert.equal(record.materialIdentity,'UNVERIFIED_PALE_METAL_APPEARANCE_ONLY');
  assert.equal(record.historicObjectName,null);assert.equal(record.accepted,false);
  assert.equal(record.dimensionStatus,'PHOTO_FIT_TO_RETAINED_PLATFORM_NOT_SURVEYED');
  assert.deepEqual(record.sides,['west','east']);
  const vessels=h.shell.children.filter(o=>o.userData.jiaotaiFrontVessel);assert.equal(vessels.length,2);
  const base=new T.Box3().setFromObject(h.shell.getObjectByName('r54-jiaotai-low-platform'));
  for(const g of vessels){const b=new T.Box3().setFromObject(g);assert.ok(Math.abs(b.min.y-base.max.y)<1e-6);assert.ok(b.min.x>base.min.x&&b.max.x<base.max.x);assert.ok(b.min.z>base.min.z&&b.max.z<base.min.z+.8);assert.ok(b.max.y-b.min.y>.9&&b.max.y-b.min.y<1.1);assert.ok(b.max.x-b.min.x<.4);}
  assert.deepEqual(meshRows(h.group).filter(o=>!o.name.startsWith('r159-jiaotai-')),baseline,'all pre-existing vertices, UVs, materials and transforms exact');
  assert.deepEqual(h.builder.colliders.slice(0,colliders.length).map(serial),colliders);assert.equal(hash(h.builder.walkables),walkables,'no extra standable planes or rescue support');
 }finally{h.builder.dispose();}
});

test('only small visible-part envelopes are registered; central observation and four openings remain clear',()=>{
 const h=hallFragment();try {
  const start=h.builder.colliders.length,record=install(h.builder,h.shell);h.group.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(h.builder.colliders);cm.addWalkables(h.builder.walkables);
  assert.equal(record.colliders.length,h.builder.colliders.length-start);assert.equal(record.colliders.length,6);
  assert.deepEqual(h.builder.colliders.slice(start).map(c=>c.r159JiaotaiFrontVessel),record.colliders.map(c=>c.owner),'explicit new-owner tags allow exact original order comparison after real merge');
  for(const c of record.colliders){const m=h.shell.getObjectByName(c.owner);assert.ok(m);const b=new T.Box3().setFromObject(m);assert.deepEqual(c.min,b.min.toArray());assert.deepEqual(c.max,b.max.toArray());assert.ok(b.max.x-b.min.x<.4);assert.ok(b.max.z-b.min.z<.4);}
  for(const p of h.shell.userData.structure.portals)assert.equal(cm.checkCollision(new T.Vector3(p.center[0],3.86,p.center[1]),.5),false,p.side);
  for(let z=345;z<=355.25;z+=.1)assert.equal(cm.checkCollision(new T.Vector3(0,3.86,z),.5),false,'central observation approach');
  assert.equal(record.contact,'VISIBLE_PART_AABB_ENVELOPES_NO_NEW_WALKABLE_OR_EXACT_TRIANGLE_CLAIM');
 }finally{h.builder.dispose();}
});

test('canonical anchor, transformed ancestors, other halls and duplicate calls reject before mutation',()=>{
 for(const kind of ['other','transform','ancestor','shift-platform','frame','same-bounds-top-warp','normal-tamper','uv-tamper']){
  const h=hallFragment(kind==='other'?'中和殿':'交泰殿');try{
   if(kind==='transform')h.shell.rotation.y=.01;
   if(kind==='ancestor')h.group.position.x=.01;
   if(kind==='shift-platform')h.shell.getObjectByName('r54-jiaotai-low-platform').position.x+=.01;
   if(kind==='frame')h.shell.userData.structure.displaySetting.frame.z+=1;
   if(kind==='same-bounds-top-warp'){const g=h.shell.getObjectByName('r54-jiaotai-low-platform').geometry,p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getX(i)>0&&p.getY(i)>0&&p.getZ(i)<0)p.setY(i,-.08);g.computeBoundingBox();}
   if(kind==='normal-tamper')h.shell.getObjectByName('r54-jiaotai-low-platform').geometry.attributes.normal.setY(0,.25);
   if(kind==='uv-tamper')h.shell.getObjectByName('r54-jiaotai-low-platform').geometry.attributes.uv.setX(0,.25);
   const state=hash({meshes:meshRows(h.group),colliders:h.builder.colliders.map(serial),materials:h.builder.ownedMaterials.length});
   assert.throws(()=>install(h.builder,h.shell),/Jiaotai|missing own-photo/);
   assert.equal(hash({meshes:meshRows(h.group),colliders:h.builder.colliders.map(serial),materials:h.builder.ownedMaterials.length}),state);
  }finally{h.builder.dispose();}
 }
 const h=hallFragment();try{install(h.builder,h.shell);const state=hash({meshes:meshRows(h.group),colliders:h.builder.colliders.map(serial),materials:h.builder.ownedMaterials.length});assert.throws(()=>install(h.builder,h.shell),/already/);assert.equal(hash({meshes:meshRows(h.group),colliders:h.builder.colliders.map(serial),materials:h.builder.ownedMaterials.length}),state);}finally{h.builder.dispose();}
});

test('new geometry is finite, nondegenerate, closed positive-volume lathe with independently owned reusable material',()=>{
 const h=hallFragment();try{
  install(h.builder,h.shell);const mats=new Set();let count=0;
  h.shell.traverse(m=>{if(!m.isMesh||!m.name.startsWith('r159-jiaotai-'))return;count++;mats.add(m.material);const p=m.geometry.attributes.position,ix=m.geometry.index;assert.ok(Array.from(p.array).every(Number.isFinite));let volume=0;const edges=new Map(),key=v=>v.toArray().map(x=>Math.round(x*1e5)).join(',');
   for(let i=0;i<ix.count;i+=3){const [a,b,c]=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+j)));assert.ok(b.clone().sub(a).cross(c.clone().sub(a)).lengthSq()>1e-14);volume+=a.dot(b.clone().cross(c))/6;for(const [v,w]of[[a,b],[b,c],[c,a]]){const k=[key(v),key(w)].sort().join('|');edges.set(k,(edges.get(k)??0)+1);}}
   assert.ok(volume>0);for(const n of edges.values())assert.equal(n,2);
  });assert.equal(count,6);assert.equal(mats.size,1);for(const m of mats)assert.ok(h.builder.ownedMaterials.includes(m));
 }finally{h.builder.dispose();}
});

test('normal PalaceBuilder resource ownership disposes shared vessel geometry/material exactly once',()=>{
 const h=hallFragment();install(h.builder,h.shell);h.builder.ownedObjects.add(h.group);
 const resources=new Set();h.shell.traverse(m=>{if(m.isMesh&&m.name.startsWith('r159-jiaotai-')){resources.add(m.geometry);resources.add(m.material);}});
 const counts=new Map();for(const r of resources){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));}
 h.builder.dispose();assert.equal(resources.size,4);for(const count of counts.values())assert.equal(count,1);assert.equal(h.builder.colliders.length,0);assert.equal(h.builder.walkables.length,0);
});


test('collision envelopes match independently refreshed full-tree rendered vertices, never local origin',()=>{
 const h=hallFragment();try{const r=install(h.builder,h.shell);h.group.updateMatrixWorld(true);
  for(const row of r.colliders){const m=h.shell.getObjectByName(row.owner),positions=m.geometry.attributes.position,box=new T.Box3();for(let i=0;i<positions.count;i++)box.expandByPoint(new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(m.matrixWorld));
   assert.deepEqual(row.min,box.min.toArray());assert.deepEqual(row.max,box.max.toArray());assert.ok(Math.abs(box.min.x)>1.8);assert.ok(box.min.y>2.38);assert.ok(box.min.z>355.3);
   const matches=h.builder.colliders.filter(c=>c.r159JiaotaiFrontVessel===row.owner);assert.equal(matches.length,1);assert.ok(matches[0].equals(box));
  }
 }finally{h.builder.dispose();}
});

for(const failAt of [1,2,6])test(`registration failure at collider ${failAt} rolls back all resources, geometry and ownership then retries once`,t=>{
 const h=hallFragment();try{const originalCol=h.builder.col,oldMeshes=meshRows(h.group),oldColliders=[...h.builder.colliders],oldMaterials=[...h.builder.ownedMaterials],oldOwn=[...h.builder._own];let calls=0;
  const geometries=[],materials=[],disposeGeometry=T.BufferGeometry.prototype.dispose,disposeMaterial=T.Material.prototype.dispose;
  const gs=t.mock.method(T.BufferGeometry.prototype,'dispose',function(...a){geometries.push(this);return disposeGeometry.apply(this,a);});
  const ms=t.mock.method(T.Material.prototype,'dispose',function(...a){materials.push(this);return disposeMaterial.apply(this,a);});
  h.builder.col=function(...args){calls++;if(calls===failAt)throw Error('injected col registration failure');return originalCol.apply(this,args);};
  assert.throws(()=>install(h.builder,h.shell),/injected/);gs.mock.restore();ms.mock.restore();
  assert.deepEqual(meshRows(h.group),oldMeshes);assert.deepEqual(h.builder.colliders,oldColliders);assert.deepEqual(h.builder.ownedMaterials,oldMaterials);assert.deepEqual([...h.builder._own],oldOwn);assert.equal(h.shell.userData.structure.frontVessels,undefined);
  assert.equal(geometries.length,3);assert.equal(new Set(geometries).size,3);assert.equal(materials.length,1);
  h.builder.col=originalCol;const r=install(h.builder,h.shell);assert.equal(r.count,2);assert.equal(h.builder.colliders.length,oldColliders.length+6);assert.equal(h.shell.children.filter(g=>g.userData.jiaotaiFrontVessel).length,2);
 }finally{h.builder.dispose();}
});

for(const failAt of [1,3,6])test(`registration append-then-throw at collider ${failAt} rolls back before a clean retry`,()=>{
 const h=hallFragment();try{const col=h.builder.col,start=h.builder.colliders.length,old=hash({meshes:meshRows(h.group),colliders:h.builder.colliders,materials:h.builder.ownedMaterials.map(m=>m.uuid)});let n=0;
  h.builder.col=function(...args){col.apply(this,args);if(++n===failAt)throw Error('injected after append');};assert.throws(()=>install(h.builder,h.shell),/injected/);
  assert.equal(hash({meshes:meshRows(h.group),colliders:h.builder.colliders,materials:h.builder.ownedMaterials.map(m=>m.uuid)}),old);assert.equal(h.shell.userData.structure.frontVessels,undefined);h.builder.col=col;install(h.builder,h.shell);assert.equal(h.builder.colliders.length,start+6);
 }finally{h.builder.dispose();}
});

test('only the refreshed new owners collide at the visible upright, not at the world origin',()=>{
 const h=hallFragment();try{install(h.builder,h.shell);h.group.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(h.builder.colliders.filter(c=>c.r159JiaotaiFrontVessel));
  for(const sign of[-1,1])assert.equal(cm.checkCollision(new T.Vector3(sign*2.08,3.5,355.6),.10),true);
  assert.equal(cm.checkCollision(new T.Vector3(0,1.0,0),.05),false);
 }finally{h.builder.dispose();}
});

test('ground-control-matched own-photo projection fits the observed front-vessel height and foot width ranges',()=>{
 const h=hallFragment();try{const r=install(h.builder,h.shell);h.group.updateMatrixWorld(true);
  // 13ecc... original1365x1720 eye-read control ranges, not a camera survey.
  // Only visible front edge + feet are fitted; hidden rear corners not invented.
  const camera=new T.PerspectiveCamera(47.78157574,1365/1720,.03,100),pitch=T.MathUtils.degToRad(6.21513954),yaw=T.MathUtils.degToRad(-1.47044264);
  camera.position.set(.3,3.86,343.8);camera.lookAt(camera.position.clone().add(new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch))));camera.updateMatrixWorld(true);
  const pixel=v=>{const p=v.clone().project(camera);return[(p.x+1)*1365/2,(1-p.y)*1720/2];};
  const edge=[pixel(new T.Vector3(2.4,2.390000001490116,355.30000004768374)),pixel(new T.Vector3(-2.4,2.390000001490116,355.30000004768374))],width=Math.hypot(edge[1][0]-edge[0][0],edge[1][1]-edge[0][1]);
  for(const [i,expected]of [[0,[272,1327]],[1,[1091,1325]]]){assert.ok(Math.abs(edge[i][0]-expected[0])<5);assert.ok(Math.abs(edge[i][1]-expected[1])<5);}
  for(const [side,expected]of[['west',[327,1322]],['east',[1033,1317]]]){const foot=h.shell.children.find(o=>o.userData.jiaotaiFrontVessel?.side===side),point=pixel(foot.position);for(let axis=0;axis<2;axis++)assert.ok(Math.abs(point[axis]-expected[axis])<5,side+' source-foot ground control residual');}
  const g=h.shell.children.find(o=>o.userData.jiaotaiFrontVessel?.side==='west'),box=new T.Box3().setFromObject(g),bottom=pixel(g.position),top=pixel(g.position.clone().setY(box.max.y)),ratio=(bottom[1]-top[1])/width;
  assert.ok(ratio>=.19&&ratio<=.22,`height/low-front-width projection ${ratio}`);
  const foot=h.shell.getObjectByName('r159-jiaotai-west-round-foot'),fb=new T.Box3().setFromObject(foot),l=pixel(new T.Vector3(fb.max.x,fb.min.y,g.position.z)),rr=pixel(new T.Vector3(fb.min.x,fb.min.y,g.position.z)),footRatio=Math.abs(rr[0]-l[0])/width;
  assert.ok(footRatio>=.04&&footRatio<=.06,`foot/front-width projection ${footRatio}`);assert.equal(r.height,1.0);
 }finally{h.builder.dispose();}
});

test('real finish/merge disposes three source geometries once and later releases only the merged candidate and its owned material',()=>{
 const h=hallFragment();install(h.builder,h.shell);const sources=new Set(),counts=new Map();let material;
 h.shell.traverse(m=>{if(m.isMesh&&m.name.startsWith('r159-jiaotai-')){sources.add(m.geometry);material=m.material;}});
 for(const g of sources){counts.set(g,0);g.addEventListener('dispose',()=>counts.set(g,counts.get(g)+1));}
 let materialDisposals=0;material.addEventListener('dispose',()=>materialDisposals++);
 const finished=h.builder.finish(h.group),meshes=[];finished.traverse(m=>{if(m.isMesh&&m.material===material)meshes.push(m);});assert.equal(meshes.length,1);
 for(const n of counts.values())assert.equal(n,1);let mergedDisposals=0;meshes[0].geometry.addEventListener('dispose',()=>mergedDisposals++);
 h.builder.dispose();assert.equal(mergedDisposals,1);assert.equal(materialDisposals,1);for(const n of counts.values())assert.equal(n,1);
});
