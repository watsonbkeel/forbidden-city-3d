import '../../tests/lib/inner-palace-fixture.mjs';import * as T from 'three';import fs from 'node:fs';import {CourtKit} from '../../src/scene/palace/kit.js';import {realTextureLibrary} from '../../tests/lib/r48-real-texture-library.mjs';import {CollisionManager} from '../../src/utils/Collision.js';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
export function blank(){const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-east'),cm=new CollisionManager();cm.rivers=[];return {THREE:T,lib,kit,cm,dispose(){kit.dispose(kit.root);lib.dispose();}};}
export const bodies=root=>{const ms=[];root.traverse(m=>{if(m.isMesh)ms.push(m)});return ms;};
export function install(f,api){f.built=api.buildNansansuoEastMiddleHall(f.kit,zone);f.kit.root.updateMatrixWorld(true);f.cm.addColliders(f.kit.colliders,'nansansuo-middle');f.cm.addWalkables(f.kit.walkables,'nansansuo-middle');return f;}
