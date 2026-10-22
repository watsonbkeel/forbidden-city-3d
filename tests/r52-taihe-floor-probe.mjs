import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildR52World} from './lib/r52-world.mjs';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {CharacterWorldAdapter} from '../src/scene/characters/CharacterWorldAdapter.js';
const W=await buildR52World(),registry=structuredClone(CHARACTER_REGISTRY);
const additions=JSON.parse(fs.readFileSync('reports/r52-population/candidates/taihe-14.json')).actors;for(const a of additions)if(!registry.actors.some(b=>b.id===a.id))registry.actors.push(a);
const baselineFloor=JSON.parse(JSON.parse(fs.readFileSync('tests/fixtures/r52-r51-character-baseline.json','utf8')).files.find(f=>f.path==='data/characters/surfaces.json').originalText).find(s=>s.id==='taihe-hall-floor');
const rows=[];
for(const mode of ['registered-walkable','rendered-floor']){
 const floor=registry.surfaces.find(s=>s.id==='taihe-hall-floor');Object.assign(floor,baselineFloor);if(mode==='rendered-floor'){floor.kind='ground';floor.expectedHeightMeters=9.9675;floor.source='Actual visible Taihe floor tile geometry, not lower collision datum';}
 const adapter=new CharacterWorldAdapter({scene:W.scene,collisionManager:W.cm,zoneManager:W.zoneManager,registry});
 for(const actor of registry.actors.filter(a=>a.id.startsWith('taihe-attendant')||additions.some(b=>b.id===a.id))){
  const binding=adapter.resolve(actor),position=binding.position??[0,0,0];
  const actual=binding.status==='ready'?adapter.supportAt(position,position[1]+.03,.031,{zoneRef:actor.zoneRef,renderedOnly:true}):null;
  rows.push({mode,id:actor.id,binding,renderedSurfaceAtFeet:actual,verticalGap:actual?.position?position[1]-actual.position[1]:null});
  console.log(mode,actor.id,binding.status,binding.reason,position,actual?.position,actual?.kind);
 }
 adapter.dispose();
}
fs.writeFileSync(process.env.R52_FLOOR_PROBE_OUTPUT??'/tmp/r52-current-taihe-floor-probe.json',JSON.stringify({kind:'CPU actual full scene support probe; two algorithms compare visible floor to the registered lower collision plane. Not a GPU rendering claim.',rows},null,2)+'\n');W.dispose();
