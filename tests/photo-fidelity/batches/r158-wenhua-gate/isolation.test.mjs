import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
test('shared-hook proposal leaves parent Wuying/ordinary tapered slope queries and 10/60 Hz control traces byte-identical',()=>{
 const path=fileURLToPath(new URL('./other-slopes-probe.mjs',import.meta.url));
 const results=['off','on'].map(mode=>{const r=spawnSync(process.execPath,[path],{encoding:'utf8',env:{...process.env,WENHUA_SHARED_HOOKS:mode,WENHUA_MUTANT:''},maxBuffer:20*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);});
 assert.deepEqual(results[0],results[1]);for(const r of results[1].filter(r=>r.fps))assert.equal(r.arrived,true,JSON.stringify(r));
});
