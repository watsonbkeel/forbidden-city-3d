import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './common.mjs';
import {assertMemoryPhases} from './ui-oracles.mjs';

// Execute only the frozen startup/failure path with in-memory files and failing
// Vite stubs. No dependency import, browser, server, network or product code runs.
const sourceURL=new URL('./browser-qa.mjs',import.meta.url);
const source=fs.readFileSync(sourceURL,'utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function failedStartup(phase){
 const workRoot='/synthetic-run/ui',output=workRoot+'/receipts/ui-components/evidence',writes=new Map(),mkdirs=[],history=[];
 const identity={eventSha:'a'.repeat(40),runId:'123',runAttempt:'1',repository:'watsonbkeel/forbidden-city-3d',ref:'refs/heads/dev/test'};
 const receipt={identity,toolchain:{chrome:{version:'156.0.0.1',realpath:'/opt/google/chrome/chrome'}}};
 let closes=0,launches=0,rechecks=0;
 const fakeFS={writeFileSync:(p,data)=>{const doc=JSON.parse(String(data));if(phase==='write'&&doc.memoryPhases?.length===3&&!doc.failure)throw Error('synthetic write failure');history.push(doc);writes.set(p,String(data));},readFileSync:p=>{assert.equal(p,workRoot+'/receipts/toolchain.json');return Buffer.from(JSON.stringify(receipt));},mkdirSync:p=>mkdirs.push(p),existsSync:()=>false};
 let ticks=0n;const fakeProcess={hrtime:{bigint:()=>{ticks+=1000000n;return ticks;}},memoryUsage:()=>({rss:phase==='memory'?NaN:100000,heapTotal:50000,heapUsed:20000,external:10000,arrayBuffers:1000}),env:{BILINGUAL_UI_WORK_ROOT:workRoot,BILINGUAL_UI_SCRATCH_DIR:workRoot+'/scratch',BILINGUAL_UI_INPUTS:'/synthetic-repo/inputs.json',BILINGUAL_UI_EVIDENCE_DIR:output},exitCode:0};
 const server={listen:async()=>{if(phase==='admission')return;throw Error('synthetic listen failure');},close:async()=>{closes++;}};
 const bindings={execFileSync:()=>{throw Error('synthetic admission failure');},assertMemoryAdmission:()=>{throw Error('Unexpected resource receipt');},fs:fakeFS,path,createServer:async()=>{if(phase==='create')throw Error('synthetic create failure');return server;},fileURLToPath,recheckToolchain:async()=>{rechecks++;return receipt;},sha256,writeResultJSON:(p,value)=>fakeFS.writeFileSync(p,JSON.stringify(value)),assertMemoryPhases,assertSourceLimits:()=>{throw Error('Unexpected UI oracle');},assertBrowserArguments:()=>{throw Error('Unexpected browser');},repositoryRoot:()=>'/synthetic-repo',chromium:{launch:async()=>{launches++;throw Error('Unexpected launch');}},process:fakeProcess,console:{log:()=>{}},fetch:()=>{if(phase==='admission')return Promise.resolve({ok:true});throw Error('Unexpected fetch');}};
 const body=source.replace(/^import[^\n]*\n/gm,'').replaceAll('import.meta.url',JSON.stringify(sourceURL.href));
 await new AsyncFunction(...Object.keys(bindings),body)(...Object.values(bindings));
 const result=JSON.parse(writes.get(output+'/RESULT.json'));
 assert.equal(result.pass,false);assert.match(result.failure,phase==='memory'?/Memory phase/:new RegExp(`synthetic ${phase} failure`));assert.deepEqual(result.layouts,[]);assert.equal(fakeProcess.exitCode,1);assert.equal(launches,0);assert.equal(closes,['listen','admission'].includes(phase)?1:0);
 if(phase==='memory'){assert.equal(rechecks,1);assert.equal(mkdirs.length,0);assert.deepEqual(result.memoryPhases,[]);assert.notEqual(result.toolchainRechecked,true);}
 else{assert.deepEqual(result.identity,identity);assert.equal(result.toolchainRechecked,true);assert.equal(rechecks,2);assert.equal(mkdirs.length,5);assertMemoryPhases(result.memoryPhases,false);assert.equal(result.memoryPhases.length,phase==='write'?2:phase==='admission'?4:3);}
 const persisted=history.filter(row=>!row.failure);assert.deepEqual(persisted.map(row=>row.memoryPhases.length),phase==='memory'?[0]:phase==='write'?[0,1,2]:phase==='admission'?[0,1,2,3,4]:[0,1,2,3]);
}

test('Vite create failure yields structured RESULT without browser or network',()=>failedStartup('create'));
test('Vite listen failure yields structured RESULT and closes only its created server',()=>failedStartup('listen'));

test('phase write failure fails closed and preserves the last persisted prefix',()=>failedStartup('write'));
test('invalid phase memory observation fails closed before Vite or browser',()=>failedStartup('memory'));

test('missing live prelaunch memory admission fails closed before Chrome and preserves four phases',()=>failedStartup('admission'));
