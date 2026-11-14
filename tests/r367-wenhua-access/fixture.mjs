import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';
import {gateGeom} from '../lib/world.mjs';

export function actualWenhuaFixture(){
 const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager();
 const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
 const builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owner=new Map();
 const dispose=createWorldCleanup({cm,owners:[{label:'actualWenhuaZone',value:builder},{label:'actualEnvironment',value:environment}],library:lib,restore:()=>platform.restore()});
 try{
  const gate=zone.items[0],walls=zone.items[1];
  const build=(method,item)=>{const n=builder.kit.colliders.length,r=builder[method](item);for(const b of builder.kit.colliders.slice(n))owner.set(b,{zone:zone.id,item});return r;};
  builder.gateWidths.set(gate.name,build('buildGate',gate));build('buildCourtWalls',walls);
  environment.setupGround();scene.updateMatrixWorld(true);builder.group=builder.kit.finish();
  const data={group:builder.group,colliders:builder.kit.colliders,walkables:builder.kit.walkables};cm.addColliders(data.colliders,zone.id);cm.addWalkables(data.walkables,zone.id);
  return {THREE,cm,zones:[{json:zone}],gates:[{...gateGeom(gate),zone:zone.id,item:gate}],finishedZones:[{id:zone.id,builder,group:builder.group,data}],ownerOf:c=>owner.get(c.mesh),environmentScene:scene,dispose,platform};
 }catch(e){dispose(e);}
}
