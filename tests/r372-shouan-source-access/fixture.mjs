import {bindShouanEntryEnvironmentWitness,unbindShouanEntryEnvironmentWitness} from '../../src/controls/ShouanEntryEnvironmentWitness.js';
import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';

export function fixture(witness=true,hooks={}){
const id='outer-west';const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager(),zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/'+id+'.json',import.meta.url))),builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owners=new Map();
const cleanup=createWorldCleanup({cm,owners:[{label:'shouanWitness',value:{dispose(){(hooks.unbind??unbindShouanEntryEnvironmentWitness)(cm);}}},{label:'builder',value:builder},{label:'environment',value:environment}],library:lib,restore:()=>platform.restore()});
const dispose=cleanup;
try{
const item=zone.items[50],at=builder.kit.colliders.length,wa=builder.kit.walkables.length;
const width=builder.buildGate(item);builder.gateWidths.set(item.name,width);hooks.capture?.(builder,item,at,wa);
for(const b of builder.kit.colliders.slice(at))owners.set(b,{zone:id,index:50,item});
for(const i of[51,52,53]){const q=zone.items[i],n=builder.kit.colliders.length;builder['build'+q.kind[0].toUpperCase()+q.kind.slice(1)](q);for(const b of builder.kit.colliders.slice(n))owners.set(b,{zone:id,index:i,item:q});}
environment.setupGround();scene.updateMatrixWorld(true);if(witness)(hooks.bind??bindShouanEntryEnvironmentWitness)(cm,scene);builder.group=builder.kit.finish();cm.addColliders(builder.kit.colliders,id);const start=cm.walkables.length;cm.addWalkables(builder.kit.walkables,id);hooks.record?.(cm,builder.kit,id,start);
return {THREE,cm,zone,builder,owners,environmentScene:scene,dispose,zones:[{json:zone}],finishedZones:[{id,builder,group:builder.group,data:{group:builder.group,colliders:builder.kit.colliders,walkables:builder.kit.walkables}}],ownerOf:c=>owners.get(c.mesh),scope:'LOCAL_FINISHED_SHOUAN_GATE_AND_ITEMS51_52_53_NOT_FULLWORLD',item,gate:{zone:id,item,x:277,z:362,dir:[0,1],half:7.7,platformY:.36}};
}catch(e){dispose(e)}
}
