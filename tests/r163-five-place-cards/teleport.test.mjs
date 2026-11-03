import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {setupMap} from '../lib/map-fixture.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {buildTianyiGate} from '../../src/scene/palace/special/TianyiGate.js';
import {buildChengqianRearWing} from '../../src/scene/palace/special/ChengqianRearWings.js';
import {buildChuxiuRearWing} from '../../src/scene/palace/special/ChuxiuRearWings.js';
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
let Teleport;try{({Teleport}=await import('../../src/ui/Teleport.js'));}finally{hook.deregister();}
const {ZONES}=await import('../../data/zones/index.js');
const cases=[
  ['garden','天一门',buildTianyiGate,[.5,455.05,.5,465]],
  ['east-six','承乾宫后东配殿',buildChengqianRearWing,[-101,396.05,-111.2,396.05]],
  ['east-six','承乾宫后西配殿',buildChengqianRearWing,[-86.2,396.05,-76,396.05]],
  ['west-six','凤光室',buildChuxiuRearWing,[87.2,440.85,77,440.85]],
  ['west-six','猗兰室',buildChuxiuRearWing,[102.4,440.85,112.6,440.85]],
];
// Production constructor and landingFor stay real. No resolveLanding/isSafe/go
// call is made: this verifies target identity/geometry, not full-World safety.
for(const [zoneId,name,build,want] of cases)test(`${name}: card resolves the real registered target and unchanged approach`,async t=>{
  const s=await setupMap(t),zone=ZONES.find(z=>z.id===zoneId),item=zone.items.find(i=>i.name===name);
  const kit=new CourtKit(realTextureLibrary(),zoneId);build(kit,item,zone);t.after(()=>kit.dispose(kit.root));
  const teleport=new Teleport(s.c,{getMapItems:()=>kit.mapItems},s.cm);t.after(()=>teleport.dispose());
  const mapItem=kit.mapItems.find(i=>i.name===name),place=s.map.placeCatalog.forMapItem(mapItem,kit.mapItems);
  assert.ok(place);assert.equal(place.modelExperience.teleportTargetName,name);
  assert.equal(teleport.targets.get(place.modelExperience.teleportTargetName),item,'keep the production zone identity, not an alias or a map clone');
  const landing=teleport.landingFor(place.modelExperience.teleportTargetName);
  assert.equal(landing.name,name);
  const actual=[landing.x,landing.z,landing.lookAtX,landing.lookAtZ];
  actual.forEach((value,i)=>assert.ok(Math.abs(value-want[i])<1e-10,`${name} approach field ${i}: ${value}`));
  assert.equal(landing.distance,8);assert.equal(landing.lateral,0);
  if(place.canonicalName&&place.canonicalName!==name){
    assert.equal(teleport.targets.has(place.canonicalName),false,'source alias must not create a duplicate travel target');
    assert.throws(()=>teleport.landingFor(place.canonicalName),/未知传送目标/);
  }
  assert.deepEqual(s.teleports,[],'parsing alone must not move the player');
});
test('all five card keys resolve to different production positions',async t=>{
  const s=await setupMap(t),teleport=new Teleport(s.c,{getMapItems:()=>[]},s.cm);t.after(()=>teleport.dispose());
  const catalog=JSON.parse(readFileSync(new URL('../../data/places/zh-CN.json',import.meta.url)));
  const positions=cases.map(([,name])=>{const place=catalog.places.find(p=>p.name===name);assert.ok(place);const p=teleport.landingFor(place.modelExperience.teleportTargetName);return JSON.stringify([p.x,p.z]);});
  assert.equal(new Set(positions).size,5);
});
