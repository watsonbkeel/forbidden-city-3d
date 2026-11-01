import '../../../lib/inner-palace-fixture.mjs';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ZoneBase} from '../../../../src/scene/zones/ZoneBase.js';
import {realTextureLibrary} from '../../../lib/r48-real-texture-library.mjs';
import {finishWenyuanUpperSeat} from '../../../../src/scene/palace/special/WenyuanUpperSeat.js';
import {CollisionManager} from '../../../../src/utils/Collision.js';
export const url=new URL('../../../../src/scene/palace/special/WenyuanSouthVeranda.js',import.meta.url);
export const module=existsSync(url)?await import(url):null;
export const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const record=m=>({name:m.name,position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),material:m.material?.name??null,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)])),index:m.geometry.index?Array.from(m.geometry.index.array):null});
export function fixture(apply=true){const data=JSON.parse(readFileSync(new URL('../../../../data/zones/outer-east.json',import.meta.url))),lib=realTextureLibrary(),b=new ZoneBase(lib,data),item=data.items.find(i=>i.name==='文渊阁'),r=b.buildHall(item);finishWenyuanUpperSeat(b.kit);if(apply&&module)module.applyWenyuanSouthVeranda(b.kit,r.f);b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return{b,kit:b.kit,frame:r.f,item,lib,cm,dispose:()=>{b.kit.dispose(b.kit.root);lib.dispose()}};}
