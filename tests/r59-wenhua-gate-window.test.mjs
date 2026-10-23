import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {api,fixture,target,parts,meshes,triangles,row,snapshot,hash,physical,ray,dispose} from './lib/r59-wenhua-gate-window-fixture.mjs';
const apply=f=>{assert.equal(typeof api.applyWenhuaGateSouthWindows,'function','dedicated bounded Wenhua south-window helper required');return api.applyWenhuaGateSouthWindows(f.kit,f.frame);};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);

test('one right-hand Wenhua south face receives stone below real red frame; all non-target geometry and physics remain exact',()=>{
 const f=fixture(),before=snapshot(f);assert.equal(apply(f),true);const after=snapshot(f);
 assert.equal(after.nonTarget,before.nonTarget);assert.equal(after.otherFiveFaces,before.otherFiveFaces);assert.equal(after.physics,before.physics);
 assert.equal(parts(f).filter(m=>m.userData.wenhuaGateSouthWindow.role==='stone-lower-body').length,1);
 assert.equal(parts(f).filter(m=>m.userData.wenhuaGateSouthWindow.role==='red-frame').length,4);
 assert.equal(parts(f).filter(m=>m.userData.wenhuaGateSouthWindow.role==='closed-recess').length,1);
 assert.equal(f.frame.userData.structure.wenhuaSouthWindow.objectId,'FC-5652FA389B');assert.equal(f.frame.userData.structure.wenhuaSouthWindow.photographyDate,null);assert.equal(f.frame.userData.structure.wenhuaSouthWindow.accepted,false);
 for(const m of parts(f)){const b=new THREE.Box3().setFromObject(m);const p=f.frame.position;assert.ok(b.min.x>=p.x-16.05-1e-6&&b.max.x<=p.x-10.43+1e-6);assert.ok(b.min.y>=.8-1e-6&&b.max.y<=7.3+1e-6);assert.ok(b.min.z>=p.z-.3-1e-6&&b.max.z<=p.z+.3+1e-6,'no new uncollided projection');}
 const c=new THREE.PerspectiveCamera(42,16/9,.03,200);c.position.set(0,4,-48);c.lookAt(0,4,0);c.updateMatrixWorld(true);assert.ok(new THREE.Vector3(-13.24,4,0).project(c).x>0,'south-facing-camera screen right is local negative X');dispose(f);
});

test('south closure has no old red wall behind the window, no duplicate front skin and no new opening',()=>{
 const f=fixture();assert.equal(apply(f),true);
 const south=triangles(target(f),(ids,a)=>ids.every(k=>a.normal.getZ(k)<-.999&&Math.abs(a.position.getZ(k)+.3)<1e-6));
 assert.equal(south.length,6,'three disjoint retained-red margins replace the two full-face triangles');
 assert.ok(south.every(tri=>tri.every(v=>v.position[0]<=-2.61+1e-6)||tri.every(v=>v.position[0]>=2.61-1e-6)||tri.every(v=>v.position[1]>=2.9-1e-6)),'red is confined to margins, not left behind the new window');
 for(const [p,role,z] of [[[-13.24,1.4,-1],'stone-lower-body',-.28],[[-15.77,4,-1],'red-frame',-.3],[[-12.6,4,-1],'closed-recess',-.12]]){
  const hits=ray(f,p,[0,0,1],1);assert.equal(hits.length,1,'one front-facing skin away from triangle edges');assert.equal(hits[0].object.userData.wenhuaGateSouthWindow.role,role);near(hits[0].point.z-f.g.z,z);
 }
 assert.equal(f.cm.checkCollision(new THREE.Vector3(f.g.x-13.24,2.5,f.g.z),.5),true,'closed window remains solid');
 for(const x of [-6.62,0,6.62])assert.equal(ray(f,[x,2.7,-1],[0,0,1],2).length,0,'all three door openings remain open');
 assert.match(ray(f,[13.24,4,-1],[0,0,1],2)[0].object.material.name,/wall_red/,'other end wall untouched');
 assert.match(ray(f,[-13.24,4,1],[0,0,-1],2)[0].object.material.name,/wall_red/,'north face retained');dispose(f);
});

