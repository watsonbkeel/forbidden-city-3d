import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {captureGate,meshFingerprint} from '../../lib/gate-tower-fixture.mjs';
import {mainSignature} from '../../lib/r157-wumen-main-signature.mjs';
const reference=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-integration.json',import.meta.url)));
test('actual integrated Wumen main tower equals the independently committed ebd5d049 candidate',()=>{
 assert.equal(reference.candidateCommit,'ebd5d0494bc2eedcd8983dcb7669d4c7e8f121d2');
 const c=captureGate();assert.deepEqual(mainSignature(c,meshFingerprint),reference.signature);
});
test('main integration equivalence rejects geometry, material, evidence, and collider-registration drift',()=>{
 for(const [key,change]of [
  ['geometry',c=>{const g=c.tower.children.find(m=>m.userData.gatePart==='interior-column').geometry,p=g.attributes.position;p.setX(0,p.getX(0)+.125);}],
  ['renderState',c=>{c.tower.children.find(m=>m.userData.gatePart==='interior-floor').material.color.setHex(0xff00ff);}],
  ['structure',c=>{c.tower.userData.structure.facadeBays[0].leafCount=99;}],
 ]){const c=captureGate();change(c);assert.notEqual(mainSignature(c,meshFingerprint)[key],reference.signature[key],key);}
 const c=captureGate(),local=c.tower.userData.colliders[0],world=local.clone().translate(new c.THREE.Vector3(c.data.position.x,c.tower.position.y,c.data.position.z)),index=c.builder.colliders.findIndex(b=>b.equals(world));assert.ok(index>=0);c.builder.colliders.splice(index,1);
 assert.throws(()=>mainSignature(c,meshFingerprint),/Main tower collider missing/);
});
