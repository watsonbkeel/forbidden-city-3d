import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';

function fixture() {
  const mats = new Map();
  const library = { material(n) { if (!mats.has(n)) mats.set(n, new THREE.MeshStandardMaterial({ name:n })); return mats.get(n); }, tileSize:() => 1, aspect:() => 1 };
  return new ZoneBase(library, { id:'contract', items:[] });
}
const valid = { kind:'courtWalls', name:'fixture court', x0:-20, x1:20, z0:0, z1:40 };
test('valid documented courtyard data creates finite walls and four collision boundaries', () => {
  const z = fixture(); z.buildCourtWalls(valid);
  assert.equal(z.kit.colliders.length,4);
  assert.ok(z.kit.root.children.length > 0);
  for (const c of z.kit.colliders) assert.ok([...c.min.toArray(), ...c.max.toArray()].every(Number.isFinite));
});
for (const [name, mutate] of [
  ['nested bounds without documented top-level coordinates', v => ({ kind:v.kind, name:v.name, bounds:{x0:-20,x1:20,z0:0,z1:40} })],
  ['non-finite coordinate', v => ({...v,z0:NaN})],
  ['reversed bounds', v => ({...v,x1:-21})],
  ['malformed legacy gate fields', v => ({...v,gates:[{at:'s',name:'missing'}]})],
  ['unknown named gate', v => ({...v,gates:[{side:'s',at:0,gate:'missing'}]})],
  ['non-finite wall height', v => ({...v,h:Infinity})],
  ['invalid wall thickness', v => ({...v,t:0})],
  ['invalid gate list', v => ({...v,gates:{}})],
  ['nonpositive opening', v => ({...v,gates:[{side:'s',at:0,w:0}]})],
  ['opening outside court side', v => ({...v,gates:[{side:'s',at:99,w:4}]})],
]) test(`reject ${name} before creating partial geometry`, () => {
  const z = fixture();
  assert.throws(() => z.buildCourtWalls(mutate(valid)), /court|courtyard|gate|bounds|opening/i);
  assert.equal(z.kit.root.children.length,0);
  assert.equal(z.kit.colliders.length,0);
});

test('named and explicit openings preserve all four documented court sides',()=>{
 const z=fixture();z.gateWidths.set('known',4);
 z.buildCourtWalls({...valid,gates:[{side:'s',at:0,gate:'known'},{side:'n',at:0,w:4},{side:'xmin',at:20,w:4},{side:'xmax',at:20,w:4}]});
 assert.equal(z.kit.colliders.length,8);
 for(const [x,zz] of [[0,0],[0,40],[-20,20],[20,20]])assert.equal(z.kit.colliders.some(b=>b.containsPoint(new THREE.Vector3(x,1.5,zz))),false);
});
