import * as THREE from 'three';
import { library } from './inner-palace-fixture.mjs';
import { loadZoneJsons } from './world.mjs';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { Enclosure } from '../../src/scene/Enclosure.js';
import { GardenBuilder } from '../../src/scene/GardenBuilder.js';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { createPalaceFlightEnvelope } from '../../src/scene/flight/FlightEnvelope.js';
export function flightWorld(){
  const lib=library();lib.owns=()=>false;lib.color=()=>null;lib.normal=()=>null;
  const scene=new THREE.Scene(),palaceBuilder=new PalaceBuilder(scene,lib),cm=new CollisionManager();palaceBuilder.buildAll(PALACE_LAYOUT);
  const enclosure=new Enclosure(scene,lib).build(),garden=new GardenBuilder(scene,lib).build(PALACE_LAYOUT.find(p=>p.type==='garden'));
  const zoneManager={zones:new Map(),loaded:new Map(),prebuilt:new Map()};
  cm.addColliders(palaceBuilder.colliders);cm.addWalkables(palaceBuilder.walkables);cm.addColliders(enclosure.colliders);cm.addColliders(garden.colliders);cm.addWalkables(garden.walkables);
  for(const{json}of loadZoneJsons()){const builder=new ZoneBase(lib,json),data=builder.build();zoneManager.zones.set(json.id,json);zoneManager.prebuilt.set(json.id,{builder,data});cm.addColliders(data.colliders,json.id);cm.addWalkables(data.walkables,json.id);}
  const begin=performance.now(),envelope=createPalaceFlightEnvelope({palaceBuilder,enclosure,garden,zoneManager,layout:PALACE_LAYOUT});
  return {envelope,cm,scene,buildMs:performance.now()-begin,palaceBuilder,enclosure,garden,zoneManager};
}
