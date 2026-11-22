import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {after} from 'node:test';

const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const epochIndex={
  "r58": {
    "commit": "82d8ab9d2b7cf13af6d2233ef3d262f183ce8cbd",
    "tree": "e37c7e99852d2b2e15c3bb87f0b59942aa3339a5",
    "files": 112,
    "extraFiles": 4,
    "gzipBytes": 55418
  },
  "r34": {
    "commit": "12682c3d1bcf2b5da13a18fda7d07b4a31f0c274",
    "tree": "8c8252249bbd261f96abed9c0e413ffc21269ce3",
    "files": 143,
    "extraFiles": 8,
    "gzipBytes": 39320
  }
};
const archiveIndex={
  "r33base": {
    "filename": "r33-native-sources.json.gz",
    "gzSha": "73bac0fc234dbf772126115f0f25aa8a28ab67f4ec45a23eaf1fab321b69fe24",
    "rawSha": "e6c1cbc235d1ecabb8da5a1e33ec434a64aea8dcfe179ab25c02df8ecd94ba9d",
    "rawN": 2266115
  },
  "r34render": {
    "filename": "r34-wumen-render-native-sources.json.gz",
    "gzSha": "97498b1ede5aa6d66d1836a66d8e4aae54a81428720b544d2fab398b5e42f909",
    "rawSha": "bc93c693a7ed4d9250ffe810971532f0506a4731feebd46e495cd025f9e8f87d",
    "rawN": 343304
  },
  "r58hall": {
    "filename": "r58-historical-hall-view.json.gz",
    "gzSha": "2a1453ff47dcb5d1c1cec99701ef3568db67495962e19bb8a4b9a4f4223b5d46",
    "rawSha": "b4c7455c8fde709425c0056ed6becdbf5ed3091f6cc8cd6e16e0316ed1f8b467",
    "rawN": 1354976
  },
  "r58": {
    "filename": "old-wumen-r58-exact-sources.json.gz",
    "gzSha": "d00509bc07dd677811e83d63e24463b83b87b6ab5e528aa333b88851d9ef954d",
    "rawSha": "5e1b3ef2b2505fe789e7013809e118c22172af2c7a0bfee593b477c174caf3f6",
    "rawN": 168152
  },
  "r34": {
    "filename": "old-wumen-r34-exact-sources.json.gz",
    "gzSha": "b18906785d49dc13f4679d117958a6ffe37be1a0eb505e8a2b507edadb6e1380",
    "rawSha": "e7a4cbf12bd6540ec68bb80363b7b65b6b284e0793ed86b4d46c583425b70423",
    "rawN": 112646
  }
};
const fixtures=new URL('../fixtures/',import.meta.url);
const allowed={
  "r58": {
    "file": "tests/current-state/r58-wumen-ascent-inheritance.test.mjs",
    "names": [
      "R58 first-batch Wumen keeps every original folded-ascent object and physical record byte-exact",
      "R58 explicit additions explain old whole-gate child/collider totals without changing the ascent oracle",
      "original ascent oracle still fails closed on actual geometry or collider mutation"
    ],
    "epoch": "r58"
  },
  "r34-vertical": {
    "file": "tests/current-state/wumen-vertical-profile.test.mjs",
    "names": [
      "all unscoped Wumen geometry, materials, wings, platform and portals stay byte-exact",
      "Wumen column count, plan, radii and horizontal tessellation remain fixed",
      "after exact folded-ascent restoration, all old physics retains only the 46 keyed submicrometre foot deltas"
    ],
    "epoch": "r34"
  },
  "r34-routes": {
    "file": "tests/current-state/gate-tower-routes.test.mjs",
    "names": [
      "Wumen fixed-width body completes both recessed verandas and four corners",
      "Wumen central south and north architectural openings form a real supported through route",
      "Wumen south outer strip stays blocked at actual eave columns"
    ],
    "epoch": "r34"
  }
};
const byKey=Object.create(null);
function archive(key){
 if(byKey[key])return byKey[key];
 assert.ok(Object.hasOwn(archiveIndex,key));
 const a=archiveIndex[key],z=readFileSync(new URL(a.filename,fixtures));
 assert.equal(sha(z),a.gzSha,'archived compressed SHA: '+key);
 const raw=gunzipSync(z,{maxOutputLength:a.rawN});
 assert.equal(sha(raw),a.rawSha,'archived decoded SHA: '+key);
 return byKey[key]=JSON.parse(raw);
}
function stage(kind){
 const e=epochIndex[kind],r=archive(kind);
 assert.equal(r.commit,e.commit);assert.equal(r.tree,e.tree);
 assert.equal(Object.keys(r.files).length,e.files);
 assert.equal(Object.keys(r.files).filter(p=>Object.hasOwn(r.files[p],'utf8')).length,e.extraFiles);
 const lock=JSON.parse(readFileSync(new URL('../../package-lock.json',import.meta.url))).packages['node_modules/three'];
 for(const key of ['version','integrity','resolved'])assert.equal(lock[key],r.three[key]);
 const pkg=new URL('../package.json',import.meta.resolve('three'));
 assert.equal(JSON.parse(readFileSync(pkg)).version,r.three.version);
 const dir=mkdtempSync(join(tmpdir(),'palace-exact-old-wumen-')),dispose=()=>rmSync(dir,{recursive:true,force:true});
 try{
  for(const [p,v] of Object.entries(r.files)){
   assert.ok(/^[\w./-]+$/.test(p)&&!p.split('/').some(k=>!k||k==='.'||k==='..')&&(p==='package.json'||/^src\/|^data\/|^tests\/(?:lib|fixtures)\//.test(p)||Object.values(allowed).some(x=>x.file===p)),p);
   const bytes=Object.hasOwn(v,'utf8')?Buffer.from(v.utf8,'utf8'):Buffer.from(archive(v.source).files[p][v.field],'utf8');
   assert.equal(bytes.length,v.bytes,p);assert.equal(sha(bytes),v.sha256,p);assert.equal(blob(bytes),v.blob,p);
   const loc=join(dir,p);mkdirSync(dirname(loc),{recursive:true});writeFileSync(loc,bytes,{flag:'wx'});
  }
  mkdirSync(join(dir,'node_modules'));symlinkSync(dirname(fileURLToPath(pkg)),join(dir,'node_modules','three'),'dir');
  return {dir,dispose};
 }catch(error){dispose();throw error;}
}
export async function registerExactOldWumen(which){
 assert.ok(which==='r58'||which==='r34-routes');
 const a=allowed[which],{dir,dispose}=stage(a.epoch);
 try{await import(pathToFileURL(join(dir,a.file)));}catch(error){dispose();throw error;}
 after(dispose);
}
let checkedVertical=false;
export function assertExactOldWumenVertical(name){
 const a=allowed['r34-vertical'];
 assert.ok(a.names.includes(name),'only the three historical Wumen vertical names may replay');
 if(checkedVertical)return;
 const {dir,dispose}=stage(a.epoch);
 try{
  const env={...process.env,TZ:'UTC',LC_ALL:'C'};
  for(const k of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT','NODE_CHANNEL_FD','NODE_TEST_REPORTER','R48_REAL_TEXTURE_LIBRARY'])delete env[k];
  const pattern='^(?:'+a.names.map(n=>n.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&')).join('|')+')$';
  const run=spawnSync(process.execPath,['--max-old-space-size=768','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern='+pattern,a.file],{cwd:dir,env,encoding:'utf8',timeout:45000,maxBuffer:1_000_000});
  if(run.error)throw run.error;
  assert.equal(run.status,0,run.stderr+'\n'+run.stdout);
  assert.deepEqual([...run.stdout.matchAll(/^ok \d+ - (.+)$/gm)].map(m=>m[1]),a.names);
  for(const s of ['# tests 3','# pass 3','# fail 0','# skipped 0','# cancelled 0'])assert.ok(run.stdout.split('\n').includes(s),run.stdout);
  checkedVertical=true;
 }finally{dispose();}
}
