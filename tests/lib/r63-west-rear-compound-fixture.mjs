// Live west-six zone only, never the entire palace or an archived runtime.
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import './inner-palace-fixture.mjs';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';

export function compoundFixture(){
 const data=JSON.parse(readFileSync(new URL('../../data/zones/west-six.json',import.meta.url)));
 const lib=realTextureLibrary(),builder=new ZoneBase(lib,data),built=builder.build();
 const scene=new THREE.Scene(),cm=new CollisionManager();
 scene.add(built.group);scene.updateMatrixWorld(true);cm.rivers=[];
 cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
 return {THREE,scene,cm,builder,built,lib,dispose(){builder.dispose();lib.dispose();}};
}
