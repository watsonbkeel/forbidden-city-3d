import fs from 'node:fs';
import * as THREE from 'three';
import {createRequire} from 'node:module';
import {createDOM} from '../lib/ui-dom.mjs';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {Environment} from '../../src/scene/Environment.js';
import {CollisionManager} from '../../src/utils/Collision.js';
export async function buildWestWorld(){
 const dom=createDOM(),create=dom.document.createElement,{createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
 dom.document.createElement=t=>t==='canvas'?createCanvas(1,1):create(t);dom.document.createElementNS=()=>({addEventListener(){},removeEventListener(){}});dom.document.hidden=false;dom.document.body.ownerDocument=dom.document;
 Object.assign(dom.window,{location:{search:'?zones=all'},innerWidth:1280,innerHeight:720});Object.assign(globalThis,{document:dom.document,window:dom.window});Object.defineProperty(globalThis,'navigator',{value:{userAgent:'CPU Chuxiu probe',maxTouchPoints:0},configurable:true});
 const {library,dispose}=createActualLibrary(),scene=new THREE.Scene(),cm=new CollisionManager(),zoneManager=new ZoneManager({reuseInactive:true});
 const json=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url)));
 const environment=new Environment(scene,null,library);environment.setupGround();
 zoneManager.register(json);zoneManager.init(scene,library,cm,{x:94.8,z:414.4});scene.updateMatrixWorld(true);
 return{THREE,createElement:create,dom,scene,cm,zoneManager,zones:[{json}],dispose(){zoneManager.dispose();environment.dispose();dispose();}};
}
