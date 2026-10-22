import fs from 'node:fs';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {buildWorld,loadZoneJsons} from './world.mjs';
import {Environment} from '../../src/scene/Environment.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {library} from './inner-palace-fixture.mjs';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
export async function buildGatePatrolWorld(){
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){},createElement:t=>t==='canvas'?createCanvas(1,1):{},createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 globalThis.window={location:{search:'?zones=all'}};
 const W=await buildWorld({zones:[],statics:true,retainScene:true}),lib=library();
 const environment=new Environment(W.scene,null,lib);environment.setupGround();
 const zoneManager=new ZoneManager();for(const z of loadZoneJsons())zoneManager.register(z.json);
 zoneManager.init(W.scene,lib,W.cm,{x:-120.8,z:382});W.scene.updateMatrixWorld(true);
 return {...W,zoneManager,environment,lib};
}
