import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{captureGate}from'../../lib/gate-tower-fixture.mjs';import{mainObjectState}from'../../lib/r157-wumen-main-object-state.mjs';
const reference=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-object-state.json',import.meta.url)));
test('live main tower all-node and ancestor object state equals independent ebd candidate',()=>{assert.equal(reference.candidateCommit,'ebd5d0494bc2eedcd8983dcb7669d4c7e8f121d2');assert.deepEqual(mainObjectState(captureGate().tower),reference.signature);});
test('main object-state oracle rejects tower/ancestor hiding and non-mesh flags',()=>{for(const change of[c=>{c.tower.visible=false;},c=>{c.group.visible=false;},c=>{c.tower.layers.set(3);},c=>{c.group.renderOrder=2;},c=>{c.tower.matrixAutoUpdate=false;}]){const c=captureGate();change(c);assert.notDeepEqual(mainObjectState(c.tower),reference.signature);}});
