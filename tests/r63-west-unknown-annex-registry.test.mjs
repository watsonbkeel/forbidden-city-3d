import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {hash,indices} from './lib/r63-west-unknown-annex-fixture.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/characters/${name}.json`,import.meta.url)));
const actors=read('actors').actors,anchors=read('anchors'),surfaces=read('surfaces'),seats=read('seats'),paths=read('paths');
const zone=JSON.parse(fs.readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
test('R63 west annex read-only registry: all west actors and the named Chuxiu seat bind outside these 13 declarations',()=>{
 const selectedAnchors=anchors.filter(a=>a.zoneRef==='west-six');
 const bindings=selectedAnchors.map(a=>{
  const matches=zone.items.flatMap((item,index)=>item.name===a.building&&((a.resolver==='zone-item'&&item.kind==='hall')||(a.resolver==='zone-region'&&item.kind==='region'))?[index]:[]);
  assert.equal(matches.length,1,a.id+': unique original source binding');
  assert.equal(indices.includes(matches[0]),false,a.id+': not an unnamed target');
  return {...a,itemIndex:matches[0]};
 });
 const ids=new Set(selectedAnchors.map(a=>a.id)),selectedSeats=seats.filter(s=>s.zoneRef==='west-six');
 assert.equal(selectedSeats.length,1);assert.equal(selectedSeats[0].id,'chuxiu-west-north-kang');
 for(const s of [...surfaces,...seats,...paths].filter(s=>s.zoneRef==='west-six'))assert.ok(ids.has(s.anchorRef),s.id);
 const selectedActors=actors.filter(a=>a.zoneRef==='west-six');
 for(const actor of selectedActors){const p=actor.placement;
  if(p.anchorRef)assert.ok(ids.has(p.anchorRef),actor.id);
  for(const [ref,registry]of [['surfaceRef',surfaces],['seatRef',seats],['pathRef',paths]])if(p[ref])assert.ok(registry.some(s=>s.id===p[ref]&&s.zoneRef==='west-six'&&ids.has(s.anchorRef)),actor.id);
 }
 fs.writeFileSync('reports/r63-west-unknown-annex/registry-evidence.json',JSON.stringify({scope:'Read-only registry linkage, not instantiated full-world or 108-character acceptance.',totalActors:actors.length,westActors:selectedActors.map(a=>({id:a.id,placement:a.placement})),retainedSeats:selectedSeats,bindings,sourceHashes:Object.fromEntries(['actors','anchors','surfaces','seats','paths'].map(n=>[`${n}.json`,hash(read(n))])),conclusion:'No registered actor anchor, path, surface or seat resolves to these 13 unnamed generic furnishings. Source-backed Chuxiu seat and all actor data are unchanged.'},null,2)+'\n');
});
