import test from'node:test';import assert from'node:assert/strict';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';import fs from'node:fs';import{createHash}from'node:crypto';
test('all 15 original Jiaotai unit contracts execute with exact unhooked setup; production proof is separate',()=>{
 const file=new URL('./jiaotai-front-vessels.unit.mjs',import.meta.url);
 assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),'fc3173947b2195d98d78fd68f2772f708cbba5beec1722cde85e972bc18b1af2');
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--max-old-space-size=512','--import',fileURLToPath(new URL('./jiaotai-unit-fixture-loader.mjs',import.meta.url)),'--test','--test-reporter=tap',fileURLToPath(file)],{env,encoding:'utf8',maxBuffer:4*1024*1024,timeout:60000});
 assert.equal(r.error,undefined);assert.equal(r.status,0,(r.stdout+r.stderr).slice(-5000));
 assert.match(r.stdout,/^# tests 15$/m);assert.match(r.stdout,/^# pass 15$/m);assert.match(r.stdout,/^# fail 0$/m);assert.match(r.stdout,/^# skipped 0$/m);assert.match(r.stdout,/^# cancelled 0$/m);assert.match(r.stdout,/^ok 15 - /m);console.log(r.stdout);
});
