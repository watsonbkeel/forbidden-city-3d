import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,parts,meshes,triangles,snapshot,ray,dispose,physical,hash} from './lib/r59-wenhua-gate-window-fixture.mjs';
import {coarseFixture,divisions,retainedCoarseHash} from './lib/r59-wenhua-gate-divisions-fixture.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const localTriangles=m=>triangles(m).map(t=>t.map(v=>new THREE.Vector3(...v.position).applyMatrix4(m.matrix)));
const pointOnTriangle=(p,t)=>{const tri=new THREE.Triangle(...t);return tri.closestPointToPoint(p,new THREE.Vector3()).distanceTo(p)<1e-6;};

test('three observed red division cores use normalized photograph controls, not invented fine lattice or leaf counts',()=>{
 const f=fixture('wenhua',true),d=divisions(f);assert.equal(d.length,3,'coarse production currently has no major divisions');
 const fit=f.g.wenhuaSouthWindow.majorDivisions;assert.equal(fit.status,'PHOTO_FIT_NOT_SURVEYED');assert.deepEqual(fit.fitSpanPx,[768,872]);
 assert.deepEqual(fit.centersPx,[792,819,845]);assert.deepEqual(fit.coreWidthsPx,[4,4,3]);
 const red=parts(f).find(m=>m.userData.wenhuaGateSouthWindow.role==='red-frame').material;
 for(let i=0;i<3;i++){const m=d[i],u=(fit.centersPx[i]-768)/104;near(fit.normalizedCenters[i],u);near(m.position.x,-10.79-4.9*u);near(m.geometry.parameters.width,4.9*fit.coreWidthsPx[i]/104);assert.equal(m.material,red);assert.ok(m.geometry.parameters.width<.2);}
 assert.equal(fit.windowLeafCount,null);assert.equal(fit.fineGridModeled,false);assert.match(f.g.wenhuaSouthWindow.remainingVisualDifferences,/fine grille/i);dispose(f);
});

test('actual division corners meet retained rail triangles at both ends and closed backing without coincident new end/back faces',()=>{
 const f=fixture('wenhua',true),d=divisions(f);assert.equal(d.length,3);
 const rails=parts(f).filter(m=>m.userData.wenhuaGateSouthWindow.role==='red-frame'),back=parts(f).find(m=>m.userData.wenhuaGateSouthWindow.role==='closed-recess');
 const railTris=rails.flatMap(localTriangles),backTris=localTriangles(back);
 for(const m of d){
  const points=localTriangles(m).flat(),lo=Math.min(...points.map(p=>p.y)),hi=Math.max(...points.map(p=>p.y)),rear=Math.max(...points.map(p=>p.z));
  near(lo,2.82);near(hi,6.79);near(rear,-.12);assert.equal(triangles(m).length,6,'front and two sides only; existing surfaces close ends and back');
  for(const p of points.filter(p=>Math.abs(p.y-lo)<1e-6||Math.abs(p.y-hi)<1e-6))assert.ok(railTris.some(t=>pointOnTriangle(p,t)),'actual corner lies on an existing rail triangle, not just its AABB');
  for(const p of points.filter(p=>Math.abs(p.z-rear)<1e-6))assert.ok(backTris.some(t=>pointOnTriangle(p,t)),'back edge contacts actual closed-plane triangles');
  for(const tri of triangles(m)){assert.ok(tri.every(v=>Math.abs(v.normal[1])<1e-6&&v.normal[2]<.999),'no coplanar duplicate end/back faces');const [a,b,c]=tri.map(v=>new THREE.Vector3(...v.position));assert.ok(b.sub(a).cross(c.sub(a)).normalize().dot(new THREE.Vector3(...tri[0].normal))>.999);}
  const hits=ray(f,[m.position.x,4.1,-1],[0,0,1],1);assert.equal(hits.length,2);assert.equal(hits[0].object,m);near(hits[0].point.z-f.g.z,-.28);assert.equal(hits[1].object,back);near(hits[1].distance-hits[0].distance,.16);
 }
 dispose(f);
});

test('successor preserves every coarse triangle, material and collider, adds only 18 triangles and no new owned resource',()=>{
 const before=coarseFixture(),after=fixture('wenhua',true);assert.equal(divisions(before).length,0);assert.equal(divisions(after).length,3);
 assert.equal(retainedCoarseHash(after),retainedCoarseHash(before));for(const k of ['nonTarget','otherFiveFaces','physics'])assert.equal(snapshot(after)[k],snapshot(before)[k]);
 assert.equal(snapshot(after).triangles-snapshot(before).triangles,18);assert.equal(after.kit.owned.length,before.kit.owned.length);
 for(const m of divisions(after)){const b=new THREE.Box3().setFromObject(m);assert.ok(b.min.x>=after.g.x-16.05&&b.max.x<=after.g.x-10.43&&b.min.y>=.8&&b.max.y<=7.3&&b.min.z>=after.g.z-.3&&b.max.z<=after.g.z+.3);assert.equal(after.cm.checkCollision(new THREE.Vector3(after.g.x+m.position.x,4,after.g.z),.5),true);}
 assert.equal(hash(physical(after.kit)),hash(physical(before.kit)));dispose(before);dispose(after);
});

test('real material merge retains draw count and existing collision/support queries; pure consumer sees three fronts',async()=>{
 const before=coarseFixture(),after=fixture('wenhua',true);
 for(const x of[-15.3,-13.24,-11.2,-6.62,0,6.62])for(const z of[-2,-.25,0,.25,2]){
  const X=after.g.x+x,Z=after.g.z+z;
  for(const feet of[0,.8,2.7,6.8]){
   assert.equal(after.cm.getGroundHeight(X,Z,feet),before.cm.getGroundHeight(X,Z,feet));
   assert.equal(after.cm.supportHeight(X,Z,feet),before.cm.supportHeight(X,Z,feet));
   assert.equal(after.cm.checkCollision(new THREE.Vector3(X,feet,Z),.5),before.cm.checkCollision(new THREE.Vector3(X,feet,Z),.5));
  }
 }
 for(const f of[before,after]){f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);}
 assert.equal(meshes(after.merged).length,meshes(before.merged).length);
 const {assertWenhuaGateSouthWindowInWorld}=await import('./lib/r59-wenhua-gate-window-world-check.mjs');
 assert.equal(assertWenhuaGateSouthWindowInWorld({scene:after.merged,cm:after.cm}).divisionProbes.length,3);
 assert.equal(assertWenhuaGateSouthWindowInWorld({scene:before.merged,cm:before.cm}).divisionProbes.length,0);
 dispose(before);dispose(after);
});
