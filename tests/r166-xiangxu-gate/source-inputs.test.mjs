import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {verifyXiangxuRuntimeBoundary,stripXiangxuDelta,readXiangxuHistoricalSource} from './source-boundary.mjs';
import manifest from './source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
test('the physical candidate has exactly original993 plus E46 component, with only E46 and the exact inherited R166 release modifications',()=>{assert.deepEqual(verifyXiangxuRuntimeBoundary(),{files:994,modified:3,added:1});assert.deepEqual(manifest.additionalPaths,['src/scene/palace/special/XiangxuGlazedGate.js']);assert.deepEqual(manifest.files.filter(r=>r.before!==null&&r.before!==r.after).map(r=>r.path),['data/places/supplemental.json','release.json','src/scene/zones/ZoneBase.js']);});
test('only explicit source reads inverse E46; physical ZoneBase and dynamic behavior imports remain candidate code',async()=>{const file=new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),now=fs.readFileSync(file),prior=readXiangxuHistoricalSource(file);assert.match(now.toString(),/buildXiangxuGlazedGate\(this\.kit,this\.zoneJson\)/);assert.doesNotMatch(prior.toString(),/XiangxuGlazedGate/);assert.deepEqual(fs.readFileSync(file),now);assert.equal(sha(prior),'1338238d41d89369289b6f0373ebfd9a08380c16335f0f1ab03a9c2a2a92b002');const {TourPlaceCatalog}=await import('../../src/ui/TourPlaceCatalog.js');assert.equal(new TourPlaceCatalog().allPlaces.length,287);assert.ok(new TourPlaceCatalog().get('supp-fc-4d8561ae5d'));});
test('exact inverse recovers the original 122-card file including all original bytes and metadata',()=>{const current=fs.readFileSync(new URL('../../data/places/supplemental.json',import.meta.url)),original=stripXiangxuDelta('data/places/supplemental.json',current);assert.equal(sha(original),'2bf1f9940598182c23abd26459346e6f18b5b8872118681f10192c824a8b99e4');const a=JSON.parse(original),b=JSON.parse(current);assert.equal(a.records.length,122);assert.deepEqual(b.records.filter(r=>r.id!=='supp-fc-4d8561ae5d'),a.records);assert.deepEqual(b.records.filter(r=>!a.records.some(p=>p.id===r.id)).map(r=>r.id),['supp-fc-4d8561ae5d']);});

test('the exact inherited R166 is physical/build truth while source-only reads recover R164 without writing',async()=>{
 const path=new URL('../../release.json',import.meta.url),current=Buffer.from('{\n  "release": "R166"\n}\n'),prior=Buffer.from('{\n  "release": "R164"\n}\n');
 assert.deepEqual(fs.readFileSync(path),current);
 assert.equal(sha(current),'1c1f076bc91dac529e30b67ba51dd8d85b8658c464356f4d5aea8604e15c0825');
 assert.deepEqual(readXiangxuHistoricalSource(path),prior);
 const {stripBilingualDelta}=await import('../bilingual/source-boundary.mjs');
 assert.deepEqual(stripBilingualDelta('release.json',readXiangxuHistoricalSource(path)),prior);
 assert.equal(sha(prior),'1c3ad73e872554b0c056a5e6a3c9d976d4ef2b5e9e2a9476864755069ddcd8fd');
 assert.deepEqual(fs.readFileSync(path),current);
 const {createBuildInfo}=await import('../../scripts/build-identity.mjs');
 const info=createBuildInfo({base:'/forbidden-city-3d/'});
 assert.equal(info.release,'R166');assert.equal(info.sourceFingerprint,'10cacb498fc2fcea9c98490a6cec5759f7ddd8ab1523d53e2130512ce3e3f5c1');assert.equal(info.buildId,'R166-28971b5e7f23');
 assert.deepEqual(fs.readFileSync(path),current);
});
