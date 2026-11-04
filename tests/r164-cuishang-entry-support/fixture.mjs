export {Teleport,zone}from'../r164-three-entry-navigation/fixture.mjs';
import{zone,Teleport}from'../r164-three-entry-navigation/fixture.mjs';import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';import{library}from'../lib/inner-palace-fixture.mjs';import{CollisionManager}from'../../src/utils/Collision.js';
export const name='萃赏楼',expected=[-260.7,0,449.15000000000003];
export const isNew=c=>c.cuishangPlatformContact===true;
export function collision(kit){const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'ningshou');cm.addWalkables(kit.walkables,'ningshou');return cm}
export function fixture(Builder=ZoneBase,n=name){const item=zone.items.find(i=>i.name===n),b=new Builder(library(),zone);b.buildHall(item);const cm=collision(b.kit),t=Object.create(Teleport.prototype);t.targets=new Map([[n,item]]);t.collisionManager=cm;t.zoneManager={getMapItems:()=>b.kit.mapItems,getLoadedIds:()=>['ningshou']};const f=b.kit.root.children.find(f=>f.userData.structure?.name===n),p=f?.userData.structure;return{item,b,kit:b.kit,f,p,cm,t,dispose(){b.kit.dispose(b.kit.root)}}}
export function context(f){return{kit:f.kit,f:f.f,p:f.p}}
