// Isolated serial replay: prevents one file-level termination hiding later names.
import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const dir='reports/major-pilots/sishen/',missing=JSON.parse(fs.readFileSync(dir+'aggregate-parent-comparison.json')).missing;
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),rows=[];
for(const [i,name] of missing.entries()) {
 const path=name.startsWith('tests/')?name:'tests/current-state/r63-west-rear-compound-routes.test.mjs';
 const args=['--import','./scripts/major-pilots/sishen/parent-source.mjs','--test','--test-reporter=tap','--test-concurrency=1'];
 if(name!==path)args.push('--test-name-pattern=^'+escape(name)+'$');args.push(path);
 const log=dir+`unresolved-parent-${i}.log`,fd=fs.openSync(log,'w'),r=spawnSync(process.execPath,args,{stdio:['ignore',fd,fd]});fs.closeSync(fd);
 const text=fs.readFileSync(log,'utf8');rows.push({name,path,status:r.status,signal:r.signal,log,summary:text.match(/^# (?:tests|pass|fail|duration_ms).*$/gm),testCodeFailure:text.includes('failureType: \'testCodeFailure\'')});fs.writeFileSync(dir+'unresolved-parent-replay.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows.at(-1)));
}
