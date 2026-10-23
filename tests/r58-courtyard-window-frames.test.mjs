import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,roles} from './lib/r58-court-facade-fixture.mjs';
for(const profile of ['xihe','xiehe'])test(`${profile}: only two courtyard windows contain six lower leaves and one separate transom`,()=>{
 const f=fixture(profile);
 assert.equal(roles(f.frame,'courtyard-window-leaf').length,12);
 assert.equal(roles(f.frame,'courtyard-window-transom').length,2);
 for(const window of roles(f.frame,'gate-window')){
  assert.equal(roles(window,'courtyard-window-leaf').length,window.userData.side==='rear'?6:0);
  assert.equal(roles(window,'courtyard-window-transom').length,window.userData.side==='rear'?1:0);
 }
 assert.equal(roles(f.frame,'gate-window-bar').length,36,'only the two untouched outward grids retain generic bars');
});

import * as THREE from 'three';
import {hash,meshRows,physical,geometryHealth,triangles,meshes} from './lib/r58-court-facade-fixture.mjs';
import {baselineSideGate,oldCourtyardBar,newCourtyardMember} from './lib/r58-courtyard-window-fixture.mjs';
import {COURTYARD_WINDOW_FITS,courtyardWindowLayout,buildCourtyardWindowLeaves} from '../src/scene/palace/special/CourtyardWindowLeaves.js';

for(const profile of ['xihe','xiehe','jingyun','longzong'])test(`${profile}: every non-target triangle/material/transform and all physics remain byte-exact`,()=>{
 const a=fixture(profile,{},baselineSideGate),b=fixture(profile),target=['xihe','xiehe'].includes(profile);
 assert.equal(hash(meshRows(a.frame,target?oldCourtyardBar:()=>false)),hash(meshRows(b.frame,newCourtyardMember)));
 assert.deepEqual(physical(a.kit),physical(b.kit));assert.deepEqual(a.frame.userData.structure,b.frame.userData.structure);
 assert.deepEqual([...new Set(meshes(a.frame).map(m=>m.material.name))].sort(),[...new Set(meshes(b.frame).map(m=>m.material.name))].sort());
 assert.ok(new THREE.Box3().setFromObject(a.frame).equals(new THREE.Box3().setFromObject(b.frame)));
 const delta=triangles(b.frame)-triangles(a.frame);assert.equal(delta,profile==='xihe'?3056:profile==='xiehe'?3064:0);
 const front=o=>o.position.z<0;assert.equal(hash(meshRows(a.frame,o=>!front(o))),hash(meshRows(b.frame,o=>!front(o))),'outward meshes never change');
 geometryHealth(b.frame);
});

test('independent source fits never produce unseen reverse or other-gate detail',()=>{
 assert.notEqual(COURTYARD_WINDOW_FITS.xihe.transomRatio,COURTYARD_WINDOW_FITS.xiehe.transomRatio);
 assert.notEqual(COURTYARD_WINDOW_FITS.xihe.pitch,COURTYARD_WINDOW_FITS.xiehe.pitch);
 for(const profile of ['jingyun','longzong','other'])assert.deepEqual(buildCourtyardWindowLeaves(null,null,{profile}),[]);
 assert.equal(COURTYARD_WINDOW_FITS.xihe.sourceId,'R58A-SIDE-IMG-01');assert.equal(COURTYARD_WINDOW_FITS.xiehe.sourceId,'R58A-SIDE-IMG-09');
});

