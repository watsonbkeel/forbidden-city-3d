import fs from'node:fs';import * as T from'three';import{CourtKit}from'../../src/scene/palace/kit.js';import{CollisionManager}from'../../src/utils/Collision.js';import{realTextureLibrary}from'../lib/r48-real-texture-library.mjs';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
export const bodies=root=>{const a=[];root.traverse(o=>{if(o.isMesh)a.push(o)});return a;};
export function fixture(api){const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-east'),cm=new CollisionManager();let built;if(api){built=api.buildLuanjiaEastWing(kit,zone);kit.root.updateMatrixWorld(true);cm.addColliders(kit.colliders,'luanjia-local');}return{lib,kit,cm,built,dispose(){kit.dispose(kit.root);lib.dispose();}};}
