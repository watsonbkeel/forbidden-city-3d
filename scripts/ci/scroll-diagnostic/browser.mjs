import {runCase} from './flow.mjs';
import {LIMITS,publish,classify,controlAllowed,publishThenAssert} from './contract.mjs';
import fs from 'node:fs';import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {recheckToolchain} from '../bilingual-ui/preflight.mjs';
import {sha256,writeResultJSON} from '../bilingual-ui/common.mjs';
import {assertSourceLimits,assertBrowserArguments,repositoryRoot,assertMemoryPhases,assertMemoryAdmission,assertUISteps} from '../bilingual-ui/ui-oracles.mjs';
import {chromium} from 'playwright';
const base=repositoryRoot(import.meta.url),output=process.env.BILINGUAL_UI_EVIDENCE_DIR;
const workRoot=process.env.BILINGUAL_UI_WORK_ROOT,scratch=process.env.BILINGUAL_UI_SCRATCH_DIR,inputsPath=process.env.BILINGUAL_UI_INPUTS;
if(!workRoot||!path.isAbsolute(workRoot)||output!==path.join(workRoot,'receipts','ui-components','evidence')||scratch!==path.join(workRoot,'scratch'))throw Error('Exact same-run evidence and scratch paths required');
const resultPath=path.join(output,'RESULT.json');
let browser,vite,deadlineTimer;let timedOut=false;const result={schema:1,diagnosticOnly:true,releaseAcceptance:false,scope:'Instrumented directory scroll reproduction only; not release acceptance',cases:[],errors:[],diagnosticComplete:false,memoryPhases:[]};
fs.writeFileSync(resultPath,JSON.stringify({...result,status:'starting'},null,2)+'\n',{flag:'wx'});
const check=(value,message)=>{if(!value)throw Error(message);};
const phaseStart=process.hrtime.bigint();
function recordMemoryPhase(phase){
 const memory=process.memoryUsage();
 const elapsedMs=Number(process.hrtime.bigint()-phaseStart)/1e6;
 const memoryPhases=[...result.memoryPhases,{phase,elapsedMs,rss:memory.rss,heapTotal:memory.heapTotal,heapUsed:memory.heapUsed,external:memory.external,arrayBuffers:memory.arrayBuffers}];
 assertMemoryPhases(memoryPhases,false);
 publish(resultPath,{...result,status:'running',memoryPhases});
 result.memoryPhases=memoryPhases;
}
// Inspect only this process's descendants. Never accept Playwright's default
// chromiumSandbox:false or an unnoticed disabling flag in generated arguments.
function browserProcesses(){
 const rows=[];for(const name of fs.readdirSync('/proc')){if(!/^\d+$/.test(name))continue;try{const stat=fs.readFileSync(`/proc/${name}/stat`,'utf8'),parts=stat.slice(stat.lastIndexOf(')')+2).split(' '),args=fs.readFileSync(`/proc/${name}/cmdline`,'utf8').split('\0').filter(Boolean);rows.push({pid:Number(name),parent:Number(parts[1]),args,executable:fs.realpathSync(`/proc/${name}/exe`)});}catch{}}
 const descendants=new Set([process.pid]);let changed=true;while(changed){changed=false;for(const row of rows)if(descendants.has(row.parent)&&!descendants.has(row.pid)){descendants.add(row.pid);changed=true;}}
 return rows.filter(row=>descendants.has(row.pid)&&/chrom(?:e|ium)$/.test(row.args[0]??''));
}
async function settleLocale(page,value){await page.waitForFunction(value=>document.documentElement.lang===value&&window.fixture.localeStore.locale===value,value);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
const same=(before,after,keys)=>{for(const key of keys)check(JSON.stringify(before[key])===JSON.stringify(after[key]),`State changed on locale toggle: ${key}`);};
try{
 recordMemoryPhase('before-preflight');
 const receipt=await recheckToolchain({repo:base,workRoot,inputsPath});
 result.identity=receipt.identity;result.toolchainSHA256=sha256(fs.readFileSync(path.join(workRoot,'receipts','toolchain.json')));
 recordMemoryPhase('after-preflight');
 for(const name of ['tmp','home','xdg-config','xdg-cache','xdg-data'])fs.mkdirSync(path.join(scratch,name));
 recordMemoryPhase('before-vite');
 vite=await createServer({configFile:fileURLToPath(new URL('../bilingual-ui/vite.config.mjs',import.meta.url))});await vite.listen();
 const url='http://127.0.0.1:4179/tests/bilingual/browser/fixture.html';
 for(let i=0;i<80;i++){try{if((await fetch(url)).ok)break;}catch{}if(i===79)throw Error('UI server unavailable');await new Promise(r=>setTimeout(r,100));}
 recordMemoryPhase('vite-ready');
 result.memoryAdmission=JSON.parse(execFileSync('python3',[fileURLToPath(new URL('../bilingual-ui/memory_budget.py',import.meta.url)),'--admission'],{cwd:base,env:process.env,timeout:5000,maxBuffer:65536,encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 assertMemoryAdmission(result.memoryAdmission,result.identity);
 recordMemoryPhase('before-chrome-launch');
 result.browserStartedMonotonicSeconds=Number(process.hrtime.bigint())/1e9;
 deadlineTimer=setTimeout(()=>{timedOut=true;browser?.close().catch(()=>{});},LIMITS.browserSeconds*1000);
 browser=await chromium.launch({headless:true,chromiumSandbox:true,channel:'chrome',args:['--disable-dev-shm-usage'],env:{...process.env,TMPDIR:path.join(scratch,'tmp'),HOME:path.join(scratch,'home'),XDG_CONFIG_HOME:path.join(scratch,'xdg-config'),XDG_CACHE_HOME:path.join(scratch,'xdg-cache'),XDG_DATA_HOME:path.join(scratch,'xdg-data')}});
 recordMemoryPhase('after-chrome-launch');
 result.browserProcesses=browserProcesses();result.browserArguments=result.browserProcesses.map(row=>row.args);assertBrowserArguments(result.browserArguments);result.browserVersion=browser.version();check(result.browserVersion===receipt.toolchain.chrome.version,'Browser version differs from same-run preflight');check(result.browserProcesses.every(row=>row.executable===receipt.toolchain.chrome.realpath),'Launched executable differs from same-run preflight');check(result.browserArguments.length>0,'Browser arguments unavailable');check(result.browserArguments.every(args=>!args.some(arg=>['--no-sandbox','--disable-setuid-sandbox','--disable-namespace-sandbox'].includes(arg))),'Browser sandbox disabled');
 result.browserVerified=true;publish(resultPath,result);
 check(!timedOut,'Diagnostic browser deadline exceeded');
 const deadline=result.browserStartedMonotonicSeconds+LIMITS.browserSeconds;
 const primary=await runCase({browser,caseId:'primary',output,url,identity:result.identity,deadline});
 result.cases.push({caseId:'primary',completed:primary.completed,closed:primary.closed,primaryContract:primary.primaryContract,controlEligible:primary.controlEligible});publish(resultPath,result);
 check(primary.closed&&primary.completed,'Primary diagnostic incomplete');
 if(primary.controlEligible){
  check(controlAllowed(primary.transitions),'Control admission does not match persisted observations');check(!timedOut,'Diagnostic browser deadline exceeded');
  const control=await runCase({browser,caseId:'control',output,url,identity:result.identity,deadline});
  result.cases.push({caseId:'control',completed:control.completed,closed:control.closed,primaryContract:control.primaryContract,controlEligible:false});publish(resultPath,result);
  check(control.closed&&control.completed,'Control diagnostic incomplete');
 }
 check(!timedOut,'Diagnostic browser deadline exceeded');result.diagnosticComplete=true;
}catch(error){result.diagnosticComplete=false;result.failure=String(error.stack??error).slice(0,4096);process.exitCode=1;}
finally{
 const cleanupFailure=(name,error)=>{result.diagnosticComplete=false;process.exitCode=1;result.errors.push(`${name}: ${String(error.message).slice(0,2048)}`);};
 try{await browser?.close();result.browserClosed=true;}catch(error){cleanupFailure('browser.close',error);}
 finally{clearTimeout(deadlineTimer);if(result.browserStartedMonotonicSeconds){result.browserDurationSeconds=Number(process.hrtime.bigint())/1e9-result.browserStartedMonotonicSeconds;if(timedOut||result.browserDurationSeconds>LIMITS.browserSeconds)cleanupFailure('deadline',Error('90-second diagnostic browser deadline exceeded'));}
 try{await vite?.close();result.viteClosed=true;}catch(error){cleanupFailure('vite.close',error);}
 finally{try{const after=await recheckToolchain({repo:base,workRoot,inputsPath});check(JSON.stringify(after.identity)===JSON.stringify(result.identity),'Postflight event identity changed');check(sha256(fs.readFileSync(path.join(workRoot,'receipts','toolchain.json')))===result.toolchainSHA256,'Toolchain receipt changed');result.toolchainRechecked=true;}catch(error){cleanupFailure('toolchain.postflight',error);}
 publish(resultPath,result);console.log(JSON.stringify({diagnosticOnly:true,releaseAcceptance:false,diagnosticComplete:result.diagnosticComplete,cases:result.cases,failure:result.failure}));}}
}
