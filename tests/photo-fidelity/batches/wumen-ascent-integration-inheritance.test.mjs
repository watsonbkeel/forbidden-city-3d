import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
// Keep historical current-state tests and their frozen oracle unchanged. This
// successor selects the same source-owned ascent by name, not obsolete child27.
test('R157 live ascent binds original frozen oracle and its mutation negatives',t=>{
 const env={...process.env};delete env.NODE_TEST_CONTEXT;delete env.R157_FROZEN_SOURCE_COMMIT;
 const hook=fileURLToPath(new URL('../../lib/r157-wumen-ascent-capture-hook.mjs',import.meta.url));
 const probe=fileURLToPath(new URL('./wumen-ascent-integration-inheritance.probe.mjs',import.meta.url));
 const r=spawnSync(process.execPath,['--import',hook,'--test','--test-reporter=tap',probe],{encoding:'utf8',env,maxBuffer:4*1024*1024});
 assert.equal(r.status,0,r.stdout+'\n'+r.stderr);assert.match(r.stdout,/^TAP version 13/m);
 assert.match(r.stdout,/^# tests 4$/m);assert.match(r.stdout,/^# pass 4$/m);assert.match(r.stdout,/^# fail 0$/m);
 assert.equal((r.stdout.match(/^ok \d+ - /gm)??[]).length,4,'four real child tests must execute');t.diagnostic(r.stdout.trim());
});
