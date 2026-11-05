import fs from'node:fs';import{CourtKit}from'../../src/scene/palace/kit.js';import{library}from'../lib/inner-palace-fixture.mjs';import{buildRemainingHall,resolveRemainingProfile}from'../../src/scene/palace/special/RemainingNingshouHalls.js';import{CollisionManager}from'../../src/utils/Collision.js';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/ningshou.json',import.meta.url)));
export function fixture(){const kit=new CourtKit(library(),'ningshou'),item=zone.items.find(i=>i.name==='禊赏亭');buildRemainingHall(kit,item,resolveRemainingProfile('ningshou',item));return{kit,dispose(){kit.dispose(kit.root)}}}
export const state=f=>JSON.stringify({children:f.kit.root.children.map(x=>x.uuid),c:f.kit.colliders,w:f.kit.walkables,o:Array.prototype.map.call(f.kit.owned,x=>x.uuid),map:f.kit.mapItems,rooms:f.kit.rooms,regions:f.kit.regions});
export const meshes=f=>{const a=[];f.kit.root.traverse(m=>{if(m.isMesh&&m.userData.xuhuiGallery)a.push(m)});return a};
export function collision(f){const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);return cm}
