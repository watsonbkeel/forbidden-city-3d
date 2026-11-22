import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {after} from 'node:test';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const entries = {
  "tests/current-state/gate-ground-door-source-guard.test.mjs": {
    "length": 151,
    "digest": "0a4f66922238317f065f2cf912f1cea2c3e3e6c17d00776560b8f095137da11b",
    "testBlob": "8ce6d10337e6eb63569f721d6a1534a9d7c4b3c8"
  },
  "tests/current-state/gate-plaque-source-guard.test.mjs": {
    "length": 153,
    "digest": "6cb1e488fb642a3edd5dee05191ae805596019fd010afda15d4ee4294649206f",
    "testBlob": "03f503328dc163d1b56186f2a0bc27b9b8af1eb7"
  },
  "tests/current-state/taihe-core-source-guard.test.mjs": {
    "length": 152,
    "digest": "86b6c8e0fbfdcfe64fa73912d0002db45b57ab4bb929e54014448df86bd206bd",
    "testBlob": "52d978ad3ead742c31cab488192bbb7dfe3d213d"
  }
};
const rawInputs = new Set(['src/scene/PalaceBuilder.js','src/scene/RoofBuilder.js','src/scene/interior/InteriorLoader.js']);
const sha = value => createHash('sha256').update(value).digest('hex');
const gitBlob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const permits = (p,entry) => /^[a-zA-Z0-9_.\/-]+$/.test(p) &&
  !p.split('/').some(part=>!part||part==='.'||part==='..') &&
  (/^tests\/(lib|fixtures)\//.test(p)||rawInputs.has(p)||p==='package.json'||p===entry);

/** Register the original named tests, not replacement pass conditions.
 * Only the native source guard gets these private R34 paths. No current game
 * source or unrelated library bytes are opened, changed or pinned. */
export async function registerR34LegacySourceGuard(entry) {
  assert.ok(Object.hasOwn(entries,entry),'only the three delivered R34 legacy guards may replay');
  const expected=entries[entry];
  const archive=readFileSync(new URL('../fixtures/r34-legacy-source-guards.json.gz',import.meta.url));
  assert.equal(sha(archive),'c2bad93afee0342046292bd2d3ff72e72a0784435c6eb65cf425acd08155d20a','immutable R34 authored source-guard archive');
  const record=JSON.parse(gunzipSync(archive,{maxOutputLength:10_000_000}));
  assert.equal(record.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(record.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  assert.equal(Object.keys(record.files).length,158);
  assert.deepEqual(Object.keys(record.groups),Object.keys(entries));
  const allNames=Object.keys(record.files).sort();
  const namesDigest=names=>sha(names.map(n=>n+' '+record.files[n].gitBlob).join('\n')+'\n');
  assert.equal(namesDigest(allNames),'67826960ff0b2c16006e4773a174a37ec4fdfbe468849cc2337c08b5fb407275','published R34 source/helper/fixture registry');
  const {closure,digest}=record.groups[entry];
  assert.equal(closure.length,expected.length);
  assert.deepEqual(closure,[...new Set(closure)].sort());
  assert.ok(closure.includes(entry));
  assert.equal(digest,expected.digest);
  assert.equal(namesDigest(closure),expected.digest,'exact R34 per-entrypoint closure');
  assert.equal(record.files[entry].gitBlob,expected.testBlob,'untouched authored source guard');
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r34-legacy-'));
  const dispose=()=>rmSync(dir,{recursive:true,force:true});
  try{
    for(const name of closure) {
      assert.ok(permits(name,entry),'safe R34 native input path: '+name);
      const row=record.files[name], bytes=Buffer.from(row.source,'utf8');
      assert.equal(bytes.length,row.size,name);
      assert.equal(sha(bytes),row.sha256,name);
      assert.equal(gitBlob(bytes),row.gitBlob,name);
      const dest=path.join(dir,name);
      mkdirSync(path.dirname(dest),{recursive:true});
      writeFileSync(dest,bytes,{flag:'wx',mode:0o444});
    }
    // node:test is the only receiving runtime. Different test files get
    // distinct temp roots, and there is no global resolver hook or overlay.
    after(dispose);
    await import(pathToFileURL(path.join(dir,entry)).href);
  } catch(error) {
    dispose();
    throw error;
  }
}
