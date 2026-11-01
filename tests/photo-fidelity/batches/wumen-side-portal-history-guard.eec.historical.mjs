import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const mutations={
 'candidate-face':"if(p.endsWith('/src/scene/palace/special/WumenSidePortalFaces.js'))return alter(value)",
 'predecessor-lower':"if(p.endsWith('/tests/fixtures/r157-wumen-side-portal/WumenLowerBase.db1.baseline.txt'))return alter(value)",
 'old-contract':"if(p.endsWith('/tests/photo-fidelity/batches/wumen-main-grid.before-width.historical.mjs'))return alter(value)",
 'extra-source':'', 'missing-source':'', 'symlink-source':'',
};
for(const [mode,edit]of Object.entries(mutations))test('precise successor history guard rejects '+mode+' without modifying files',()=>{
 const code=`import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const read=fs.readFileSync,list=fs.readdirSync,alter=v=>Buffer.isBuffer(v)?Buffer.concat([v,Buffer.from('\\n// GUARD NEGATIVE')]):v+'\\n// GUARD NEGATIVE';
fs.readFileSync=function(file,...args){const p=file instanceof URL?file.pathname:path.resolve(String(file)),value=read.call(this,file,...args);${edit};return value;};
fs.readdirSync=function(file,...args){const p=file instanceof URL?file.pathname:path.resolve(String(file)),rows=list.call(this,file,...args);if(${JSON.stringify(mode)}==='extra-source'&&p.endsWith('/src/'))return [...rows,{name:'FORGED_EXTRA.js',isDirectory:()=>false,isFile:()=>true}];if(p.endsWith('/src/scene/palace/special/')){if(${JSON.stringify(mode)}==='missing-source')return rows.filter(r=>r.name!=='WumenSidePortalFaces.js');if(${JSON.stringify(mode)}==='symlink-source')return rows.map(r=>r.name==='WumenSidePortalFaces.js'?{name:r.name,isDirectory:()=>false,isFile:()=>false}:r);}return rows;};
let rejected=false;try{const m=await import('./tests/lib/wumen-side-portal-historical-runner.mjs');m.runWidthPredecessor(pathToFileURL(path.resolve('tests/photo-fidelity/batches/wumen-main-grid.before-width.historical.mjs')));}catch(e){if(e.code!=='ERR_ASSERTION')throw e;rejected=true;console.log('EXPECTED_ASSERTION_REJECTION '+${JSON.stringify(mode)});}
if(!rejected)throw Error('Guard accepted invalid input');`;
 const env={...process.env};delete env.NODE_TEST_CONTEXT;const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:process.cwd(),env,encoding:'utf8',timeout:20000,maxBuffer:1024*1024});assert.equal(r.error,undefined);assert.equal(r.signal,null);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,new RegExp('EXPECTED_ASSERTION_REJECTION '+mode));
});
