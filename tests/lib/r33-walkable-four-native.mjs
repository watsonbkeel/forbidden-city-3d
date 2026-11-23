import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {after} from 'node:test';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const entry='tests/current-state/walkable-four-buildings.test.mjs';
function readArchive(name,maxOutputLength,expected) {
  const bytes=gunzipSync(fs.readFileSync(new URL('../fixtures/'+name,import.meta.url)),{maxOutputLength});
  assert.equal(sha(bytes),expected,'immutable exact historical R33 source archive: '+name);
  return JSON.parse(bytes);
}
const valid=name=>/^[A-Za-z0-9_.\/-]+$/.test(name)
  &&!name.split('/').some(p=>!p||p==='.'||p==='..')
  &&(name===entry||name==='package.json'||/^(src|data|tests\/lib)\//.test(name));

/** Register the unchanged authored six physical-walk assertions against the
 * delivered R33 source. The old deterministic helper is not a surrogate for
 * running today's FirstPerson controller in the modern scene. */
export async function registerR33WalkableFour() {
  const anchor=readArchive('r33-native-sources.json.gz',2_266_115,
    'e6c1cbc235d1ecabb8da5a1e33ec434a64aea8dcfe179ab25c02df8ecd94ba9d');
  const delta=readArchive('r33-walkable-four-native-delta.json.gz',86_299,
    '7e268e2158f9186184e66258afe386890cdf2c77930376f12c2d77d533f48d73');
  assert.equal(delta.published,'3b9f01f1fafad61f7c23efee1f1bb0a37c2ed8fb');
  assert.equal(delta.tree,'4f81cce5185002fdd52da92bd8bba5cc37aece74');
  assert.equal(anchor.publishedCandidate,delta.published);
  assert.equal(anchor.publishedTree,delta.tree);
  const closure=Object.keys(delta.rows);
  assert.equal(closure.length,129);
  assert.deepEqual(closure,closure.slice().sort());
  assert.equal(sha(closure.map(n=>n+' '+delta.rows[n].gitBlob).join('\n')+'\n'),
    '219256a25faee55d8c0b79ae8018735f34080202f920ec9422bcd09f43bbc78d',
    'complete authored R33 walk/helper dependency scope');
  assert.equal(delta.rows[entry].gitBlob,'0d3ca3e8dfaf32e06714e2b71eb047e3c929d129','unmodified original test');
  assert.equal(delta.zones.length,7,'full original world zone roster');
  assert.deepEqual(closure.filter(n=>/^data\/zones\/[^/]+\.json$/.test(n)),delta.zones);
  assert.equal(Object.keys(delta.embedded).length,6);
  assert.deepEqual(Object.keys(delta.embedded),closure.filter(n=>anchor.files[n]?.gitBlob!==delta.rows[n].gitBlob));
  const inputs=new Map();
  for(const name of closure) {
    assert.ok(valid(name),'registered historical R33 walk path: '+name);
    const row=delta.rows[name], bytes=Buffer.from(Object.hasOwn(delta.embedded,name)
      ? delta.embedded[name] : anchor.files[name].utf8,'utf8');
    assert.equal(bytes.length,row.bytes,'exact published length: '+name);
    assert.equal(sha(bytes),row.sha256,'exact published digest: '+name);
    assert.equal(blob(bytes),row.gitBlob,'exact published Git blob: '+name);
    inputs.set(name,bytes);
  }
  const three=JSON.parse(fs.readFileSync(new URL('../../package-lock.json',import.meta.url))).packages['node_modules/three'];
  for(const [key,value] of Object.entries(delta.three)) assert.equal(three[key],value,'exact historical Three lock: '+key);
  const packageURL=new URL('../package.json',import.meta.resolve('three'));
  assert.equal(JSON.parse(fs.readFileSync(packageURL)).version,delta.three.version);

  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'palace-r33-walkable-four-'));
  const dispose=()=>fs.rmSync(temp,{recursive:true,force:true});
  try {
    for(const [name,bytes] of inputs) {
      const target=path.join(temp,name);
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.writeFileSync(target,bytes,{flag:'wx',mode:0o444});
    }
    // Only the locked Three dependency is shared; all product/test relative
    // paths resolve under the private, exact source tree.
    fs.mkdirSync(path.join(temp,'node_modules'));
    fs.symlinkSync(fileURLToPath(new URL('./',packageURL)),path.join(temp,'node_modules','three'),'junction');
    after(dispose);
    await import(pathToFileURL(path.join(temp,entry)).href);
  } catch (error) {
    dispose();
    throw error;
  }
}
