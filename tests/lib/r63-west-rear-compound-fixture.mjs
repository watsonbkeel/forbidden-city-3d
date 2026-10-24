// Full west-six zone only, never the entire palace. Frozen R62 or current R63.
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ZoneBase as BaselineZoneBase} from './r63-west-rear-south-window-fixture.mjs';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {applyWestRearSouthWindows} from '../../src/scene/palace/special/WestRearSouthWindows.js';
const sourceRoot=process.env.R63_WEST_COMPOUND_SOURCE_ROOT;
const {ZoneBase:CurrentZoneBase}=await import(sourceRoot?pathToFileURL(resolve(sourceRoot,'src/scene/zones/ZoneBase.js')).href:new URL('../../src/scene/zones/ZoneBase.js',import.meta.url).href);
class CandidateZoneBase extends CurrentZoneBase{
 buildHall(item){const b=super.buildHall(item),index=this.zoneJson.items.indexOf(item);if([24,47].includes(index)&&!b.f.userData.structure.westRearSouthWindows){b.f.updateWorldMatrix(true,true);if(!applyWestRearSouthWindows(this.kit,b.f,item,index))throw Error('standalone candidate window hook rejected');}return b;}
}
export function compoundFixture(candidate=false){const data=JSON.parse(readFileSync(new URL('../../data/zones/west-six.json',import.meta.url))),lib=realTextureLibrary(),builder=new(candidate?CandidateZoneBase:BaselineZoneBase)(lib,data),built=builder.build(),scene=new THREE.Scene(),cm=new CollisionManager();scene.add(built.group);scene.updateMatrixWorld(true);cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);return{THREE,scene,cm,builder,built,lib,dispose(){builder.dispose();lib.dispose();}};}
