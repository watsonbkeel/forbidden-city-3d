import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionManager } from '../src/utils/Collision.js';
import { traceTerraceGround } from './lib/terrace-walk.mjs';
const ramp={type:'ramp',axis:'x',minX:0,maxX:4,minZ:-2,maxZ:2,a0:0,a1:4,y0:0,y1:2};
const profile={flights:[{id:'expected-flight',ramp}]};
const box=y=>({type:'box',box:new THREE.Box3(new THREE.Vector3(0,y,-2),new THREE.Vector3(4,y,2))});
function sample(walkables,{x=2,z=0,feet=1,step=.6}={}) {
  const cm=new CollisionManager();cm.addWalkables(walkables);
  const trace=traceTerraceGround(cm,profile);
  try {cm.getGroundHeight(x,z,feet,step);return trace.samples[0];}finally{trace.restore();}
}

test('only a selected actual ramp with matching full contract is labelled as the expected flight',()=>{
  assert.equal(sample([ramp]).source,'expected-flight');
  assert.equal(sample([box(1)]).source,'box','coincidental box height cannot prove a missing ramp');
  assert.equal(sample([{...ramp,minX:-1,maxX:5,a0:-1,a1:5}]).source,'other-ramp','a differently positioned ramp with coincident height is not the expected ramp');
  assert.equal(sample([{...ramp,minZ:-1,maxZ:3}]).source,'other-ramp','shifted width interval must not masquerade as expected flight');
  assert.equal(sample([{...ramp,crossMin0:-1,crossMax0:1,crossMin1:-1,crossMax1:1}]).source,'other-ramp','altered cross-section contract must not masquerade as expected flight');
});

test('actual support follows first eligible strictly-higher max, including ties and higher overlaps',()=>{
  assert.equal(sample([box(1),ramp]).source,'box','the first equal-height support wins');
  assert.equal(sample([ramp,box(1)]).source,'expected-flight');
  assert.equal(sample([ramp,box(1.25)]).source,'box');
  assert.equal(sample([box(1.25),ramp]).source,'box');
});

test('actual support preserves ramp eligibility, taper bounds, rescue precedence and zero-ground ties',()=>{
  assert.equal(sample([ramp],{feet:0}).source,'ground','unreachable ramp height is not selected');
  assert.equal(sample([{...ramp,crossMin0:-.1,crossMax0:.1,crossMin1:-.1,crossMax1:.1}],{z:.2}).source,'ground');
  assert.equal(sample([ramp,box(3)]).source,'rescue','an eligible lower ramp does not hide automatic box lift');
  assert.equal(sample([ramp,{...box(3),rescue:false}]).source,'expected-flight');
  assert.equal(sample([ramp],{x:0,feet:0}).source,'ground','zero-height ramp ties the initial ground rather than winning');
});
