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
const entry='tests/current-state/taihe-core-geometry.test.mjs';
const testFixtures=new URL('../fixtures/',import.meta.url);
const root=new URL('../../',import.meta.url);
const valid=name=>/^[A-Za-z0-9_.\/-]+$/.test(name)&&!name.split('/').some(p=>!p||p==='.'||p==='..')
  &&(name===entry||name==='package.json'||name==='tests/stepwalk.cjs'||
    /^(src|data|public|tests\/lib|tests\/fixtures|docs\/current-state\/taihe-v16-core)\//.test(name));
function readArchive(name,maxOutputLength,digest) {
  const raw=gunzipSync(fs.readFileSync(new URL(name,testFixtures)),{maxOutputLength});
  assert.equal(sha(raw),digest,'immutable authentic Taihe source archive: '+name);
  return JSON.parse(raw);
}
function bind(name,b,row) {
  assert.equal(b.length,row.bytes,'exact historic file length: '+name);
  assert.equal(sha(b),row.sha256,'exact historic SHA-256: '+name);
  assert.equal(blob(b),row.gitBlob,'exact historic Git blob: '+name);
}

/** Register the exact authored 12-case historical geometry suite. This does
 * not replace the current Taihe walking/navigation acceptance, or pin any
 * current source. Old source and assets never fall back to a live version. */
export async function registerNativeTaiheGeometry() {
  const m=readArchive('r34-taihe-geometry-native-delta.json.gz',413_219,
    'c514b163f9cfb94f0df24c48b0f19b56317eedc82a72aee71b3ea33a1c2ffd91');
  const prior=readArchive('r33-native-sources.json.gz',2_266_115,
    'e6c1cbc235d1ecabb8da5a1e33ec434a64aea8dcfe179ab25c02df8ecd94ba9d');
  const guard=readArchive('r34-legacy-source-guards.json.gz',9_237_718,
    'ec5d213af5da898a32f309d00b8ce7bf55411b6aedeb4adaf0480ec3046738d9');
  const resident=readArchive('r34-resident-night-native-delta.json.gz',168_692,
    '55d22d6d5a015b0da36369cdbdc45999d68e8f0c282446bbc9635271a0296263');
  assert.equal(m.published,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(m.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  assert.equal(guard.commit,m.published);assert.equal(guard.tree,m.tree);
  assert.equal(resident.publishedR34,m.published);assert.equal(resident.publishedR34Tree,m.tree);
  assert.equal(prior.publishedCandidate,'3b9f01f1fafad61f7c23efee1f1bb0a37c2ed8fb');
  const names=Object.keys(m.rows);
  assert.equal(names.length,429);assert.deepEqual(names,names.slice().sort());
  const digest=ns=>sha(ns.map(n=>n+' '+m.rows[n].gitBlob).join('\n')+'\n');
  assert.equal(digest(names),'7ea1fde5039e49c53f68b84c7064607b8929affafb9d3b155e4b629d441932ae','complete old fixture and file oracle');
  assert.equal(m.rows[entry].gitBlob,'bb1541a749ce37ccefa8086d7ebeaa2cd4ab85a3','unchanged authored 12-case test');
  const assets=names.filter(n=>m.rows[n].mode==='shipped-asset');
  assert.equal(assets.length,118);
  assert.equal(digest(assets),'3db4645ae83db82586963968f602ce40172d908e1cca558731c04f9f237f22cf',
    'finite exact old public asset reuse list');
  assert.equal(Object.keys(m.embedded).length,29);
  const lock=JSON.parse(fs.readFileSync(new URL('package-lock.json',root))).packages['node_modules/three'];
  for(const [key,value] of Object.entries(m.three))assert.equal(lock[key],value,'exact test Three lock: '+key);
  const threeURL=new URL('../package.json',import.meta.resolve('three'));
  assert.equal(JSON.parse(fs.readFileSync(threeURL)).version,m.three.version);

  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'palace-r34-taihe-geometry-'));
  const dispose=()=>fs.rmSync(temp,{recursive:true,force:true});
  try {
    for(const name of names) {
      assert.ok(valid(name),'registered historical Taihe input: '+name);
      const row=m.rows[name];
      let bytes;
      if(row.mode==='r33') {
        assert.equal(prior.files[name].gitBlob,row.gitBlob);
        bytes=Buffer.from(prior.files[name].utf8,'utf8');
      } else if(row.mode==='r34-guard') {
        assert.equal(guard.files[name].gitBlob,row.gitBlob);
        bytes=Buffer.from(guard.files[name].source,'utf8');
      } else if(row.mode==='r34-resident') {
        assert.equal(resident.inputs[name].gitBlob,row.gitBlob);
        bytes=Buffer.from(resident.extra[name],'utf8');
      } else if(row.mode==='shipped-asset') {
        assert.ok(name.startsWith('public/'),'only the exact shipped historical asset may be reused');
        bytes=fs.readFileSync(new URL(name,root));
      } else if(row.mode==='embedded-base64') {
        assert.equal(name,'public/models/interiors/yangxin.glb');
        bytes=Buffer.from(m.embedded[name],'base64');
      } else {
        assert.equal(row.mode,'embedded');
        bytes=Buffer.from(m.embedded[name],'utf8');
      }
      // No test registers before every reused input is independently exact.
      bind(name,bytes,row);
      const target=path.join(temp,name);
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.writeFileSync(target,bytes,{flag:'wx',mode:0o444});
    }
    fs.mkdirSync(path.join(temp,'node_modules'));
    fs.symlinkSync(fileURLToPath(new URL('./',threeURL)),path.join(temp,'node_modules','three'),'junction');
    after(dispose);
    await import(pathToFileURL(path.join(temp,entry)).href);
  } catch(error) {
    dispose();
    throw error;
  }
}
