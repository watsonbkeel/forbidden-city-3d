import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhysicalWaypointDriver } from './lib/physical-waypoints.mjs';

test('physical driver rejects early arrival and distant infinite-plane crossings',()=>{
  const d=createPhysicalWaypointDriver([[0,0],[4,0]]);
  assert.equal(d.observe([3,0],[3.5,0]),0,'old0.8m circle would prematurely arrive');
  assert.equal(d.observe([3,1],[5,1]),0,'crossing an infinite plane is not physical arrival');
  assert.equal(d.observe([3,.6],[5,.6]),0,'lateral limit is strictly less than0.6m');
  assert.equal(d.observe([3,.1],[5,.1]),1);
  assert.equal(d.complete,true);assert.equal(d.diagnostics.crossings.length,1);
});
test('one real frame can cross adjacent collinear contacts without claiming the next turn',()=>{
  const d=createPhysicalWaypointDriver([[0,0],[1,0],[1.2,0],[1.2,4]]);
  assert.deepEqual(d.command([0,0],true).target,[1.2,0]);
  assert.equal(d.observe([.9,0],[1.3,0]),2);
  assert.equal(d.complete,false);assert.equal(d.index,3);
  assert.deepEqual(d.command([1.3,0],true).target,[1.2,4]);
});
test('sprint braking is tied to actual corners/endpoints, never each stair contact',()=>{
  const d=createPhysicalWaypointDriver([[0,0],[1,0],[5,0],[9,0],[9,5]]);
  assert.equal(d.command([.5,0],true).canSprint,true,'near an intermediate toe but still continuous');
  assert.equal(d.command([7.1,0],true).canSprint,false,'brake for the corner');
  assert.equal(d.diagnostics.brakingFrames,1);
});
