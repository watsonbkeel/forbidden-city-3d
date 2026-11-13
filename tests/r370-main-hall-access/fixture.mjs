import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {Environment} from '../../src/scene/Environment.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';

import {buildChuxiuCourtyard} from '../../src/scene/palace/special/ChuxiuCourtyard.js';
import {buildChengqianCourtyardGroup,bindChengqianTerraceDomain} from '../../src/scene/palace/special/ChengqianCourtyardGroup.js';
import {registerRetainedCourtyardAccess,registerChuxiuMainFinishedAccess,registerChuxiuFrontWingFinishedAccess} from '../../src/controls/RetainedCourtyardAccess.js';
import {registerStairInterfaces} from '../../src/controls/StairInterfaces.js';
import {bindChengqianEnvironmentWitness,unbindChengqianEnvironmentWitness} from '../../src/controls/ChengqianEnvironmentWitness.js';
export function fixture(id,witness=true,hooks={}){
const platform=installCpuDocument(createCanvas),lib=realTextureLibrary(),cm=new CollisionManager(),zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/'+id+'.json',import.meta.url))),builder=new ZoneBase(lib,zone),scene=new THREE.Scene(),environment=new Environment(scene,null,lib),owners=new Map();
const cleanup=createWorldCleanup({cm,owners:[{label:'mainHallWitness',value:{dispose(){(hooks.unbind??unbindChengqianEnvironmentWitness)(cm);}}},{label:'builder',value:builder},{label:'environment',value:environment}],library:lib,restore:()=>platform.restore()});
const dispose=cleanup;
try{
const indexes=id==='west-six'?[15,19,20,21,22,23,24,25,26,56,57]:[7,8,9,10,11,12,56,57];
for(const i of indexes){const item=zone.items[i],at=builder.kit.colliders.length;const result=builder['build'+item.kind[0].toUpperCase()+item.kind.slice(1)](item);if(item.kind==='gate')builder.gateWidths.set(item.name,result);for(const b of builder.kit.colliders.slice(at))owners.set(b,{zone:id,index:i,item});}
const before=builder.kit.colliders.length;
if(id==='west-six')buildChuxiuCourtyard(builder.kit,zone);
buildChengqianCourtyardGroup(builder.kit,zone);registerStairInterfaces(builder.kit,zone);bindChengqianTerraceDomain(builder.kit,zone);registerRetainedCourtyardAccess(builder.kit,zone);registerChuxiuMainFinishedAccess(builder.kit,zone);registerChuxiuFrontWingFinishedAccess(builder.kit,zone);
for(const b of builder.kit.colliders.slice(before))owners.set(b,{zone:id,index:'posthook'});
environment.setupGround();scene.updateMatrixWorld(true);if(witness)(hooks.bind??bindChengqianEnvironmentWitness)(cm,scene);hooks.capture?.(builder.kit,zone);builder.group=builder.kit.finish();cm.addColliders(builder.kit.colliders,id);const start=cm.walkables.length;cm.addWalkables(builder.kit.walkables,id);hooks.record?.(cm,builder.kit,id,start);
return {THREE,cm,zone,builder,owners,environmentScene:scene,dispose,zones:[{json:zone}],finishedZones:[{id,builder,group:builder.group,data:{group:builder.group,colliders:builder.kit.colliders,walkables:builder.kit.walkables}}],ownerOf:c=>owners.get(c.mesh),scope:'LOCAL_REAL_COURT_PLUS_APPLICABLE_POSTHOOKS_NOT_FULLWORLD',item:zone.items[id==='west-six'?23:9]};
}catch(e){dispose(e)}
}
