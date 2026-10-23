// CPU functional scene fixture. Real production geometry, merging, colliders and
// ZoneManager; CPU-only materials do not reproduce runtime textures or GPU work.
import * as THREE from 'three';
import {registerHooks,createRequire} from 'node:module';
import {createDOM} from './ui-dom.mjs';
import {gateGeom,hallGeom} from './world.mjs';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {Environment} from '../../src/scene/Environment.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {CollisionManager} from '../../src/utils/Collision.js';

export async function buildR52World({loadAll=true,initialPosition={x:0,z:-494},createLibrary=null}={}){
 const dom=createDOM(),create=dom.document.createElement,{createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
 dom.document.createElement=type=>type==='canvas'?createCanvas(1,1):create(type);
 dom.document.createElementNS=()=>({addEventListener(){},removeEventListener(){}});
 dom.document.hidden=false;dom.document.body.ownerDocument=dom.document;
 Object.assign(dom.window,{location:{search:loadAll?'?zones=all':''},innerWidth:1280,innerHeight:720});
 const previous={document:globalThis.document,window:globalThis.window,navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator')};
 const restoreDOM=()=>{
   if(previous.document===undefined)delete globalThis.document;else globalThis.document=previous.document;
   if(previous.window===undefined)delete globalThis.window;else globalThis.window=previous.window;
   if(previous.navigator)Object.defineProperty(globalThis,'navigator',previous.navigator);else delete globalThis.navigator;
 };
 Object.assign(globalThis,{document:dom.document,window:dom.window});
 Object.defineProperty(globalThis,'navigator',{value:{userAgent:'CPU functional R52 fixture',maxTouchPoints:0},configurable:true});
 // Native Node's loader needs JSON attributes for the unchanged browser import
 // index. Production sources themselves are not rewritten for this QA fixture.
 const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
 let ZONES;try{({ZONES}=await import('../../data/zones/index.js'));}finally{hook.deregister();}
 const scene=new THREE.Scene(),cm=new CollisionManager(),materials=new Map();
 const cpuLibrary={material(name,options={}){const key=name+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({name,...options}));return materials.get(key);},tileSize:()=>1,aspect:()=>1,color:()=>null,normal:()=>null,owns:material=>[...materials.values()].includes(material)};
 // Optional QA-only decoration: a caller may load a narrowly named real asset
 // through its production loader while leaving all other CPU materials intact.
 // No automatic fallback can masquerade as a successfully loaded real library.
 let libraryResources=null;
 try{libraryResources=createLibrary?await createLibrary(cpuLibrary):null;
  if(createLibrary&&(!libraryResources?.library||typeof libraryResources.library.material!=='function'))throw new TypeError('createLibrary must return { library, dispose?, evidence? }');
 }catch(error){try{libraryResources?.dispose?.();}finally{restoreDOM();}throw error;}
 const library=libraryResources?.library??cpuLibrary;
 const environment=new Environment(scene,null,library);environment.setupGround();
 const palaceBuilder=new PalaceBuilder(scene,library);palaceBuilder.buildAll(PALACE_LAYOUT);
 cm.addColliders(palaceBuilder.getColliders(),'static');cm.addWalkables(palaceBuilder.getWalkables(),'static');
 const enclosure=new Enclosure(scene,library).build();cm.addColliders(enclosure.getColliders(),'static');
 const garden=new GardenBuilder(scene,library).build(PALACE_LAYOUT.find(p=>p.type==='garden'));cm.addColliders(garden.getColliders(),'static');cm.addWalkables(garden.getWalkables(),'static');
 const zoneManager=new ZoneManager();for(const zone of ZONES)zoneManager.register(zone);zoneManager.init(scene,library,cm,initialPosition);scene.updateMatrixWorld(true);
 const zones=ZONES.map(json=>({json})),gates=[],halls=[];
 for(const {json}of zones)for(const item of json.items){if(['gate','cityGate'].includes(item.kind))gates.push({zone:json.id,item,...gateGeom(item)});if(item.kind==='hall')halls.push({zone:json.id,item,g:hallGeom(item)});}
 return{THREE,scene,cm,zoneManager,palaceBuilder,enclosure,garden,environment,library,libraryEvidence:libraryResources?.evidence??null,dom,zones,gates,halls,
  rooms:zoneManager.allRooms,mapItems:zoneManager.allMapItems,terraceProfiles:palaceBuilder.terraceProfiles,taiheSouthTiers:palaceBuilder.taiheSouthTiers,baoheNorthTiers:palaceBuilder.baoheNorthTiers,
  dispose(){zoneManager.dispose();palaceBuilder.dispose();enclosure.dispose?.();garden.dispose?.();environment.dispose?.();for(const material of materials.values())material.dispose();libraryResources?.dispose?.();
   restoreDOM();
  }};
}
