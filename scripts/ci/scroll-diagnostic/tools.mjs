import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {readIdentity} from '../bilingual-ui/common.mjs';
const identity=readIdentity(),dir=process.env.EVIDENCE_DIR;assert.ok(dir&&path.isAbsolute(dir));
const specs=[
 {name:'unchanged-ui-node',command:process.execPath,args:['--test','--test-concurrency=1','--test-reporter=tap',...['oracles','tools','startup'].map(n=>`scripts/ci/bilingual-ui/${n}.test.mjs`)],tests:80,format:'tap'},
 {name:'diagnostic-node',command:process.execPath,args:['--test','--test-concurrency=1','--test-reporter=tap',...['contracts','evidence','flow','source'].map(n=>`scripts/ci/scroll-diagnostic/${n}.test.mjs`)],tests:29,format:'tap'},
 {name:'unchanged-monitor',command:'python3',args:['scripts/ci/bilingual-ui/monitor.test.py'],tests:42,format:'unittest'},
 {name:'diagnostic-monitor',command:'python3',args:['scripts/ci/scroll-diagnostic/monitor.test.py'],tests:2,format:'unittest'}
];
const receipt={schema:1,identity,diagnosticOnly:true,releaseAcceptance:false,passed:false,runs:[]};
try{for(const s of specs){const r={...s,passed:false};receipt.runs.push(r);const result=spawnSync(s.command,s.args,{encoding:'utf8',timeout:120000,maxBuffer:65536,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});r.stdout=result.stdout??'';r.stderr=result.stderr??'';r.exit=result.status;assert.equal(result.error,undefined);assert.equal(result.status,0);
 if(s.format==='tap'){assert.match(r.stdout,new RegExp(`^# tests ${s.tests}$`,'m'));assert.match(r.stdout,new RegExp(`^# pass ${s.tests}$`,'m'));for(const k of ['fail','cancelled','skipped','todo'])assert.match(r.stdout,new RegExp(`^# ${k} 0$`,'m'));}
 if(s.format==='unittest'){assert.match(r.stderr,new RegExp(`Ran ${s.tests} tests? in `));assert.match(r.stderr,/\nOK\s*$/);assert.doesNotMatch(r.stderr,/skipped|expected failures|unexpected successes/);}
 r.passed=true;
 }receipt.passed=true;}catch(e){receipt.error=String(e.message).slice(0,4096);process.exitCode=1;}
const bytes=JSON.stringify(receipt,null,2)+'\n';assert.ok(Buffer.byteLength(bytes)<=512*1024);fs.writeFileSync(path.join(dir,'tool-contract.json'),bytes,{flag:'wx',mode:0o600});console.log(JSON.stringify({passed:receipt.passed,runs:receipt.runs.map(r=>({name:r.name,tests:r.tests,passed:r.passed}))}));
