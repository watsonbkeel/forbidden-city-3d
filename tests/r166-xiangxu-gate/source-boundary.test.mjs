import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import fs from 'node:fs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const url=new URL('./source-boundary-core.mjs',import.meta.url),module=fs.existsSync(url)?await import(url):{};
function sample(){const old=Buffer.from('old hook\n'),now=Buffer.from('old hook\nE46 hook\n'),added=Buffer.from('new component\n'),stable=Buffer.from('stable\n');const files=new Map([['src/zone.js',{bytes:now,regular:true,mode:'100644'}],['src/new.js',{bytes:added,regular:true,mode:'100644'}],['data/old.json',{bytes:stable,regular:true,mode:'100644'}]]),baseManifestBytes=Buffer.from(JSON.stringify({scope:['src','data'],files:[{path:'src/zone.js',mode:'100644',after:sha(old)},{path:'data/old.json',mode:'100644',after:sha(stable)}]}));const manifest={schemaVersion:1,baseRuntimeManifestSha256:sha(baseManifestBytes),baseRuntimeInputCount:2,scope:['src','data'],additionalPaths:['src/new.js'],files:[{path:'src/zone.js',mode:'100644',before:sha(old),after:sha(now)},{path:'src/new.js',mode:'100644',before:null,after:sha(added)},{path:'data/old.json',mode:'100644',before:sha(stable),after:sha(stable)}],inverseEdits:{'src/zone.js':[{before:'',after:'E46 hook\n'}]}};const io={baseManifestBytes,readCurrent:p=>files.get(p),listCurrent:()=>[...files.keys()]};return{manifest,io,files,old,now};}
const create=s=>{assert.equal(typeof module.createXiangxuBoundary,'function','exact E46 source-only boundary required');return module.createXiangxuBoundary(s.manifest,s.io)};
test('only exact after bytes inverse to fixed before bytes and preserve the Buffer/string convention',()=>{const s=sample(),b=create(s);assert.deepEqual(b.stripXiangxuDelta('src/zone.js',s.now),s.old);assert.equal(b.stripXiangxuDelta('src/zone.js',s.now.toString()),s.old.toString());assert.equal(b.stripXiangxuDelta('src/new.js',s.files.get('src/new.js').bytes),null);assert.deepEqual(b.verifyCurrent(),{files:3,modified:1,added:1});});
test('unknown input additions, omissions, duplicate paths, modes and nonregular files fail closed',()=>{for(const change of[s=>s.files.set('src/ignored.js',{bytes:Buffer.from('ignored'),mode:'100644',regular:true}),s=>s.files.delete('data/old.json'),s=>s.io.listCurrent=()=>['src/zone.js','src/new.js','data/old.json','src/new.js'],s=>s.files.get('src/new.js').mode='100755',s=>s.files.get('src/new.js').regular=false]){const s=sample();change(s);assert.throws(()=>create(s).verifyCurrent());}});
test('no current disk cache hides later stable, modified or new-file byte drift',()=>{for(const p of['src/zone.js','src/new.js','data/old.json']){const s=sample(),b=create(s);b.verifyCurrent();s.files.get(p).bytes=Buffer.concat([s.files.get(p).bytes,Buffer.from('drift')]);assert.throws(()=>b.verifyCurrent(),/hash|bytes/i);}});
test('truncated, prior, swapped and repeated-patch payloads cannot enter the E46 inverse',()=>{const s=sample(),b=create(s);for(const value of[s.old,s.now.subarray(1),Buffer.concat([s.now,Buffer.from('E46 hook\n')]),s.files.get('src/new.js').bytes])assert.throws(()=>b.stripXiangxuDelta('src/zone.js',value));});
test('malformed manifest, wrong baseline and wrong reconstructed before digest are rejected',()=>{for(const mutate of[s=>s.manifest.baseRuntimeManifestSha256='0'.repeat(64),s=>s.manifest.files[0].before='1'.repeat(64),s=>s.manifest.files.push({...s.manifest.files[0]}),s=>s.manifest.files[0].path='../src/zone.js',s=>s.manifest.additionalPaths.push('src/unknown.js'),s=>s.manifest.inverseEdits['src/zone.js'][0].before='unproved old line']){const s=sample();mutate(s);assert.throws(()=>create(s).verifyCurrent());}});
test('historical enumeration strips only the approved new path after validating all actual inputs',()=>{const s=sample(),b=create(s);assert.deepEqual(b.historicalPaths([...s.files.keys()]),['src/zone.js','data/old.json']);assert.throws(()=>b.historicalPaths(['src/unknown.js']));s.files.get('src/new.js').bytes=Buffer.from('drift');assert.throws(()=>b.historicalPaths([...s.files.keys()]));});
test('unaffected comparison bytes stay transparent but the complete candidate guard detects their drift',()=>{const s=sample(),b=create(s),drift=Buffer.from('unrelated drift');assert.equal(b.stripXiangxuDelta('src/unaffected.js',drift),drift);s.files.get('data/old.json').bytes=drift;assert.throws(()=>b.verifyCurrent());});

