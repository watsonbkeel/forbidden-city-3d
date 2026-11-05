import fs from'node:fs';import{CourtKit}from'../../src/scene/palace/kit.js';import{library}from'../lib/inner-palace-fixture.mjs';import{buildXiefangHillPavilion}from'../../src/scene/palace/special/XiefangHillPavilion.js';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/ningshou.json',import.meta.url)));
export function fixture({build=true}={}){const kit=new CourtKit(library(),'ningshou'),result=build?buildXiefangHillPavilion(kit,structuredClone(zone)):null;return{kit,result,dispose(){kit.dispose(kit.root)}}}
export function meshes(f){const a=[];f.kit.root.traverse(o=>{if(o.isMesh)a.push(o)});return a}
export const state=f=>JSON.stringify({children:f.kit.root.children.map(x=>x.uuid),c:f.kit.colliders,w:f.kit.walkables,o:f.kit.owned.map(x=>x.uuid),map:f.kit.mapItems,rooms:f.kit.rooms,regions:f.kit.regions});

import{CollisionManager}from'../../src/utils/Collision.js';export function collision(f){const c=new CollisionManager();c.rivers=[];c.addColliders(f.kit.colliders);c.addWalkables(f.kit.walkables);return c}
