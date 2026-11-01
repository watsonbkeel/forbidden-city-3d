import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {captureRightLeaf,retainedSignature} from '../../lib/wumen-right-leaf-fixture.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-right-leaf/retained-be395.json',import.meta.url)));
test('all prior objects geometry materials metadata colliders and supports stay exact in both poses',()=>{
 for(const open of [true,false]){const c=captureRightLeaf(open);try{assert.deepEqual(retainedSignature(c),baseline[open?'open':'closed']);}finally{c.builder.dispose();}}
});
