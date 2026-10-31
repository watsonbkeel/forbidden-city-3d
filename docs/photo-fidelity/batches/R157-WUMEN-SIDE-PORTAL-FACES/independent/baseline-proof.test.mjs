import {register} from 'node:module';register(new URL('./db1-loader.mjs',import.meta.url));
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const {captureRightLeaf,retainedSignature,digest}=await import("file:///workspace/scratch/02a8023d1a85/r157-restored-411214/tests/lib/wumen-right-leaf-fixture.mjs");
const frozen=JSON.parse(fs.readFileSync("/workspace/scratch/02a8023d1a85/r157-restored-411214/tests/fixtures/r157-wumen-side-portal/before-db1.json"));
for(const open of [true,false])test('independent exact db1 source reproduces original '+(open?'open':'closed')+' recorded baseline',()=>{const c=captureRightLeaf(open);try{let faces=0;c.group.traverse(o=>{if(o.userData.wumenSidePortalFace)faces++;});assert.equal(faces,0);assert.deepEqual(retainedSignature(c),frozen[open?'open':'closed']);assert.equal(c.builder.colliders.length,452);assert.equal(c.builder.walkables.length,16);}finally{c.builder.dispose();}});
