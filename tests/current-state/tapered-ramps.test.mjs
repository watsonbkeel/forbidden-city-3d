import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../../src/utils/Collision.js';
for(const axis of ['x','z']) for(const reverse of [false,true]) test(`tapered ${axis} ramp ${reverse?'descending':'ascending'} excludes trapezoid wings`,()=>{
  const c=new CollisionManager();c.addWalkable({type:'ramp',minX:-5,maxX:5,minZ:-5,maxZ:5,axis,a0:reverse?5:-5,a1:reverse?-5:5,y0:0,y1:2,crossMin0:-5,crossMax0:5,crossMin1:-2,crossMax1:2});
  const p=(a,b)=>axis==='x'?[a,b]:[b,a];
  const a=reverse?-4:4;
  assert.equal(c.getGroundHeight(...p(a,4),2),0);
  assert.ok(Math.abs(c.getGroundHeight(...p(a,2),2)-1.8)<1e-9);
  assert.ok(Math.abs(c.getGroundHeight(...p(0,3.5),2)-1)<1e-9);
  assert.equal(c.getGroundHeight(...p(0,3.501),2),0);
});
test('ordinary ramps and boxes preserve previous height and rescue behavior',()=>{
 const c=new CollisionManager();c.addWalkable({type:'ramp',minX:-5,maxX:5,minZ:-5,maxZ:5,axis:'z',a0:-5,a1:5,y0:0,y1:2});
 assert.equal(c.getGroundHeight(4,4,2),1.8);assert.equal(c.getGroundHeight(0,4,0),0);assert.equal(c.getGroundHeight(6,0,2),0);
 c.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(10,3,10),new THREE.Vector3(14,3,14))});assert.equal(c.getGroundHeight(12,12,0),3);
 c.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(20,3,20),new THREE.Vector3(24,3,24)),rescue:false});assert.equal(c.getGroundHeight(22,22,0),0);
});
test('partial, nonfinite, and inverted taper fields fail instead of silently becoming a rectangle',()=>{
 const base={type:'ramp',minX:-5,maxX:5,minZ:-5,maxZ:5,axis:'z',a0:-5,a1:5,y0:0,y1:2};
 for(const fields of [{crossMin0:-2},{crossMin0:NaN,crossMax0:2,crossMin1:-2,crossMax1:2},{crossMin0:3,crossMax0:2,crossMin1:-2,crossMax1:2},{crossMin0:-2,crossMax0:2,crossMin1:3,crossMax1:2}]) {
  assert.throws(()=>new CollisionManager().addWalkable({...base,...fields}),/taper/i);
 }
});
