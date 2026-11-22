import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const entry='tests/current-state/gate-plaque-visibility-source-guard.test.mjs';
const sourcePaths=new Set(['src/scene/RoofBuilder.js','src/scene/PalaceBuilder.js',
  'src/scene/palace/special/GatePlaques.js','src/config/constants.js']);
const historicalNames=new Map([
  [
    "src/scene/RoofBuilder.js",
    "src/scene/RoofBuilder.js: no roof/builder/camera-constant edit in the visibility fix after exact V14 leaf normalization"
  ],
  [
    "src/scene/PalaceBuilder.js",
    "src/scene/PalaceBuilder.js: no roof/builder/camera-constant edit in the visibility fix after exact V14 leaf normalization"
  ]
]);
const sha=value=>createHash('sha256').update(value).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function load(name,digest,limit){
  const bytes=readFileSync(new URL('../fixtures/'+name,import.meta.url));
  assert.equal(sha(bytes),digest,'immutable published R34 archive '+name);
  const record=JSON.parse(gunzipSync(bytes,{maxOutputLength:limit}));
  assert.equal(record.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(record.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  return record;
}
function nativeFiles(){
  const existing=load('r34-legacy-source-guards.json.gz','c2bad93afee0342046292bd2d3ff72e72a0784435c6eb65cf425acd08155d20a',10_000_000);
  const extra=load('r34-plaque-visibility-native-extra.json.gz','6e7c1cb7c2b84da42c736eb94720721ed4e49c7ad96d62ed6d917f852d23e17e',40_000);
  assert.equal(extra.entry,entry);
  assert.equal(Object.keys(extra.files).length,4);
  assert.equal(extra.files[entry].gitBlob,'64c724d643ea1d23fd090b929b701dbef616e014','untouched authored test');
  const closure=extra.roster;
  assert.equal(closure.length,155);
  assert.deepEqual(closure,[...new Set(closure)].sort());
  const ids=[];
  const rows=[];
  for(const name of closure){
    assert.ok(/^[a-zA-Z0-9_.\/-]+$/.test(name)&&!name.split('/').some(x=>!x||x==='.'||x==='..'),name);
    assert.ok(sourcePaths.has(name)||name==='package.json'||name===entry||/^tests\/(lib|fixtures)\//.test(name),name);
    assert.notEqual(Object.hasOwn(extra.files,name),Object.hasOwn(existing.files,name),name);
    const row=extra.files[name]??existing.files[name], bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name); assert.equal(sha(bytes),row.sha256,name); assert.equal(blob(bytes),row.gitBlob,name);
    ids.push(name+' '+row.gitBlob+'\n'); rows.push([name,bytes]);
  }
  assert.equal(sha(ids.join('')),'d0428b88e0f7b298342c5a841b96b69aebd8ab4116abb704975577c9330c6f80','exact R34 visibility source graph');
  return rows;
}

export function replayR34PlaqueVisibilitySource(pathname){
  assert.ok(historicalNames.has(pathname),'only the two R34 roof/builder guards may replay');
  const name=historicalNames.get(pathname), inputs=nativeFiles();
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r34-plaque-visibility-'));
  try {
    for(const [name,bytes] of inputs){
      const destination=path.join(dir,name);
      mkdirSync(path.dirname(destination),{recursive:true});
      writeFileSync(destination,bytes,{flag:'wx',mode:0o444});
    }
    const env={TZ:'UTC',LC_ALL:'C'};
    if(process.platform==='win32'&&process.env.SystemRoot)env.SystemRoot=process.env.SystemRoot;
    const child=spawnSync(process.execPath,['--max-old-space-size=768','--test','--test-concurrency=1','--test-reporter=tap',
      '--test-name-pattern=^'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$',entry],
      {cwd:dir,env,encoding:'utf8',maxBuffer:512_000,timeout:15_000,windowsHide:true});
    assert.ifError(child.error);assert.equal(child.signal,null,child.stderr);
    assert.equal(child.status,0,child.stdout+'\n'+child.stderr);
    const lines=child.stdout.replaceAll('\r\n','\n').trimEnd().split('\n');
    assert.equal(lines[0],'TAP version 13');
    assert.deepEqual(lines.filter(s=>s.startsWith('# Subtest: ')),['# Subtest: '+name]);
    assert.deepEqual(lines.filter(s=>/^(?:not )?ok \d+ - /.test(s)),['ok 1 - '+name]);
    assert.deepEqual(lines.filter(s=>/^\d+\.\.\d+/.test(s)),['1..1']);
    for(const [key,val] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
      assert.deepEqual(lines.filter(s=>s.startsWith('# '+key+' ')),['# '+key+' '+val]);
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
}
