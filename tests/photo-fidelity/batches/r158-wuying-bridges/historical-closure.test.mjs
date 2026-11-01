import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import {createHash}from'node:crypto';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
test('Original ten R157 assertions remain byte-exact and pass with the full frozen production source closure',()=>{
 const file=new URL('../wuying-three-bridge-rails.historical.mjs',import.meta.url),bytes=fs.readFileSync(file);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'c1cdb916acca9707943c8060921e6ac923388e583a05f0ee6e29c79b0ebd1142');
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--import',fileURLToPath(new URL('./historical-hook.mjs',import.meta.url)),'--test','--test-reporter=tap',fileURLToPath(file)],{cwd:process.cwd(),env,encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
 assert.equal(r.error,undefined);assert.equal(r.signal,null);assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/# tests 10\r?\n/);assert.match(r.stdout,/# pass 10\r?\n/);assert.match(r.stdout,/# fail 0\r?\n/);
});
