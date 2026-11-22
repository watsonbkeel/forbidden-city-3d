import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const fixtures=new URL('../fixtures/',import.meta.url);
const allowed={"tests/current-state/gate-plaques.test.mjs": ["午门: explicit candidate budget replaces one mesh, adds one material, and preserves physics"], "tests/current-state/gate-tower-render-geometry.test.mjs": ["Wumen preserves all geometry outside the finite reviewed main-tower profile", "Wumen outer columns retain horizontal axes and radius parameters while approved heights change", "Wumen historical top and ramp support golden survives only the exact folded-ascent restoration"]};
const cache=new Set();
function read(name,zsha,rsha,n){
 const z=readFileSync(new URL(name,fixtures));assert.equal(sha(z),zsha);
 const raw=gunzipSync(z,{maxOutputLength:n});assert.equal(sha(raw),rsha);
 return JSON.parse(raw);
}
export function assertNativeR34WumenRender(name){
 const pair=Object.entries(allowed).find(([,names])=>names.includes(name));
 assert.ok(pair,'strict historical Wumen name required');const [entry,names]=pair;
 if(cache.has(entry))return;
 const r33=read('r33-native-sources.json.gz','73bac0fc234dbf772126115f0f25aa8a28ab67f4ec45a23eaf1fab321b69fe24','e6c1cbc235d1ecabb8da5a1e33ec434a64aea8dcfe179ab25c02df8ecd94ba9d',2266115);
 const r34=read('r34-wumen-render-native-sources.json.gz','97498b1ede5aa6d66d1836a66d8e4aae54a81428720b544d2fab398b5e42f909','bc93c693a7ed4d9250ffe810971532f0506a4731feebd46e495cd025f9e8f87d',343304);
 assert.equal(r34.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
 assert.equal(r34.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
 assert.equal(r33.publishedCandidate,'3b9f01f1fafad61f7c23efee1f1bb0a37c2ed8fb');
 const keep=Object.entries(r34.files);assert.equal(keep.length,102);
 const lock=JSON.parse(readFileSync(new URL('../../package-lock.json',import.meta.url))).packages['node_modules/three'];
 for(const key of ['version','integrity','resolved'])assert.equal(lock[key],r34.three[key]);
 const pkg=new URL('../package.json',import.meta.resolve('three'));
 assert.equal(JSON.parse(readFileSync(pkg)).version,r34.three.version);
 const w=mkdtempSync(join(tmpdir(),'palace-r34-gate-render-'));
 try{
  for(const [p,v] of keep){
   assert.ok(/^[\w./-]+$/.test(p)&&!p.split('/').some(k=>!k||k==='.'||k==='..')&&(p==='package.json'||/^src\/|^data\/|^tests\/(?:lib|fixtures)\//.test(p)||Object.hasOwn(allowed,p)),p);
   const rec=Object.hasOwn(v,'utf8')?v:r33.files[p];assert.ok(rec,p);
   const b=Buffer.from(rec.utf8,'utf8');
   assert.equal(b.length,v.bytes,p);assert.equal(sha(b),v.sha256,p);assert.equal(blob(b),v.blob,p);
   const loc=join(w,p);mkdirSync(dirname(loc),{recursive:true});writeFileSync(loc,b,{flag:'wx'});
  }
  mkdirSync(join(w,'node_modules'));symlinkSync(dirname(fileURLToPath(pkg)),join(w,'node_modules','three'),'dir');
  const env={...process.env,TZ:'UTC',LC_ALL:'C'};
  for(const k of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT','NODE_CHANNEL_FD','NODE_TEST_REPORTER','R48_REAL_TEXTURE_LIBRARY'])delete env[k];
  const pattern='^(?:'+names.map(n=>n.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&')).join('|')+')$';
  const out=spawnSync(process.execPath,['--max-old-space-size=768','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern='+pattern,entry],{cwd:w,env,encoding:'utf8',timeout:45000,maxBuffer:1_000_000});
  if(out.error)throw out.error;
  assert.equal(out.status,0,out.stderr+'\n'+out.stdout);
  assert.deepEqual([...out.stdout.matchAll(/^ok \d+ - (.+)$/gm)].map(m=>m[1]),names);
  for(const s of [`# tests ${names.length}`,`# pass ${names.length}`,'# fail 0','# skipped 0','# cancelled 0'])assert.ok(out.stdout.split('\n').includes(s),out.stdout);
  cache.add(entry);
 }finally{rmSync(w,{recursive:true,force:true});}
}
