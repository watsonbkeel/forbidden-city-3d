import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyTaiheInstrumentReplacement} from '../../lib/r157-taihe-integration-retention.mjs';
test('uninjected production terrace method replaces exactly old four meshes/two boxes with 29 real solids, preserving every other local primitive',()=>{
 const r=verifyTaiheInstrumentReplacement();assert.equal(r.addedColliders-r.removedColliders,27);assert.equal(r.walkablesAfter.length,0);
});
