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

// Execute only the exact observer body against tiny files and stub identities.
async function stepHarness(t,ioOverride){
 const os=await import('node:os'),{writeResultJSON}=await import('./common.mjs'),{assertUISteps,UI_STEP_NAMES}=await import('./ui-oracles.mjs');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ui-step-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const resultPath=path.join(root,'RESULT.json');
 const result={pass:false,layouts:[],memoryPhases:[{elapsedMs:10}],uiSteps:[],browserVersion:'156.0.0.1',browserProcesses:[{pid:123,executable:'/opt/google/chrome/chrome',args:['/opt/google/chrome/chrome','--headless']}]};fs.writeFileSync(resultPath,JSON.stringify(result),{flag:'wx'});
 let tick=20000000n,counts={contexts:0,pages:0};const process={hrtime:{bigint:()=>{tick+=1000000n;return tick;}},memoryUsage:()=>({rss:10000,heapTotal:5000,heapUsed:3000,external:1000,arrayBuffers:500})};
 const browser={contexts:()=>Array.from({length:counts.contexts},()=>({pages:()=>Array(counts.pages).fill({})}))};
 const fragment=source.slice(source.indexOf('function recordUIStep('),source.indexOf('// Inspect only this process'));
 assert.ok(fragment.startsWith('function recordUIStep('));const observer=new Function('process','browser','phaseStart','result','resultPath','assertUISteps','writeResultJSON',fragment+';return recordUIStep;')(process,browser,0n,result,resultPath,assertUISteps,(p,v)=>writeResultJSON(p,v,ioOverride??fs));
 return {result,resultPath,names:UI_STEP_NAMES,observer,setCounts:value=>{counts=value;}};
}
test('exact UI observer publishes bounded prefixes and verified browser identity without declaring product pass',async t=>{
 const h=await stepHarness(t);for(const [i,name]of h.names.entries()){const closed=i===0||name.endsWith('-context-closed');h.setCounts({contexts:closed?0:1,pages:closed||name.endsWith('-context-created')?0:1});h.observer(name);const saved=JSON.parse(fs.readFileSync(h.resultPath));assert.equal(saved.uiSteps.length,i+1);assert.deepEqual(saved.browserProcesses,h.result.browserProcesses);assert.equal(saved.pass,false);assert.deepEqual(saved.layouts,[]);}assert.equal(h.result.uiSteps.length,19);
});
test('UI step partial-write and rename failures preserve both the disk prefix and in-memory prefix',async t=>{
 for(const kind of ['partial','rename']){let fail=false;const io=Object.create(fs);if(kind==='partial')io.writeFileSync=(fd,data)=>{if(fail){fs.writeSync(fd,data.subarray(0,17));throw Error('synthetic partial write');}return fs.writeFileSync(fd,data);};else io.renameSync=(a,b)=>{if(fail)throw Error('synthetic rename failure');return fs.renameSync(a,b);};const h=await stepHarness(t,io);h.observer('browser-verified');const before=fs.readFileSync(h.resultPath);fail=true;h.setCounts({contexts:1,pages:0});assert.throws(()=>h.observer('1280-context-created'),/synthetic/);assert.deepEqual(fs.readFileSync(h.resultPath),before);assert.equal(h.result.uiSteps.length,1);assert.equal(h.result.pass,false);assert.equal(fs.existsSync(h.resultPath+'.pending'),false);}
});
