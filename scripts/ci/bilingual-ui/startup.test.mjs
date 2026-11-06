import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './common.mjs';

// Execute only the frozen startup/failure path with in-memory files and failing
// Vite stubs. No dependency import, browser, server, network or product code runs.
const sourceURL=new URL('./browser-qa.mjs',import.meta.url);
const source=fs.readFileSync(sourceURL,'utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function failedStartup(phase){
 const workRoot='/synthetic-run/ui',output=workRoot+'/receipts/ui-components/evidence',writes=new Map(),mkdirs=[];
 const identity={eventSha:'a'.repeat(40),runId:'123',runAttempt:'1',repository:'watsonbkeel/forbidden-city-3d',ref:'refs/heads/dev/test'};
 const receipt={identity,toolchain:{chrome:{version:'156.0.0.1',realpath:'/opt/google/chrome/chrome'}}};
 let closes=0,launches=0,rechecks=0;
 const fakeFS={writeFileSync:(p,data)=>writes.set(p,String(data)),readFileSync:p=>{assert.equal(p,workRoot+'/receipts/toolchain.json');return Buffer.from(JSON.stringify(receipt));},mkdirSync:p=>mkdirs.push(p),existsSync:()=>false};
 const fakeProcess={env:{BILINGUAL_UI_WORK_ROOT:workRoot,BILINGUAL_UI_SCRATCH_DIR:workRoot+'/scratch',BILINGUAL_UI_INPUTS:'/synthetic-repo/inputs.json',BILINGUAL_UI_EVIDENCE_DIR:output},exitCode:0};
 const server={listen:async()=>{throw Error('synthetic listen failure');},close:async()=>{closes++;}};
 const bindings={fs:fakeFS,path,createServer:async()=>{if(phase==='create')throw Error('synthetic create failure');return server;},fileURLToPath,recheckToolchain:async()=>{rechecks++;return receipt;},sha256,assertSourceLimits:()=>{throw Error('Unexpected UI oracle');},assertBrowserArguments:()=>{throw Error('Unexpected browser');},repositoryRoot:()=>'/synthetic-repo',chromium:{launch:async()=>{launches++;throw Error('Unexpected launch');}},process:fakeProcess,console:{log:()=>{}},fetch:()=>{throw Error('Unexpected fetch');}};
 const body=source.replace(/^import[^\n]*\n/gm,'').replaceAll('import.meta.url',JSON.stringify(sourceURL.href));
 await new AsyncFunction(...Object.keys(bindings),body)(...Object.values(bindings));
 const result=JSON.parse(writes.get(output+'/RESULT.json'));
 assert.equal(result.pass,false);assert.match(result.failure,new RegExp(`synthetic ${phase} failure`));assert.deepEqual(result.layouts,[]);assert.deepEqual(result.identity,identity);assert.equal(result.toolchainRechecked,true);assert.equal(fakeProcess.exitCode,1);assert.equal(launches,0);assert.equal(rechecks,2);assert.equal(closes,phase==='listen'?1:0);assert.equal(mkdirs.length,5);
}

test('Vite create failure yields structured RESULT without browser or network',()=>failedStartup('create'));
test('Vite listen failure yields structured RESULT and closes only its created server',()=>failedStartup('listen'));