test('wrong identity, altered or shared geometry and repeated application fail closed without allocations or mutations',()=>{
 for(const change of [f=>{delete f.frame.userData.structure;},f=>{f.g.profile='wuying';},f=>{f.frame.position.x+=.01;},f=>{target(f).position.x+=.01;},f=>{target(f).geometry.attributes.normal.setZ(30,1);},f=>{target(f).geometry.attributes.position.setX(0,99);},f=>{target(f).geometry.attributes.uv.setX(0,99);},f=>{const a=target(f).geometry.attributes;for(const v of Object.values(a))for(let k=0;k<3;k++)v.copyAt(3+k,v,k);},f=>{f.kit.mesh(f.kit.root,target(f).geometry,target(f).material,0,0,0);}]){
  const f=fixture();change(f);const before=hash(meshes(f.kit.root).map(row)),count=f.kit.owned.length;assert.equal(apply(f),false);assert.equal(hash(meshes(f.kit.root).map(row)),before);assert.equal(f.kit.owned.length,count);dispose(f);
 }
 const f=fixture('wuying'),before=hash(meshes(f.frame).map(row));assert.equal(apply(f),false);assert.equal(hash(meshes(f.frame).map(row)),before);dispose(f);
 const g=fixture();assert.equal(apply(g),true);const s=snapshot(g);assert.equal(apply(g),false);assert.deepEqual(snapshot(g),s);dispose(g);
});

test('new solids are finite with outward winding and resources are disposed once while shared materials survive real finish',()=>{
 const f=fixture(),old=target(f).geometry;let oldDisposed=0;old.addEventListener('dispose',()=>oldDisposed++);assert.equal(apply(f),true);assert.equal(oldDisposed,1);
 for(const m of parts(f))for(const tri of triangles(m)){const [a,b,c]=tri.map(v=>new THREE.Vector3(...v.position)),cross=b.sub(a).cross(c.sub(a));assert.ok(cross.length()>1e-8);assert.ok(cross.normalize().dot(new THREE.Vector3(...tri[0].normal))>.99999);assert.ok(tri.every(v=>Object.values(v).flat().every(Number.isFinite)));}
 const watch=new Map(),track=o=>{if(watch.has(o))return;watch.set(o,0);o.addEventListener('dispose',()=>watch.set(o,watch.get(o)+1));};
 const borrowed=[...f.lib.materials.values()],sources=[...new Set(meshes(f.frame).map(m=>m.geometry))],owned=[...f.kit.owned];[...borrowed,...sources,...owned].forEach(track);
 f.merged=f.kit.finish();for(const g of sources)assert.equal(watch.get(g),1);const mergedGeometry=meshes(f.merged).map(m=>m.geometry);mergedGeometry.forEach(track);
 const h=ray(f,[-12.6,4,-1],[0,0,1],1,f.merged);assert.equal(h.length,1);assert.match(h[0].object.material.name,/wenhua_gate_closed_recess/);near(h[0].point.z-f.g.z,-.12);
 f.kit.dispose(f.merged);for(const o of [...owned,...mergedGeometry])assert.equal(watch.get(o),1);for(const m of borrowed)assert.equal(watch.get(m),0);assert.equal(oldDisposed,1);f.lib.dispose();
});

test('actual unmodified production baseline has exactly two full red south triangles and fails the proposed stone/window appearance',()=>{
 const f=fixture(),m=target(f),front=triangles(m,(ids,a)=>ids.every(k=>a.normal.getZ(k)<-.999));assert.equal(front.length,2);assert.equal(parts(f).length,0);
 const before=snapshot(f);for(const y of[1.4,2.58,4,6.7])assert.match(ray(f,[-13.24,y,-1],[0,0,1],1)[0].object.material.name,/wall_red/);
 assert.equal(apply(f),true);assert.notEqual(snapshot(f).all,before.all);assert.doesNotMatch(ray(f,[-13.24,1.4,-1],[0,0,1],1)[0].object.material.name,/wall_red/);assert.doesNotMatch(ray(f,[-13.24,4,-1],[0,0,1],1)[0].object.material.name,/wall_red/);dispose(f);
});

test('pure existing-world consumer observes merged geometry and original colliders without rebuilding or modifying them',async()=>{
 const {assertWenhuaGateSouthWindowInWorld}=await import('./lib/r59-wenhua-gate-window-world-check.mjs');
 const f=fixture();assert.equal(apply(f),true);f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);
 const before=hash(meshes(f.merged).map(row)),physics=hash(physical(f.kit));const report=assertWenhuaGateSouthWindowInWorld({scene:f.merged,cm:f.cm});
 assert.equal(report.portalCenters,3);assert.equal(hash(meshes(f.merged).map(row)),before);assert.equal(hash(physical(f.kit)),physics);dispose(f);
});