// Independent byte identities of the user-inherited release, not JSON-semantic aliases.
const RELEASE_OLD=Buffer.from('{\n  "release": "R164"\n}\n'),RELEASE_CURRENT=Buffer.from('{\n  "release": "R166"\n}\n');
const RELEASE_OLD_SHA='1c3ad73e872554b0c056a5e6a3c9d976d4ef2b5e9e2a9476864755069ddcd8fd',RELEASE_CURRENT_SHA='1c1f076bc91dac529e30b67ba51dd8d85b8658c464356f4d5aea8604e15c0825';
function releaseSample(){
 const actual=JSON.parse(fs.readFileSync(new URL('./source-delta.json',import.meta.url))),row=structuredClone(actual.files.find(r=>r.path==='release.json'));
 const baseManifestBytes=Buffer.from(JSON.stringify({scope:['release.json'],files:[{path:'release.json',mode:'100644',after:RELEASE_OLD_SHA}]}));
 const files=new Map([['release.json',{bytes:Buffer.from(RELEASE_CURRENT),regular:true,mode:'100644'}]]);
 const inverseEdits=actual.inverseEdits['release.json']?{'release.json':structuredClone(actual.inverseEdits['release.json'])}:{};
 const manifest={schemaVersion:1,baseRuntimeManifestSha256:sha(baseManifestBytes),baseRuntimeInputCount:1,scope:['release.json'],additionalPaths:[],files:[row],inverseEdits};
 return{manifest,files,io:{baseManifestBytes,readCurrent:p=>files.get(p),listCurrent:()=>[...files.keys()]}};
}
test('release inverse is the exact complete R166 to R164 file and preserves Buffer/string results',()=>{
 const s=releaseSample(),b=create(s),blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 assert.equal(RELEASE_CURRENT.length,24);assert.equal(RELEASE_OLD.length,24);assert.equal(sha(RELEASE_CURRENT),RELEASE_CURRENT_SHA);assert.equal(sha(RELEASE_OLD),RELEASE_OLD_SHA);
 assert.equal(blob(RELEASE_CURRENT),'128e05e041b99bbe4cd88b4b67fc4322463a1ae7');assert.equal(blob(RELEASE_OLD),'4b248db1e9a9d58b75b3309db024b0890b5e5c1d');
 assert.deepEqual(s.manifest.files,[{path:'release.json',mode:'100644',before:RELEASE_OLD_SHA,after:RELEASE_CURRENT_SHA}]);
 assert.deepEqual(s.manifest.inverseEdits,{'release.json':[{before:RELEASE_OLD.toString(),after:RELEASE_CURRENT.toString()}]});
 assert.deepEqual(b.verifyCurrent(),{files:1,modified:1,added:0});
 assert.deepEqual(b.stripXiangxuDelta('release.json',RELEASE_CURRENT),RELEASE_OLD);
 assert.equal(b.stripXiangxuDelta('release.json',RELEASE_CURRENT.toString()),RELEASE_OLD.toString());
 assert.throws(()=>b.stripXiangxuDelta('release.json',b.stripXiangxuDelta('release.json',RELEASE_CURRENT)));
 assert.deepEqual(s.files.get('release.json').bytes,RELEASE_CURRENT);
});
test('release source comparison rejects old, malformed and same-semantic alternate current bytes',()=>{
 const b=create(releaseSample());
 const invalid=[RELEASE_OLD,RELEASE_CURRENT.subarray(0,-1),Buffer.concat([Buffer.from([239,187,191]),RELEASE_CURRENT]),Buffer.from(RELEASE_CURRENT.toString().replace('  ',' ')),Buffer.from('{"release":"R166"}\n'),Buffer.from('{\n  "release": "R166", "extra": true\n}\n'),Buffer.from(RELEASE_CURRENT.toString().replace('R166','R167')),Buffer.from(RELEASE_CURRENT.toString().replace('R166','R166-test')),Buffer.concat([RELEASE_CURRENT,RELEASE_CURRENT]),Buffer.from('{"release":"R166","release":"R166"}\n')];
 for(const bytes of invalid)assert.throws(()=>b.stripXiangxuDelta('release.json',bytes),/exact E46 after bytes/);
});
test('release manifest, mode, path and later physical drift cannot bypass the exact boundary',()=>{
 const changes=[
  s=>s.manifest.inverseEdits['release.json'][0].before=RELEASE_OLD.toString().replace('R164','R165'),
  s=>s.manifest.files[0].before='0'.repeat(64),
  s=>s.manifest.files[0].after='0'.repeat(64),
  s=>s.manifest.inverseEdits['release.json'][0].after=RELEASE_CURRENT.toString().trim(),
  s=>s.files.get('release.json').mode='100755',
  s=>s.manifest.files[0].mode='100755',
  s=>s.manifest.files[0].path='release-copy.json',
  s=>s.files.set('release-copy.json',{...s.files.get('release.json')}),
  s=>s.files.delete('release.json')
 ];
 // Require the registered release contract before using it for negative controls.
 const valid=releaseSample();assert.deepEqual(create(valid).verifyCurrent(),{files:1,modified:1,added:0});
 for(const change of changes){const s=releaseSample();change(s);assert.throws(()=>create(s).verifyCurrent());}
 const s=releaseSample(),b=create(s);b.verifyCurrent();s.files.get('release.json').bytes=Buffer.from(RELEASE_OLD);assert.throws(()=>b.verifyCurrent(),/exact candidate hash/);
});
