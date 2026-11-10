import fs from 'node:fs';
import {T,assert,makeFixture} from './fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {Environment} from '../../src/scene/Environment.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {queryXiananContact} from '../../src/scene/palace/special/XiananContactSources.js';
export {T,assert,makeFixture,ZoneBase,Environment,CollisionManager,realTextureLibrary};
export const zoneData=()=>JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export const from=new T.Vector3(300.9,0,-245),to=new T.Vector3(300.9,0,-244.8);
export const query=(f,camera)=>queryXiananContact(f.cm,from,to,.5,camera);
export class XiananOnly extends ZoneBase{
 build(){
  const width=this.buildGate(this.zoneJson.items[30]);assert.equal(width,24.1);
  let atlasCalls=0;const atlas=this.kit.buildPlaqueAtlas;this.kit.buildPlaqueAtlas=function(){atlasCalls++;return atlas.call(this)};
  this.group=this.kit.finish();assert.equal(atlasCalls,1);
  return {group:this.group,colliders:[...this.kit.colliders],walkables:[...this.kit.walkables],regions:this.kit.regions,mapItems:this.kit.mapItems,rooms:this.kit.rooms};
 }
}
export function freshGate(f){
 const builder=new XiananOnly(f.lib,zoneData()),data=builder.build();
 f.scene.add(data.group);f.cm.addColliders(data.colliders,'xianan-only');f.cm.addWalkables(data.walkables,'xianan-only');
 return {builder,data,dispose(){builder.dispose()}};
}
export function managerFixture({transformData=null}={}){
 const previousWindow=globalThis.window;globalThis.window={location:{search:''}};
 const scene=new T.Scene(),lib=realTextureLibrary(),environment=new Environment(scene,null,lib),cm=new CollisionManager();environment.setupGround();
 const manager=new ZoneManager({reuseInactive:true});let builds=0;
 class CountedXianan extends XiananOnly {build(){builds++;const data=super.build();transformData?.(data);return data}}
 manager.register(zoneData(),CountedXianan);
 // Ordinary dependencies only. No fabricated admitted/cache/prebuilt entry.
 manager.scene=scene;manager.library=lib;manager.collisionManager=cm;manager.prebuilt=new Map();manager.silhouettes=new Map();
 const f={scene,lib,environment,cm,manager,get builds(){return builds},dispose(){manager.onLoad=null;manager.onUnload=null;manager.lifecycleListeners.clear();manager.dispose();cm.clear();environment.dispose();lib.dispose();globalThis.window=previousWindow;}};
 return f;
}
export function rejectedAdmission(run){try{run();return false}catch(error){if(error.code!=='XIANAN_UNTRUSTED_ADMISSION')throw error;return true}}
