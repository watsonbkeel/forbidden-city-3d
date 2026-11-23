import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {after} from 'node:test';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const entry='tests/current-state/r15-source-retention.test.mjs';
const rawPaths=new Set(['main.js','src/scene/Environment.js','src/scene/interior/InteriorLoader.js','src/ui/Minimap.js']);
const sha=value=>createHash('sha256').update(value).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function load(name,digest,limit){
  const bytes=readFileSync(new URL('../fixtures/'+name,import.meta.url));
  assert.equal(sha(bytes),digest,'immutable published R34 native R15 source archive '+name);
  const record=JSON.parse(gunzipSync(bytes,{maxOutputLength:limit}));
  assert.equal(record.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(record.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  return record;
}

/** Register the exact original eight source assertions: four successful
 * reversals and four mutation suites. No current flight tests are redirected
 * and the four input sources are read only as bytes, never executed. */
export async function registerNativeR34R15Source(){
  const shared=load('r34-legacy-source-guards.json.gz','c2bad93afee0342046292bd2d3ff72e72a0784435c6eb65cf425acd08155d20a',10_000_000);
  const extra=load('r34-r15-source-native-extra.json.gz','49806e3e473269204b581d36168afd7173e8c57a0910de8870507043565f5e70',100_000);
  assert.equal(extra.entry,entry);
  assert.equal(Object.keys(extra.files).length,4);
  assert.equal(extra.files[entry].gitBlob,'373201b35f5b1c1a1bfc7cfb1807dcb96575249a','untouched published R34 authored test');
  assert.equal(extra.roster.length,101);
  assert.deepEqual(extra.roster,[...new Set(extra.roster)].sort());
  assert.ok([...rawPaths,entry,'package.json'].every(name=>extra.roster.includes(name)));
  const ids=[], rows=[];
  for(const name of extra.roster){
    assert.ok(/^[a-zA-Z0-9_.\/-]+$/.test(name)&&!name.split('/').some(x=>!x||x==='.'||x==='..'),name);
    assert.ok(rawPaths.has(name)||name==='package.json'||name===entry||/^tests\/(lib|fixtures)\//.test(name),name);
    assert.notEqual(Object.hasOwn(extra.files,name),Object.hasOwn(shared.files,name),name);
    const row=extra.files[name]??shared.files[name], bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name); assert.equal(sha(bytes),row.sha256,name); assert.equal(blob(bytes),row.gitBlob,name);
    ids.push(name+' '+row.gitBlob+'\n'); rows.push([name,bytes]);
  }
  assert.equal(sha(ids.join('')),'3be2de62c6187232c28c5a79e4e5619b08b1f17bfa70f635414e3b3f5e1ed523','exact R34 delivered R15 source/fixture dependency closure');
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r34-r15-source-'));
  const dispose=()=>rmSync(dir,{recursive:true,force:true});
  try{
    for(const [name,bytes] of rows){
      const target=path.join(dir,name);
      mkdirSync(path.dirname(target),{recursive:true});
      writeFileSync(target,bytes,{flag:'wx',mode:0o444});
    }
    after(dispose);
    await import(pathToFileURL(path.join(dir,entry)).href);
  }catch(error){dispose();throw error;}
}
