import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {library} from './lib/inner-palace-fixture.mjs';
const url = new URL('../src/scene/palace/special/TaihemenEnclosure.js', import.meta.url);
const api = existsSync(url) ? await import(url) : {};
const input = {x0:0,z0:0,y:3.44,w:48.06,d:20.54,H:7.7368,beamH:.928416,r:.4272};
function fragment() {
  assert.equal(typeof api.buildTaihemenSouthEnclosure,'function','missing separate Taihemen south veranda');
  const b = new PalaceBuilder(new THREE.Scene(),library()),g = new THREE.Group();
  b.ownedObjects.add(g); api.buildTaihemenSouthEnclosure(b,g,input);g.updateMatrixWorld(true);
  return {b,g,p:g.userData.taihemenSouthEnclosure};
}
const meshes=g=>{const rows=[];g.traverse(m=>{if(m.isMesh)rows.push(m);});return rows;};
const roles=(g,role)=>meshes(g).filter(m=>m.userData.taihemenEnclosure?.role===role);

test('seven south porch bays have no wall or folded leaves at the eave; only two ends close',()=>{
  const {b,g,p}=fragment();try {
    assert.equal(roles(g,'eave-end-infill').length,2);
    assert.deepEqual(roles(g,'eave-end-infill').map(m=>m.userData.taihemenEnclosure.bay),[0,8]);
    for(let i=1;i<=7;i++) {
      const x=-input.w/2+(i+.5)*input.w/9;
      const hits=new THREE.Raycaster(new THREE.Vector3(x,input.y+1.7,p.southEaveZ-.7),new THREE.Vector3(0,0,1),0,1.4).intersectObject(g,true);
      assert.equal(hits.length,0,`porch bay ${i} has a visible obstruction`);
      assert.equal(b.colliders.some(box=>box.intersectsBox(new THREE.Box3(new THREE.Vector3(x-.5,input.y+.35,p.southEaveZ-.5),new THREE.Vector3(x+.5,input.y+1.7,p.southEaveZ+.5)))),false,`phantom eave collision ${i}`);
    }
  } finally {b.dispose();}
});

test('inherited inner closed bays have matching visible solids and blockers behind the porch',()=>{
  const {b,g,p}=fragment();try {
    assert.equal(roles(g,'inner-retained-infill').length,6);
    assert.equal(roles(g,'inner-retained-open-leaf').length,6);
    assert.equal(roles(g,'inner-threshold').length,1);
    for(const bay of [0,1,2,6,7,8]) {
      const x=-input.w/2+(bay+.5)*input.w/9;
      assert.ok(new THREE.Raycaster(new THREE.Vector3(x,input.y+1.7,p.innerEnclosureZ-1),new THREE.Vector3(0,0,1),0,2).intersectObject(g,true).length);
      assert.ok(b.colliders.some(box=>box.containsPoint(new THREE.Vector3(x,input.y+1.7,p.innerEnclosureZ))));
    }
    for(const bay of [3,4,5]) {
      const x=-input.w/2+(bay+.5)*input.w/9;
      assert.equal(new THREE.Raycaster(new THREE.Vector3(x,input.y+1.7,p.innerEnclosureZ-1),new THREE.Vector3(0,0,1),0,2).intersectObject(g,true).length,0);
      assert.equal(b.colliders.some(box=>box.containsPoint(new THREE.Vector3(x,input.y+1.7,p.innerEnclosureZ))),false);
    }
    assert.equal(b.walkables.length,0,'enclosure must not manufacture floor support');
    assert.equal(meshes(g).every(m=>[...m.geometry.attributes.position.array].every(Number.isFinite)),true);
    assert.equal(b.colliders.every(c=>['x','y','z'].every(a=>c.max[a]>c.min[a])),true);
  } finally {b.dispose();}
});

test('invalid enclosure inputs fail before adding any geometry or colliders',()=>{
  assert.equal(typeof api.buildTaihemenSouthEnclosure,'function');
  const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
  try { for(const patch of [{x0:NaN},{H:0},{beamH:9},{r:4},{d:8}]) {
    assert.throws(()=>api.buildTaihemenSouthEnclosure(b,g,{...input,...patch}),/Taihemen/);
    assert.equal(g.children.length,0);assert.equal(b.colliders.length,0);
  }} finally {b.dispose();}
});
