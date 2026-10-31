import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
test('no-scope negative control remains active when the production FurnitureMotion hook is already installed',()=>{
 const loader=fileURLToPath(new URL('./preinstalled-production-loader.mjs',import.meta.url)),probe=fileURLToPath(new URL('./preinstalled-scope-probe.mjs',import.meta.url));
 const [normal,mutant]=['','no-scope'].map(value=>{const r=spawnSync(process.execPath,['--import',loader,probe],{encoding:'utf8',env:{...process.env,WENHUA_SHARED_HOOKS:'on',WENHUA_MUTANT:value},maxBuffer:1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);});
 assert.equal(normal.scope,true);assert.ok(Math.abs(normal.ground-.455625)<2e-5);assert.equal(normal.groundPoseClear,true);
 assert.equal(mutant.scope,false,'already-installed production import must not bypass negative-control injection');assert.ok(Math.abs(mutant.ground-.435375)<2e-5);assert.equal(mutant.groundPoseClear,false,'narrow generic foot is not clearance for the actual full body');assert.equal(mutant.fullFootHeight,normal.fullFootHeight,'the mutant disables scoped dispatch, not geometry or direct physical contact');
});
