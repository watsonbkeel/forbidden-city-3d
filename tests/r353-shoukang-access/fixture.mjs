import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';
import {bindShoukangEntryEnvironmentWitness,unbindShoukangEntryEnvironmentWitness} from '../../src/controls/ShoukangEntryEnvironmentWitness.js';
export function actualShoukangFixture({perimeter=true}={}){
 const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager();
 const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
 const builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owner=new Map();
 const dispose=createWorldCleanup({cm,owners:[{label:'witness',value:{dispose(){unbindShoukangEntryEnvironmentWitness(cm);}}},{label:'actualShoukangZone',value:builder},{label:'actualEnvironment',value:environment}],library:lib,restore:()=>platform.restore()});
 try{
  const front=zone.items[47],gate=zone.items[45],walls=zone.items[46];
  const build=(method,item)=>{const n=builder.kit.colliders.length,r=builder[method](item);for(const b of builder.kit.colliders.slice(n))owner.set(b,{zone:zone.id,item});return r;};
  if(perimeter){builder.gateWidths.set(gate.name,build('buildGate',gate));build('buildCourtWalls',walls);}
  build('buildHall',front);builder.kit.root.updateWorldMatrix(true,true);environment.setupGround();scene.updateMatrixWorld(true);
  builder.group=builder.kit.finish();cm.addColliders(builder.kit.colliders,zone.id);cm.addWalkables(builder.kit.walkables,zone.id);bindShoukangEntryEnvironmentWitness(cm,scene);
  return {THREE,cm,zones:[{json:zone}],finishedZones:[{id:zone.id,builder,group:builder.group,data:{colliders:builder.kit.colliders,walkables:builder.kit.walkables}}],ownerOf:c=>owner.get(c.mesh),environmentScene:scene,dispose,platform};
 }catch(e){dispose(e);}
}
