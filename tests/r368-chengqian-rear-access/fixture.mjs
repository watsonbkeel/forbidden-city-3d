import {captureChengqianRearSource,recordChengqianRearWalkables} from '../lib/chengqian-rear-current-access.mjs';
import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';

export function actualRearPair(){
 const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager();
 const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/east-six.json',import.meta.url)));
 const builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owners=new Map(),rooms=[];
 const dispose=createWorldCleanup({cm,owners:[{label:'coupledRearCourt',value:builder},{label:'environment',value:environment}],library:lib,restore:()=>platform.restore()});
 try{
  const build=(method,index)=>{const item=zone.items[index],at=builder.kit.colliders.length,result=builder[method](item);for(const b of builder.kit.colliders.slice(at))owners.set(b,{zone:zone.id,index,item});return result;};
  builder.gateWidths.set(zone.items[7].name,build('buildGate',7));build('buildCourtWalls',8);build('buildHall',10);
  for(const index of [56,57]){
   const w0=builder.kit.walkables.length,{f}=build('buildHall',index);f.updateWorldMatrix(true,true);
   const transform=f.matrixWorld.clone(),item=zone.items[index],owned=builder.kit.colliders.filter(b=>owners.get(b)?.index===index);
   rooms.push({index,item,transform,owned,walkables:builder.kit.walkables.slice(w0),id:`chengqian-rear-${item.rearWing}`,world:(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(transform)});
  }
  environment.setupGround();scene.updateMatrixWorld(true);captureChengqianRearSource(builder.kit);builder.group=builder.kit.finish();cm.addColliders(builder.kit.colliders,zone.id);const ws=cm.walkables.length;cm.addWalkables(builder.kit.walkables,zone.id);recordChengqianRearWalkables(cm,builder.kit.walkables,zone.id,ws);
  const data={group:builder.group,colliders:builder.kit.colliders,walkables:builder.kit.walkables};
  return {THREE,cm,zone,builder,rooms,owners,zones:[{json:zone}],finishedZones:[{id:zone.id,builder,group:builder.group,data}],ownerOf:c=>owners.get(c.mesh),environmentScene:scene,dispose,platform,scope:'ACTUAL_PAIR_PLUS_ORIGINAL_ITEMS7_8_10_NOT_FULLWORLD_OR_ALL_POSTHOOKS'};
 }catch(e){dispose(e);}
}
