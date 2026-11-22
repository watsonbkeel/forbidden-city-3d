import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAYER} from '../../src/config/constants.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {fixture,meshes,roles} from '../lib/r58-court-facade-fixture.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';

const TAG='axis-courts';
const geometryRows=parts=>parts.flatMap(m=>{
  const position=m.geometry.attributes.position,index=m.geometry.index;
  const rows=[];
  for(let i=0;i<(index?.count??position.count);i+=3) {
    rows.push([0,1,2].map(j=>new THREE.Vector3()
      .fromBufferAttribute(position,index?index.getX(i+j):i+j)
      .applyMatrix4(m.matrixWorld).toArray().map(Math.fround).join(',')).join(';'));
  }
  return rows;
}).sort();
const triangleRows=owners=>owners.flatMap(o=>o.triangleSupport.template.triangles
  .map(({triangle:t})=>[t.a,t.b,t.c].map(p=>p.toArray().map(Math.fround).join(',')).join(';'))).sort();
function assertContainedGeometry(outer,inner) {
  const counts=new Map();
  for(const row of outer)counts.set(row,(counts.get(row)??0)+1);
  for(const row of inner) {
    const count=counts.get(row)??0;
    assert.ok(count>0,'physical contact triangle absent from finished visible meshes');
    counts.set(row,count-1);
  }
}
const watch=objects=>{
  const counts=new Map([...new Set(objects)].map(o=>[o,0]));
  for(const o of counts.keys())o.addEventListener('dispose',()=>counts.set(o,counts.get(o)+1));
  return counts;
};
const verifyDisposals=(counts,expected,label)=>{
  assert.ok(counts.size>0,label);
  for(const count of counts.values())assert.equal(count,expected,label);
};
function capture() {
  let before;
  const h=fixture('xiehe',{plaque:true},null,kit=>{
    const original=kit.mapRect;
    kit.mapRect=function(...args) {
      const r=original.apply(this,args);
      before={colliders:kit.colliders.slice(),walkables:kit.walkables.slice(),
        physical:JSON.stringify([kit.colliders,kit.walkables]),other:JSON.stringify([kit.rooms,kit.regions,kit.mapItems])};
      return r;
    };
  });
  assert.ok(before,'observe the original pre-finalization point');
  return {...h,before};
}