for(const profile of ['xihe','xiehe'])test(`${profile}: clipped diagonal prisms are closed, finite and within their exact leaf or transom frame`,()=>{
 const f=fixture(profile),diagonals=roles(f.frame,'courtyard-window-diagonal');assert.ok(diagonals.length>200);
 for(const mesh of diagonals){
  geometryHealth(mesh);const p=mesh.geometry.attributes.position,edges=new Map(),trianglesSeen=new Set();
  const key=v=>v.map(x=>Math.round(x*1e6)).join(',');
  let contact=0,volume=0;
  for(let i=0;i<p.count;i+=3){
   const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j)),keys=vertices.map(v=>key(v.toArray()));
   const tk=[...keys].sort().join('|');assert.ok(!trianglesSeen.has(tk));trianglesSeen.add(tk);
   const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize();
   assert.ok(normal.dot(new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.normal,i))>.99999);
   volume+=vertices[0].dot(vertices[1].clone().cross(vertices[2]))/6;
   for(let j=0;j<3;j++){const a=keys[j],b=keys[(j+1)%3],k=[a,b].sort().join('|');const row=edges.get(k)??{count:0,balance:0};row.count++;row.balance+=a<b?1:-1;edges.set(k,row);}
   for(const v of vertices){
    const x=v.x+mesh.position.x,y=v.y+mesh.position.y,r=mesh.userData.clipRect;
    assert.ok(x>=r.left-2e-7&&x<=r.right+2e-7&&y>=r.bottom-2e-7&&y<=r.top+2e-7,'full strip, not only centreline, clipped inside frame');
    if(Math.min(Math.abs(x-r.left),Math.abs(x-r.right),Math.abs(y-r.bottom),Math.abs(y-r.top))<2e-7)contact++;
   }
  }
  assert.ok(volume>0);assert.ok(contact>=4,'strip end contacts actual bounding frame');
  for(const edge of edges.values()){assert.equal(edge.count,2);assert.equal(edge.balance,0);}
 }
 for(const pane of roles(f.frame,'gate-window').filter(o=>o.userData.side==='rear')){
  const bay=pane.userData.bay,g=f.g,layout=courtyardWindowLayout({profile,cx:g.bayCenters[bay],clear:g.bayWidths[bay]-2*g.radius,bottom:g.platformY+.85,height:g.columnH-1.65,z:g.depth/2});
  for(const leaf of roles(pane,'courtyard-window-leaf')){
   assert.equal(roles(leaf,'courtyard-window-leaf-stile').length,2);assert.equal(roles(leaf,'courtyard-window-leaf-rail').length,2);
   assert.deepEqual(roles(leaf,'courtyard-window-solid-field').map(o=>o.userData.field),['bottom','top']);
  }
  const bounds=new THREE.Box3();for(const m of meshes(pane).filter(newCourtyardMember)){m.geometry.computeBoundingBox();bounds.union(m.geometry.boundingBox.clone().translate(m.position));}
  assert.ok(Math.abs(bounds.min.x-layout.left)<2e-7&&Math.abs(bounds.max.x-layout.right)<2e-7);
  assert.ok(Math.abs(bounds.min.y-layout.bottom)<2e-7&&Math.abs(bounds.max.y-layout.top)<2e-7);
  assert.ok(bounds.max.z<=g.depth/2+.09000001);
 }
});

test('new geometry remains assembly-owned and actual merge releases every source once without extra material buckets',()=>{
 for(const profile of ['xihe','xiehe']){
  const a=fixture(profile),b=fixture(profile),baseline=fixture(profile,{},baselineSideGate),owned=new Map(meshes(a.frame).filter(newCourtyardMember).map(o=>[o.geometry,0]));
  assert.ok(meshes(b.frame).every(o=>!owned.has(o.geometry)));for(const geo of owned.keys())geo.addEventListener('dispose',()=>owned.set(geo,owned.get(geo)+1));
  const before=triangles(a.frame),root=a.kit.finish(),old=baseline.kit.finish();assert.equal(triangles(root),before);assert.equal(meshes(root).length,meshes(old).length);
  for(const n of owned.values())assert.equal(n,1);geometryHealth(root);
  a.kit.dispose(root);baseline.kit.dispose(old);for(const n of owned.values())assert.equal(n,1);
 }
});

import {assertCourtyardWindowsInWorld} from './lib/r58-courtyard-window-world-check.mjs';
import {replayTerrace} from './lib/terrace-walk.mjs';
for(const profile of ['xihe','xiehe'])test(`${profile}: actual merged rays count six leaves, one transom and exact closed-window colliders`,()=>{
 const f=fixture(profile),W={scene:f.kit.finish(),cm:f.cm,THREE},result=assertCourtyardWindowsInWorld(W,{profiles:[profile]});
 assert.equal(result.windows.length,2);assert.equal(result.exactRetainedWindowColliders,2);assert.equal(result.routeHeadRays,9);
});
for(const profile of ['xihe','xiehe'])test(`${profile}: actual controller retains three portal round trips at 10 and 60 fps`,t=>{
 const f=fixture(profile),g=f.g,W={scene:f.kit.finish(),cm:f.cm,THREE};
 for(const fps of [10,60])for(const portal of g.portals){
  const go=[g.ramps[0].zToe-1,g.ramps[0].zTop,0,g.ramps[1].zTop,g.ramps[1].zToe+1].map(z=>g.toWorld(portal.centerX,z));
  const result=replayTerrace(t,W,[...go,...go.slice(0,-1).reverse()],{fps,sprint:true,recordFrames:true});
  assert.ok(result.arrived);assert.ok(Math.abs(result.end[2])<1e-8);for(const frame of result.frames)assert.equal(f.cm.checkCollision(new THREE.Vector3(frame.x,frame.ground+1.7,frame.z),.5),false);
 }
});

test('merged geometry consumer rejects the old orthogonal grid, independently of the source metadata',()=>{
 const f=fixture('xihe',{},baselineSideGate),W={scene:f.kit.finish(),cm:f.cm};
 assert.throws(()=>assertCourtyardWindowsInWorld(W,{profiles:['xihe']}),/actual diagonal centre exists/);
});
