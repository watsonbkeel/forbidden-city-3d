import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {snapshotWidth} from '../../lib/wumen-main-width-snapshot.mjs';import {digest} from '../../lib/wumen-right-leaf-fixture.mjs';
const old=JSON.parse(fs.readFileSync(new URL('./before-411214.json',import.meta.url)));
test('exact 411214 three-source predecessor reproduces the pre-change complete recorded shell and non-target snapshot',()=>{assert.equal(digest(snapshotWidth()),digest(old.snapshot));});
import {captureRightLeaf,retainedSignature} from '../../lib/wumen-right-leaf-fixture.mjs';
const closed=JSON.parse(fs.readFileSync(new URL('./closed-outside-411214.json',import.meta.url)));
test('pinned three-source predecessor separately reproduces supplemental closed-pose outside and original 723-record signature',()=>{const c=captureRightLeaf(false);try{c.tower=c.group.children.find(o=>o.userData.structure?.id==='axis/wumen-upper-tower');assert.equal(digest(snapshotWidth(c).outside),digest(closed.outside));assert.equal(digest(retainedSignature(c)),digest(closed.retained));assert.equal(digest(closed.sourceHashes),digest(old.sourceHashes));}finally{c.builder.dispose();}});
