import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {runWithDeadline} from '../bounded-ci-command.mjs';
import {assertAncestors,readIdentity,readRegular,readInputs,sha256,writeResultJSON,isMain} from './common.mjs';
export const PARENT='3dfe70e3869ede71a04f3a85e3106758ca22569c',PARENT_TREE='428ccdb71db3ee868d68fd1589608f5258eb762e',FINGERPRINT='10cacb498fc2fcea9c98490a6cec5759f7ddd8ab1523d53e2130512ce3e3f5c1';
export const BRANCH='refs/heads/dev/r166-bilingual-hit-test-diagnostic-20261107';
export const DOCS='docs/current-state/r166-hit-test-diagnostic/',TOOLS='scripts/ci/bilingual-hit-test/';
export const NODE_TEST_COUNT=42;
export function commands(uiRoot){return[
 {name:'npm-pin',command:'npm',args:['install','--global','npm@11.9.0','--no-audit','--no-fund'],timeoutSeconds:300},
 {name:'npm-verify',command:process.execPath,args:['--input-type=module','-e',"import assert from 'node:assert/strict';import{execFileSync}from'node:child_process';assert.equal(process.version,'v24.22.1');assert.equal(execFileSync('npm',['--version'],{encoding:'utf8'}).trim(),'11.9.0');"],timeoutSeconds:60},
 {name:'dependencies',command:'npm',args:['ci','--no-audit','--no-fund'],timeoutSeconds:300},
 {name:'toolchain',command:process.execPath,args:[TOOLS+'preflight.mjs','--inputs',DOCS+'INPUTS.json','--work-root',uiRoot],timeoutSeconds:120},
 {name:'contracts',command:process.execPath,args:['--max-old-space-size=256','--test','--test-reporter=tap','--test-concurrency=1',TOOLS+'hit-observation.test.mjs',TOOLS+'wrapper.test.mjs',TOOLS+'diagnostic-evidence.test.mjs',TOOLS+'collection.test.mjs'],timeoutSeconds:60,expectedTests:NODE_TEST_COUNT},
 {name:'monitor',command:'python3',args:[TOOLS+'monitor.test.py','--receipt',path.join(uiRoot,'receipts/monitor-contract.json')],timeoutSeconds:60},
 {name:'browser',command:'python3',args:[TOOLS+'run-browser.py','--inputs',DOCS+'INPUTS.json','--work-root',uiRoot],timeoutSeconds:600},
 {name:'evidence',command:process.execPath,args:[TOOLS+'diagnostic-evidence.mjs','--root',path.join(uiRoot,'receipts'),'--expected-head',process.env.GITHUB_SHA??''],timeoutSeconds:60,always:true}
];}
export function validateBoundary(b,added){
 assert.equal(b.parent,PARENT);assert.equal(b.parentTree,PARENT_TREE);assert.equal(b.parentCount,1);assert.equal(b.parentFiles,27911);assert.equal(b.headFiles,27911+added.length);assert.equal(b.runtimeFingerprint,FINGERPRINT);assert.equal(new Set(added).size,added.length);assert.ok(added.every(p=>typeof p==='string'&&!p.includes('..')&&!path.isAbsolute(p)));assert.deepEqual(b.changes.map(r=>r.join('\t')).sort(),added.map(p=>'A\t'+p).sort());return b;
}
export function assertSource(env=process.env){
 const root=process.cwd(),identity=readIdentity(env);assert.equal(env.GITHUB_EVENT_NAME,'push');assert.equal(identity.ref,BRANCH);assert.equal(path.resolve(env.GITHUB_WORKSPACE??''),root);assertAncestors(root);
 const git=(...args)=>execFileSync('git',args,{cwd:root,env:{...env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:16*1024*1024,encoding:'utf8'}).trim();
 const names=(...args)=>execFileSync('git',args,{cwd:root,env:{...env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:16*1024*1024,encoding:'utf8'}).split('\0').slice(0,-1);
 assert.equal(git('rev-parse','HEAD'),identity.eventSha);assert.equal(git('status','--porcelain=v1','--untracked-files=all','--ignored=no'),'');assert.ok(!fs.existsSync('dist'),'Preexisting dist forbidden');
 const raw=readRegular(path.join(root,DOCS,'INPUTS.json'));assert.match(env.DIAGNOSTIC_INPUTS_SHA256??'',/^[a-f0-9]{64}$/);assert.equal(sha256(raw),env.DIAGNOSTIC_INPUTS_SHA256);const input=JSON.parse(raw);assert.equal(input.diagnosticOnly,true);assert.equal(input.parent,PARENT);assert.equal(input.parentTree,PARENT_TREE);
 const addedRaw=readRegular(path.join(root,DOCS,'ADDED-PATHS.json'));assert.equal(sha256(addedRaw),input.addedPathsSHA256);const added=JSON.parse(addedRaw);assert.ok(added.length>0);
 const changes=names('diff','--no-renames','--name-status','-z',PARENT,'HEAD');assert.equal(changes.length%2,0);
 const parentTree=git('rev-parse',PARENT+'^{tree}');const boundary={head:identity.eventSha,parent:git('rev-parse','HEAD^'),parentTree,parentCount:git('rev-list','--parents','-n','1','HEAD').split(' ').length-1,parentFiles:names('ls-tree','-r','--name-only','-z',PARENT).length,headFiles:names('ls-tree','-r','--name-only','-z','HEAD').length,changes:changes.reduce((a,s,i)=>i%2?a:[...a,[s,changes[i+1]]],[]),runtimeFingerprint:input.runtime.sourceFingerprint};validateBoundary(boundary,added);
 for(const p of added)assert.equal(git('ls-tree','HEAD','--',p).split(/\s+/)[0],'100644');
 const checked=readInputs(root,path.join(root,DOCS,'INPUTS.json'));assert.equal(checked.files.length,input.inputCount);assert.equal(checked.sha256,env.DIAGNOSTIC_INPUTS_SHA256);
 const oldRuntime=JSON.parse(readRegular(path.join(root,'docs/current-state/r165-cumulative-373-bilingual/RUNTIME-INPUTS.json')));assert.equal(oldRuntime.inputs.length,994);assert.equal(oldRuntime.sourceFingerprint,FINGERPRINT);assert.equal(input.runtime.sourceFingerprint,FINGERPRINT);assert.equal(input.runtime.files,994);assert.equal(input.runtime.bytes,48930043);
 const frozen=new Map(checked.files.map(r=>[r.path,r]));for(const r of oldRuntime.inputs){const m=frozen.get(r.path);assert.ok(m);for(const k of ['mode','bytes','sha256','gitBlob'])assert.equal(m[k],r[k]);}
 const inherited=JSON.parse(readRegular(path.join(root,DOCS,'COPIED-TOOLS.json')));for(const row of inherited.files){assert.equal(sha256(readRegular(path.join(root,row.destination))),row.afterSHA256);assert.equal(sha256(execFileSync('git',['show',PARENT+':'+row.source],{cwd:root,maxBuffer:1024*1024})),row.beforeSHA256);}
 return{schema:1,diagnosticOnly:true,releaseAcceptance:false,identity,boundary,inputsSHA256:checked.sha256,inputCount:checked.files.length,runtime:input.runtime};
}
export async function runDiagnostic({identity,fontOutcome,uiRoot,run,save}){
 assert.ok(['success','failure','cancelled','skipped'].includes(fontOutcome),'Missing preparation outcome');
 const state={schema:1,diagnosticOnly:true,releaseAcceptance:false,identity,inheritedProductCommands:'NOT_SCHEDULED_DIAGNOSTIC',status:'running',fontOutcome,commands:commands(uiRoot).map(s=>({...s,status:'not_run'}))};save(state);
 if(fontOutcome!=='success'){state.status='font-preparation-failed';save(state);return state;}
 let failed=false;
 for(const row of state.commands){if(failed&&!row.always)continue;row.status='running';save(state);let value;try{value=await run(row);}catch(error){value={code:null,error:String(error),logComplete:false};}Object.assign(row,value);row.status=value.code===0&&!value.timedOut&&value.logComplete===true?'passed':'failed';if(row.status!=='passed')failed=true;save(state);}
 state.status=failed?'failed':'passed-diagnostic-only';save(state);return state;
}
function mainRoot(env){const root=env.EVIDENCE_DIR;assert.ok(root&&path.isAbsolute(root));assertAncestors(root);assert.equal(fs.realpathSync(root),root);assert.equal(root,path.join(env.RUNNER_TEMP,`r166-hit-evidence-${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT}`));assert.equal(env.UI_WORK_ROOT,path.join(env.RUNNER_TEMP,`bui-${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT}`));return root;}
if(isMain(import.meta.url)){
 let output;
 try{
  const root=mainRoot(process.env),identity=readIdentity();output=path.join(root,'RESULT.json');if(!fs.existsSync(output))fs.writeFileSync(output,JSON.stringify({schema:1,diagnosticOnly:true,releaseAcceptance:false,identity,status:'starting'})+'\n',{flag:'wx',mode:0o600});
  const source=assertSource();if(process.argv[2]==='--source-only'){assert.equal(process.argv.length,3);fs.writeFileSync(path.join(root,'source-gate.json'),JSON.stringify(source,null,2)+'\n',{flag:'wx',mode:0o600});}
  else{
   assert.equal(process.argv.length,2);let sequence=0;
   const state=await runDiagnostic({identity,fontOutcome:process.env.FONT_PREPARATION_OUTCOME,uiRoot:process.env.UI_WORK_ROOT,save:state=>writeResultJSON(output,{...state,source}),run:async row=>{
    const file=path.join(root,row.name+'.log'),fd=fs.openSync(file,'wx',0o600);let size=0,logComplete=true,text='';
    let value;try{value=await runWithDeadline(row,chunk=>{const remaining=1024*1024-size;if(chunk.length>remaining)logComplete=false;const b=chunk.subarray(0,Math.max(0,remaining));fs.writeSync(fd,b);size+=b.length;if(row.expectedTests)text+=b.toString('utf8');});}finally{fs.closeSync(fd);}
    if(row.expectedTests){const number=k=>Number(text.match(new RegExp('^# '+k+' (\\d+)$','m'))?.[1]);if(number('tests')!==row.expectedTests||number('pass')!==row.expectedTests||['fail','cancelled','skipped','todo'].some(k=>number(k)!==0))return {...value,code:1,logComplete,contractError:'Exact TAP totals required'};}
    return {...value,logComplete};
   }});
   if(state.status!=='passed-diagnostic-only')process.exitCode=1;
  }
 }catch(error){if(output&&fs.existsSync(output)){try{const previous=JSON.parse(readRegular(output));writeResultJSON(output,{...previous,status:'blocked',error:String(error).slice(0,4096)});}catch{}}console.error(error);process.exitCode=1;}
}
