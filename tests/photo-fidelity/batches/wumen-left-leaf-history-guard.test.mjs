import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const mutations={
 'candidate-left':"if(p.endsWith('/src/scene/palace/special/WumenLeftLeafStuds.js'))return alter(value)",
 'predecessor-lower':"if(p.endsWith('/tests/fixtures/r157-wumen-left-leaf/WumenLowerBase.eec.baseline.txt'))return alter(value)",
 'manifest-pin':"if(p.endsWith('/tests/fixtures/r157-wumen-left-leaf/source-current.json'))return alter(value)",
 'extra-source':'', 'missing-source':'', 'symlink-source':'',
};
for(const [mode,edit]of Object.entries(mutations))test('actual592 history guard rejects '+mode+' without modifying files',()=>{
 const code=`import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const guard=await import('./tests/lib/wumen-left-leaf-historical-runner.mjs');guard.verifyCurrentLeftClosure();
const read=fs.readFileSync,list=fs.readdirSync,alter=v=>Buffer.isBuffer(v)?Buffer.concat([v,Buffer.from('\\n// GUARD NEGATIVE')]):v+'\\n// GUARD NEGATIVE';
fs.readFileSync=function(file,...args){const p=file instanceof URL?file.pathname:path.resolve(String(file)),value=read.call(this,file,...args);${edit};return value;};
fs.readdirSync=function(file,...args){const p=file instanceof URL?file.pathname:path.resolve(String(file)),rows=list.call(this,file,...args);if(${JSON.stringify(mode)}==='extra-source'&&p.endsWith('/src'))return [...rows,{name:'FORGED_EXTRA.js',isDirectory:()=>false,isFile:()=>true}];if(p.endsWith('/src/scene/palace/special')){if(${JSON.stringify(mode)}==='missing-source')return rows.filter(r=>r.name!=='WumenLeftLeafStuds.js');if(${JSON.stringify(mode)}==='symlink-source')return rows.map(r=>r.name==='WumenLeftLeafStuds.js'?{name:r.name,isDirectory:()=>false,isFile:()=>false}:r);}return rows;};
let rejected=false;try{guard.verifyCurrentLeftClosure();}catch(e){if(e.code!=='ERR_ASSERTION')throw e;rejected=true;console.log('EXPECTED_ASSERTION_REJECTION '+${JSON.stringify(mode)});}
if(!rejected)throw Error('Guard accepted invalid input');`;
 const env={...process.env};delete env.NODE_TEST_CONTEXT;const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:process.cwd(),env,encoding:'utf8',timeout:20000,maxBuffer:1024*1024});assert.equal(r.error,undefined);assert.equal(r.signal,null);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,new RegExp('EXPECTED_ASSERTION_REJECTION '+mode));
});
