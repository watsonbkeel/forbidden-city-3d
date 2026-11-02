import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
test('all hall/gate physical data and every triangle except four duplicate lids retain aac4-equivalent baseline',()=>{
 const script=new URL('./snapshot.mjs',import.meta.url).pathname;
 const run=args=>JSON.parse(execFileSync(process.execPath,[script,...args],{encoding:'utf8'}));
 assert.deepEqual(run([]),run(['--parent']));
});
