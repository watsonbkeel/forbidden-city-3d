import{registerHooks}from'node:module';registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
export const{Teleport}=await import('../../src/ui/Teleport.js');
import fs from'node:fs';import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';import{library}from'../lib/inner-palace-fixture.mjs';import{CollisionManager}from'../../src/utils/Collision.js';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/ningshou.json',import.meta.url))),names=['阅是楼','佛日楼','倦勤斋'];
export function fixture(name){const item=zone.items.find(i=>i.name===name),b=new ZoneBase(library(),zone);b.buildHall(item);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders,'ningshou');cm.addWalkables(b.kit.walkables,'ningshou');const t=Object.create(Teleport.prototype);t.targets=new Map([[name,item]]);t.collisionManager=cm;t.zoneManager={getMapItems:()=>b.kit.mapItems,getLoadedIds:()=>['ningshou']};return{item,b,kit:b.kit,cm,t,dispose(){b.kit.dispose(b.kit.root)}}}

export const expected=[[-334.5,0,382.25],[-319.8,0,506.09999999999997],[-259.6,0,506.8]];
