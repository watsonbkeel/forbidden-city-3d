export {Teleport} from '../r164-three-entry-navigation/fixture.mjs';
import {Teleport,zone} from '../r164-three-entry-navigation/fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library} from '../lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
export const name='遂初堂',expected=[-253.1,0,414.15000000000003];
export function fixture(Builder=ZoneBase,name='遂初堂'){const item=zone.items.find(i=>i.name===name),b=new Builder(library(),zone);b.buildHall(item);const cm=collision(b.kit),t=teleport(cm,b.kit,item);return{item,b,kit:b.kit,cm,t,dispose(){b.kit.dispose(b.kit.root)}}}
export function collision(kit){const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'ningshou');cm.addWalkables(kit.walkables,'ningshou');return cm}
export function teleport(cm,kit,item){const t=Object.create(Teleport.prototype);t.targets=new Map([[item.name,item]]);t.collisionManager=cm;t.zoneManager={getMapItems:()=>kit.mapItems,getLoadedIds:()=>['ningshou']};return t}
export function platformBox(kit){const a=[];kit.root.traverse(m=>{if(m.isMesh&&m.userData.identity==='place-ningshou-e604d58704'&&m.userData.role==='platform-base'&&m.geometry.type==='BoxGeometry')a.push(m)});if(a.length!==1)throw Error('Expected exact solid platform source');return a[0]}
export {isHandoff,withoutHandoff} from './normalize-contact.mjs';
