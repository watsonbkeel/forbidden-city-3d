import {gateGeom} from '../lib/world.mjs';
import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';

export function fixture(index=2,hooks={}){
const id='axis-courts';const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager(),zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/'+id+'.json',import.meta.url))),builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owners=new Map();
const cleanup=createWorldCleanup({cm,owners:[{label:'builder',value:builder},{label:'environment',value:environment}],library:lib,restore:()=>platform.restore()});
const dispose=cleanup;
try{
hooks.before?.(builder,zone);
const item=zone.items[index],at=builder.kit.colliders.length,wa=builder.kit.walkables.length;
const width=builder.buildGate(item);builder.gateWidths.set(item.name,width);hooks.capture?.(builder,item,at,wa);
for(const b of builder.kit.colliders.slice(at))owners.set(b,{zone:id,index,item});
for(const i of({2:[0,4,6],3:[1,5,7],12:[13],14:[15]})[index]){const q=zone.items[i],n=builder.kit.colliders.length;const result=builder['build'+q.kind[0].toUpperCase()+q.kind.slice(1)](q);if(q.kind==='gate')builder.gateWidths.set(q.name,result);for(const b of builder.kit.colliders.slice(n))owners.set(b,{zone:id,index:i,item:q});}
environment.setupGround();scene.updateMatrixWorld(true);builder.group=builder.kit.finish();cm.addColliders(builder.kit.colliders,id);const start=cm.walkables.length;cm.addWalkables(builder.kit.walkables,id);hooks.record?.(cm,builder.kit,id,start);
return {THREE,cm,zone,builder,owners,environmentScene:scene,dispose,zones:[{json:zone}],finishedZones:[{id,builder,group:builder.group,data:{group:builder.group,colliders:builder.kit.colliders,walkables:builder.kit.walkables}}],ownerOf:c=>owners.get(c.mesh),scope:'LOCAL_FINISHED_AXIS_GATE_AND_ADJACENT_WALL_NOT_FULLWORLD',item,gate:{zone:id,item,...gateGeom(item)}};
}catch(e){dispose(e)}
}
