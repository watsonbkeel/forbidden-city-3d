import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const profileURL=new URL('../../src/scene/palace/special/ZhenduGateProfile.js',import.meta.url);
const api=existsSync(profileURL)?await import(profileURL):{};
const opts={gateProfile:'zhendu',gateKind:'three-bay',x:64.4,z:-214.2,open:true,plaque:false};
function geom(extra={}){assert.equal(typeof api.zhenduGateGeometry,'function','dedicated Zhendu profile is required');return api.zhenduGateGeometry({...opts,...extra});}

test('Zhendu independently declares documentary envelope, local PHOTO_FIT ranges and unaccepted unknowns',()=>{
 const p=geom();assert.equal(p.profile,'zhendu');assert.equal(p.objectId,'FC-9252CFFDAB');assert.equal(p.name,'贞度门');
 assert.equal(p.building.width,20.128);assert.equal(p.building.depth,13.248);assert.equal(p.platform.topY,3.216);
 assert.deepEqual(p.core.bayWidths,[4.95,5.85,4.95]);assert.deepEqual(p.portalCenters,[0]);assert.equal(p.ramps.length,2);
 assert.equal(p.documentary.appliesTo,'昭德门、贞度门');assert.equal(p.photoFit.status,'PHOTO_FIT');assert.ok(p.photoFit.columnHeight.range[0]<p.building.columnH);assert.ok(p.photoFit.columnHeight.range[1]>p.building.columnH);
 assert.equal(p.assumptions.status,'ENGINEERING_ASSUMPTION');assert.equal(p.acceptance.exterior,'VERIFY_PENDING');assert.equal(p.acceptance.interior,'BLOCKED_SOURCE');assert.equal(p.acceptance.accepted,false);
 assert.ok(p.unknowns.some(s=>/north|rear/i.test(s)));assert.equal(p.supports.platform.rescue,false);assert.deepEqual([p.x,p.z],[64.4,-214.2]);
 for(const [side,x] of [['left',52.4],['right',76.4]]){assert.ok(Math.abs(p.joins[side].world[0]-x)<1e-8);assert.ok(Math.abs(p.joins[side].world[1]+217.3)<1e-8);}
 const fresh=geom();p.core.bayWidths[0]=99;assert.equal(fresh.core.bayWidths[0],4.95);
});
test('invalid topology and numeric input fail before geometry registration',()=>{
 for(const extra of [{gateProfile:'zhaode'},{gateKind:'five-bay'},{gateKind:undefined},{x:NaN},{z:'0'},{rot:Math.PI/4},{rot:null},{rot:'bad'},{open:1},{w:0},{h:-1},{t:Infinity}])assert.throws(()=>geom(extra));
 for(const rot of [0,Math.PI/2,Math.PI,3*Math.PI/2,-2*Math.PI,'south','east','north','west'])assert.ok(geom({rot}).toWorld(1,2).every(Number.isFinite));
});
test('independent profile and builder never import or call Zhaode implementations',()=>{
 geom();for(const file of ['ZhenduGateProfile.js','ZhenduGate.js'])assert.doesNotMatch(readFileSync(new URL('../../src/scene/palace/special/'+file,import.meta.url),'utf8'),/from\s+['"].*Zhaode|zhaodeGateGeometry\(/);
});

import * as THREE from 'three';
import {zhenduFixture,roles,rayLocal} from '../lib/r58-zhendu-fixture.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);

test('real independent assembly owns one open portal, a high solid deck and two sloping surfaces',()=>{
 const W=zhenduFixture(),p=W.p;assert.equal(W.width,p.platform.width);assert.equal(W.kit.walkables.length,3);assert.equal(W.kit.rooms.length,0);
 assert.equal(roles(W.frame,'zhendu-door-leaf').length,2);assert.equal(roles(W.frame,'zhendu-column').length,12);assert.equal(roles(W.frame,'zhendu-ramp-solid').length,2);assert.equal(roles(W.frame,'zhendu-roof').length,1);
 assert.equal(W.frame.userData.structure.acceptance.accepted,false);assert.equal(W.frame.userData.structure.streamLayer,'B');
 assert.ok(roles(W.frame,'zhendu-stone-edge').length>=4);assert.ok(roles(W.frame,'zhendu-painted-header').length>=3);
 for(const x of [-1.3,0,1.3])for(const z of [-8,-3,0,3,8]){const [wx,wz]=p.toWorld(x,z);assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,p.platform.topY+1.7,wz),.5),false);}
 assert.equal(W.cm.getGroundHeight(p.x,p.z,0),0,'no platform rescue from underground');close(W.cm.getGroundHeight(p.x,p.z,p.platform.topY),p.platform.topY);
 for(const side of [-1,1]){const [x,z]=p.toWorld(side*6,p.core.frontZ);assert.equal(W.cm.checkCollision(new THREE.Vector3(x,p.platform.topY+1.7,z),.5),true);}
});
test('merged real triangles match deck and ramps, retain underside, and never fill the aperture',()=>{
 const W=zhenduFixture(),p=W.p,root=W.kit.finish();root.updateMatrixWorld(true);
 for(const x of [-1.3,0,1.3])assert.equal(rayLocal(root,p,[x,p.platform.topY+1.5,-8],[0,0,1],16).length,0);
 assert.ok(rayLocal(root,p,[6,p.platform.topY+1.5,-8],[0,0,1],10).length>0);
 close(rayLocal(root,p,[0,-1,0],[0,1,0],6)[0].point.y,0);
 close(rayLocal(root,p,[0,p.platform.topY+1,0],[0,-1,0],2)[0].point.y,p.platform.topY);
 for(const ramp of p.ramps)for(const t of [.2,.5,.8]){
  const z=ramp.zTop+(ramp.zToe-ramp.zTop)*t,y=ramp.yTop*(1-t),[wx,wz]=p.toWorld(0,z),hits=rayLocal(root,p,[0,y+1,z],[0,-1,0],2);
  assert.ok(hits.length);close(hits[0].point.y,y);close(W.cm.getGroundHeight(wx,wz,y+.05),y);
 }
 for(const mesh of root.children)if(mesh.isMesh)for(const a of Object.values(mesh.geometry.attributes))for(const n of a.array)assert.ok(Number.isFinite(n));
 assert.equal(root.userData.architecture[0].objectId,'FC-9252CFFDAB');W.kit.dispose(root);
});
test('closed leaves stop the same central physical aperture without adding a fictitious rear leaf pair',()=>{
 const W=zhenduFixture({open:false}),p=W.p,[x,z]=p.toWorld(0,p.core.frontZ);assert.equal(roles(W.frame,'zhendu-door-leaf').length,2);
 assert.equal(W.cm.checkCollision(new THREE.Vector3(x,p.platform.topY+1.7,z),.5),true);assert.ok(rayLocal(W.frame,p,[0,p.platform.topY+1.5,p.core.frontZ-1],[0,0,1],2).length);
});
test('cardinally transformed real triangles and collision supports stay coincident',()=>{
 for(const rot of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
  const W=zhenduFixture({rot,x:8,z:17}),p=W.p;
  for(const r of p.ramps){const z=(r.zToe+r.zTop)/2,y=p.platformY/2,[wx,wz]=p.toWorld(0,z);close(rayLocal(W.frame,p,[0,y+1,z],[0,-1,0],2)[0].point.y,y);close(W.cm.getGroundHeight(wx,wz,y),y);}
  const [wx,wz]=p.toWorld(0,0);assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,p.platformY+1.7,wz),.5),false);
 }
});
test('production merge and disposal retain finite attributes and never dispose shared material ownership',()=>{
 const W=zhenduFixture(),watched=new Map(),watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};
 W.frame.traverse(o=>{if(o.geometry)watch(o.geometry);});const before=[...watched.keys()],shared=[...W.materials.values()];for(const m of [...shared,...W.kit.owned])watch(m);
 const root=W.kit.finish();for(const g of before)assert.equal(watched.get(g),1,'source geometry disposed once');
 for(const m of root.children)if(m.isMesh){watch(m.geometry);assert.ok(m.geometry.attributes.normal);assert.ok(m.geometry.attributes.uv);assert.equal(m.castShadow,true);}
 W.kit.dispose(root);for(const m of root.children)if(m.isMesh)assert.equal(watched.get(m.geometry),1);for(const m of shared)assert.equal(watched.get(m),0);for(const m of W.kit.owned)assert.equal(watched.get(m),1);
});
test('lateral veranda occupies real space between core enclosure and outer column line',()=>{
 const W=zhenduFixture(),p=W.p;
 for(const sign of [-1,1]){
  const hits=rayLocal(W.frame,p,[sign*11,p.platformY+2,2],[-sign,0,0],6);assert.ok(hits.length);
  const localX=(hits[0].point.x-p.x)*Math.cos(p.rot)-(hits[0].point.z-p.z)*Math.sin(p.rot);
  close(Math.abs(localX),p.core.width/2+p.core.wallThickness/2);
  const [x,z]=p.toWorld(sign*9.1,2);assert.equal(W.cm.checkCollision(new THREE.Vector3(x,p.platformY+1.7,z),.5),false,'physical veranda outside the core wall');
  const [px,pz]=p.toWorld(sign*9.1,p.core.frontZ);assert.equal(W.cm.checkCollision(new THREE.Vector3(px,p.platformY+1.7,pz),.5),true,'unknown lateral bay does not silently become another portal');
 }
});