test('Current Xiehe finalization appends only source-bound rail and lattice contacts; merged ownership unloads',()=>{
  const h=capture(),cm=new CollisionManager();
  let merged,disposed=false;
  try {
    const start=h.before.colliders,after=h.kit.colliders;
    assert.ok(after.length>start.length);
    assert.ok(start.every((row,i)=>after[i]===row),'unchanged ordered ordinary collision prefix');
    assert.ok(h.kit.walkables.length===h.before.walkables.length&&h.before.walkables.every((row,i)=>h.kit.walkables[i]===row),'support rows retain identity and order');
    assert.equal(JSON.stringify([after.slice(0,start.length),h.kit.walkables]),h.before.physical);
    assert.equal(JSON.stringify([h.kit.rooms,h.kit.regions,h.kit.mapItems]),h.before.other);
    const added=after.slice(start.length);
    const east=added.filter(o=>o.triangleSupport?.id.startsWith('xiehe-east-rail:'));
    const west=added.filter(o=>o.triangleSupport?.id.startsWith('xiehe-west-lattice:'));
    assert.equal(east.length,38,'actual two-run east rail pieces');
    const rails=meshes(h.frame).filter(m=>m.userData.xieheEastRail),lattice=roles(h.frame,'xiehe-west-narrow-door-lattice');
    assert.ok(lattice.length>12);
    assert.equal(west.length,lattice.length);
    assert.equal(added.length,east.length+west.length,'no unrelated registered geometry delta');
    assert.equal(new Set(added.map(o=>o.triangleSupport.id)).size,added.length);
    assert.deepEqual(triangleRows(east),geometryRows(rails));
    assert.deepEqual(triangleRows(west),geometryRows(lattice));

    const twin=fixture('xiehe',{plaque:true});
    try {
      const liveGeometry=new Set(meshes(h.frame).map(m=>m.geometry));
      assert.ok(meshes(twin.frame).every(m=>!liveGeometry.has(m.geometry)),'independent gate geometry');
      const railGeometry=watch([...rails,...lattice].map(m=>m.geometry));
      const loaned=watch(h.lib.materials.values());
      const privateMaterials=watch(h.kit.owned.filter(m=>m.name.startsWith('xiehe-vestibule-')));
      assert.equal(privateMaterials.size,2);
      cm.addColliders(after,TAG); cm.addWalkables(h.kit.walkables,TAG);
      const registered=cm.colliders.filter(o=>east.includes(o.mesh)||west.includes(o.mesh));
      assert.equal(registered.length,added.length);
      assert.ok(registered.every(o=>o.tag===TAG&&o.triangleSupport.template===o.mesh.triangleSupport.template&&o.box.equals(o.mesh)));
      merged=h.kit.finish(); merged.updateMatrixWorld(true);
      assert.equal(merged.userData.architecture.filter(o=>o.profile==='xiehe').length,1);
      verifyDisposals(railGeometry,1,'actual merge releases source geometry once');
      assert.deepEqual(triangleRows(registered),triangleRows(added),'physical ownership remains valid after source disposal');
      assertContainedGeometry(geometryRows(meshes(merged).filter(m=>m.visible)),triangleRows(registered));
      verifyDisposals(privateMaterials,0,'builder-private materials remain alive only through merge');
      const mergedGeometry=watch(meshes(merged).map(m=>m.geometry));
      cm.removeByTag(TAG);
      assert.equal(cm.colliders.length,0); assert.equal(cm.walkables.length,0);
      h.kit.dispose(merged);disposed=true;
      verifyDisposals(mergedGeometry,1,'own merged geometry released once');
      verifyDisposals(railGeometry,1,'source geometry not released twice');
      verifyDisposals(loaned,0,'gate borrows library materials until library disposal');
      verifyDisposals(privateMaterials,1,'builder-private materials disposed exactly once');
      assert.ok(meshes(twin.frame).every(m=>m.geometry.attributes.position.count>0));
    } finally {twin.kit.dispose(twin.kit.root); twin.lib.dispose();}
  } finally {cm.clear(); if(!disposed)h.kit.dispose(merged??h.kit.root);h.lib.dispose();}
});

test('Current merged Xiehe: all open portals traverse both ways; both west end doors still block a player',t=>{
  const h=fixture('xiehe',{plaque:true}), scene=new THREE.Scene();
  let merged;
  try {
    merged=h.kit.finish();scene.add(merged);scene.updateMatrixWorld(true);
    assert.equal(merged.userData.architecture.filter(r=>r.profile==='xiehe').length,1);
    const W={THREE,cm:h.cm,scene},g=h.g;
    const front=g.ramps[0].zToe-1,rear=g.ramps[1].zToe+1;
    for(const fps of [10,60])for(const backwards of [false,true])for(const portal of g.portals){
      const points=[front,0,rear].map(z=>g.toWorld(portal.centerX,z));
      const route=replayTerrace(t,W,backwards?points.reverse():points,{fps,backward:backwards,recordFrames:true});
      assert.equal(route.arrived,true,JSON.stringify({fps,backwards,portal:portal.centerX,end:route.end}));
      assert.ok(route.maxFeet>=g.platformY-1e-6);
      assert.ok(Math.abs(route.end[2])<1e-6);
    }
    const doors=roles(h.frame,'xiehe-west-end-partition');
    assert.equal(doors.length,2);
    for(const door of doors) {
      const at=door.localToWorld(new THREE.Vector3(0,g.platformY+PLAYER.HEIGHT,1.5));
      assert.equal(h.cm.checkCollision(at,.5),true,'true closed end-door contact');
      const a=door.localToWorld(new THREE.Vector3(-.6,g.platformY+PLAYER.HEIGHT,1.5));
      const dir=new THREE.Vector3(1,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),g.rot);
      assert.ok(new THREE.Raycaster(a,dir,0,1.2).intersectObject(merged,true).length>0,'closed end door remains a visible barrier');
    }
  } finally {h.cm.clear();h.kit.dispose(merged??h.kit.root);h.lib.dispose();}
});
