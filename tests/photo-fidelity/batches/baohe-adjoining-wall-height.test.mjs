import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {CourtKit} from '../../../src/scene/palace/kit.js';import {library} from '../../lib/inner-palace-fixture.mjs';
const{ZoneBase}=await import(process.env.HALLS_INTEGRATION_ZONE??new URL('../../../src/scene/zones/ZoneBase.js',import.meta.url));
const axis=JSON.parse(fs.readFileSync(process.env.HALLS_INTEGRATION_AXIS??new URL('../../../data/zones/axis-courts.json',import.meta.url)));
for(const index of[17,19])test(`Baohe adjoining wall ${index} blocks its actually visible seven-metre body, not just ground pedestrians`,()=>{
 const kit=new CourtKit(library(),'axis-courts'),item=axis.items[index];try{
  ZoneBase.prototype.buildWall.call({zoneJson:axis,kit,gateGeometries:new Map(),resolveGaps:g=>g.map(x=>({at:x.at,w:11.2}))},item);
  assert.ok(kit.colliders.length);assert.ok(kit.colliders.every(c=>c.max.y===7),'visible upper wall cannot be ghost geometry beside raised terraces');
 }finally{kit.dispose(kit.root);}
});
for(const index of[31,37])test(`ZoneBase dispatches Baohe linked gallery ${index} and retains its identity through material merge`,()=>{
 const kit=new CourtKit(library(),'axis-courts');let merged;try{
  ZoneBase.prototype.buildCorridor.call({zoneJson:axis,kit},axis.items[index]);
  const f=kit.root.children.at(-1);assert.equal(f.userData.structure.kind,'baohe-linked-gallery');
  merged=kit.finish();assert.ok(merged.userData.architecture.some(a=>a.id===(index===31?'FC-0D3F161564':'FC-86FF7FC2AB')));
 }finally{kit.dispose(merged??kit.root);}
});
