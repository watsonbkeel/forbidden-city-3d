import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {sourceFingerprint} from './build-identity.mjs';
export const baseline='645748e39494bf5c5305699b052ae87df32224f0';
const sha=b=>createHash('sha256').update(b).digest('hex');
export function inventory(root){
 const roots=['index.html','main.js','style.css','src','data','public','package.json','package-lock.json','vite.config.js','release.json','scripts/build-identity.mjs'],files=[];
 function visit(p){const full=path.join(root,p);if(!fs.existsSync(full))return;const st=fs.lstatSync(full);if(st.isDirectory()){for(const child of fs.readdirSync(full).sort())visit(p+'/'+child);}else{if(!st.isFile())throw Error('Nonregular input:'+p);const b=fs.readFileSync(full);files.push({path:p,bytes:b.length,sha256:sha(b)});}}
 roots.forEach(visit);return files;
}
export function verify(actual,expected){if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('R72 exact source inventory mismatch');return true;}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const root=process.cwd(),file='reports/r72-nightlife-safety/source-inventory.json',files=inventory(root);
 if(process.argv.includes('--record')){
  const changes=[];for(const f of files){let old;try{old=execFileSync('git',['show',baseline+':'+f.path],{cwd:root,maxBuffer:64*1024*1024,stdio:['ignore','pipe','ignore']});}catch{}if(!old||sha(old)!==f.sha256)changes.push({...f,status:old?'modified':'added',baselineSHA256:old?sha(old):null});}
  fs.writeFileSync(file,JSON.stringify({baseline,sourceFingerprint:sourceFingerprint(root),files,changes},null,2)+'\n');console.log(JSON.stringify({files:files.length,changes:changes.length,added:changes.filter(c=>c.status==='added').length}));
 }else{const expected=JSON.parse(fs.readFileSync(file));verify(files,expected.files);if(sourceFingerprint(root)!==expected.sourceFingerprint)throw Error('Fingerprint mismatch');console.log('R72 exact source inventory verified');}
}
