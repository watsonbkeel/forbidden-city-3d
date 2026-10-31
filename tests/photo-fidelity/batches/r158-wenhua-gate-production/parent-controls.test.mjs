import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
test('live controls preserve actual493 Wuying and ordinary-slope traces, not merely installed off/on proposal replay',()=>{
 const loader=fileURLToPath(new URL('./parent-controls-loader.mjs',import.meta.url)),probe=fileURLToPath(new URL('../r158-wenhua-gate/other-slopes-probe.mjs',import.meta.url));
 const results=['1','0'].map(mode=>{const env={...process.env,WENHUA_SHARED_HOOKS:'off',WENHUA_MUTANT:'',WENHUA_EXACT_PARENT_CONTROLS:mode};delete env.NODE_TEST_CONTEXT;const r=spawnSync(process.execPath,['--max-old-space-size=512','--import',loader,probe],{encoding:'utf8',env,maxBuffer:2*1024*1024});assert.equal(r.status,0,r.stderr);assert.ok(r.stdout.length>20);return JSON.parse(r.stdout);});
 assert.deepEqual(results[0],results[1]);assert.ok(results[1].length>150);for(const r of results[1].filter(r=>r.fps))assert.equal(r.arrived,true);
});
