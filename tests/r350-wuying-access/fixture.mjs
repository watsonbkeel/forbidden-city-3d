import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';
import {gateGeom,hallGeom} from '../lib/world.mjs';

export function actualWuyingFixture(){
 const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager();
 const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
 const builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owner=new Map();
 const dispose=createWorldCleanup({cm,owners:[{label:'actualWuyingZone',value:builder},{label:'actualEnvironment',value:environment}],library:lib,restore:()=>platform.restore()});
 try{
  const gate=zone.items.find(i=>i.southGateProfile==='wuying'),front=zone.items.find(i=>i.southCourtProfile==='wuying-front');
  const build=(method,item)=>{const n=builder.kit.colliders.length,r=builder[method](item);for(const b of builder.kit.colliders.slice(n))owner.set(b,{zone:zone.id,item});return r;};
  builder.gateWidths.set(gate.name,build('buildGate',gate));build('buildHall',front);
  const neighbors=zone.items.filter(i=>i===zone.items[1]||['敬思殿','凝道殿','焕章殿','浴德堂'].includes(i.name)||i.southCourtProfile==='wuying-connector');
  for(const item of neighbors)build(item.kind==='courtWalls'?'buildCourtWalls':'buildHall',item);
  builder.kit.root.updateWorldMatrix(true,true);environment.setupGround();scene.updateMatrixWorld(true);
  // Real original finish, including its architecture metadata and actual disposal owner.
  builder.group=builder.kit.finish();cm.addColliders(builder.kit.colliders,zone.id);cm.addWalkables(builder.kit.walkables,zone.id);
  return {THREE,cm,zones:[{json:zone}],gates:[{...gateGeom(gate),zone:zone.id,item:gate}],halls:[{g:hallGeom(front),zone:zone.id,item:front}],finishedZones:[{id:zone.id,builder,group:builder.group}],ownerOf:c=>owner.get(c.mesh),environmentScene:scene,dispose,platform};
 }catch(e){dispose(e);}
}
