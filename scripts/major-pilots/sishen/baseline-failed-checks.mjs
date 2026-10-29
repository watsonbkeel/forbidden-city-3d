// Re-run only the named aggregate failures, not weaken or edit their assertions.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const dir='reports/major-pilots/sishen/',log=fs.readFileSync(dir+'current-state.log','utf8');
assert.match(log,/ℹ tests \d+/,'candidate aggregate must have reached its normal summary');
const failures=log.split('✖ failing tests:')[1];assert.ok(failures);
const paths=[...new Set([...failures.matchAll(/^test at (tests\/[^:\n]+)(?::\d+:\d+)?$/gm)].map(m=>m[1]))];
const names=[...new Set([...failures.matchAll(/^✖ (.*) \([\d.]+ms\)$/gm)].map(m=>m[1]))];
assert.ok(paths.length&&names.length);
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),pattern='^(?:'+names.map(escape).join('|')+')$';
fs.writeFileSync(dir+'aggregate-failed-selection.json',JSON.stringify({paths,names},null,2)+'\n');
const fd=fs.openSync(dir+'current-state-parent-failures.log','w');
const result=spawnSync(process.execPath,['--import','./scripts/major-pilots/sishen/parent-source.mjs','--test','--test-reporter=spec','--test-concurrency=1','--test-name-pattern='+pattern,...paths],{stdio:['ignore',fd,fd]});fs.closeSync(fd);
const parent=fs.readFileSync(dir+'current-state-parent-failures.log','utf8'),parentFailure=parent.split('✖ failing tests:')[1]??'',actual=[...new Set([...parentFailure.matchAll(/^✖ (.*) \([\d.]+ms\)$/gm)].map(m=>m[1]))];
const missing=names.filter(n=>!actual.includes(n)),extra=actual.filter(n=>!names.includes(n));
fs.writeFileSync(dir+'aggregate-parent-comparison.json',JSON.stringify({parent:'71a9d7a5',processStatus:result.status,requestedFailures:names.length,reproducedFailures:actual.length,missing,extra},null,2)+'\n');
assert.match(parent,/ℹ tests \d+/);assert.deepEqual(missing,[]);assert.deepEqual(extra,[]);
console.log(JSON.stringify({requestedFailures:names.length,reproducedFailures:actual.length}));
