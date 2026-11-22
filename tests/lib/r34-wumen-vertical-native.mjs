import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {after} from 'node:test';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const entry='tests/current-state/wumen-vertical-source-guard.test.mjs';
const rawPaths=new Set(["src/scene/PalaceBuilder.js", "src/scene/RoofBuilder.js", "src/scene/palace/special/GateTowerProfiles.js", "src/scene/palace/special/GatePlaques.js", "src/scene/palace/special/WumenVerticalProfile.js"]);
const sha=value=>createHash('sha256').update(value).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function load(name,digest,limit){
  const bytes=readFileSync(new URL('../fixtures/'+name,import.meta.url));
  assert.equal(sha(bytes),digest,'immutable published R34 native Wumen source archive '+name);
  const record=JSON.parse(gunzipSync(bytes,{maxOutputLength:limit}));
  assert.equal(record.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(record.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  return record;
}

/** Register the exact R34-authored Wumen source assertions. All five
 * product inputs are read only as bytes, never executed. This historical
 * source test does not stand in for any current geometry or route check. */
export async function registerNativeR34WumenVerticalSource(){
  const shared=load('r34-legacy-source-guards.json.gz','c2bad93afee0342046292bd2d3ff72e72a0784435c6eb65cf425acd08155d20a',10_000_000);
  const extra=load('r34-wumen-vertical-native-extra.json.gz','7def46b1dfe27dba7847732f1623747605c25e09d699fdd88c4cf15a95a9b5e4',70_000);
  assert.equal(extra.entry,entry);
  assert.equal(Object.keys(extra.files).length,4);
  assert.equal(extra.files[entry].gitBlob,'d76146b6284c05f84437d7c7315e8caa03a4e4c7','untouched published R34 authored test');
  assert.equal(extra.roster.length,154);
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
  assert.equal(sha(ids.join('')),'cd6e08058a7ce175757bd1d8c54ff1ddfd7cb1ac94461c0630d2cc16150f7e73','exact R34 delivered Wumen source/fixture dependency closure');
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r34-wumen-vertical-'));
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
