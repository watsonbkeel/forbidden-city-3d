import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{baseline,restoreR6PlaceCatalog,restoreR6PlaceSource}from'./lib/r6-place-retention.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');const raw=read('data/places/zh-CN.json');
test('145-card/source addition restores the exact previous fourteen-card catalog',()=>{const d=JSON.parse(restoreR6PlaceCatalog(raw));assert.equal(d.places.length,14);assert.equal(d.sources.length,29);});
for(const [label,mutate]of [['old card',d=>d.places[0].summary.text+='x'],['new card',d=>d.places[14].summary.text+='x'],['old source',d=>d.sources[0].title+='x'],['new source',d=>d.sources[29].title+='x'],['missing card',d=>d.places.pop()],['metadata',d=>d.reviewedAt='2026-10-19']])test(`R6 catalog retains failure on ${label} edit`,()=>{const d=JSON.parse(raw);mutate(d);assert.throws(()=>restoreR6PlaceCatalog(JSON.stringify(d,null,2)+'\n'));});
for(const [path,hunks]of Object.entries(baseline.sourceDeltas)){
 test(`${path}: R6 UI delta restores its real source baseline`,()=>restoreR6PlaceSource(path,read(path)));
 test(`${path}: rejects unrelated R6 edit`,()=>assert.throws(()=>restoreR6PlaceSource(path,read(path)+'\n')));
 for(const [i,h]of hunks.entries())test(`${path}: R6 hunk ${i} cannot disappear`,()=>assert.throws(()=>restoreR6PlaceSource(path,read(path).replace(h.after,h.before))));
}
