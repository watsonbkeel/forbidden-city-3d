import * as THREE from 'three';
import {createRequire} from 'node:module';
import {buildWorld} from './lib/world.mjs';
import {Environment} from '../src/scene/Environment.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CharacterWorldAdapter} from '../src/scene/characters/CharacterWorldAdapter.js';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas');
export async function buildCharacterWorld(){
 globalThis.document={createElement:type=>type==='canvas'?createCanvas(1,1):{},createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 const W=await buildWorld({retainScene:true});
 const mats=new Map(),lib={material:(n,p={})=>{const key=n+JSON.stringify(p);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({name:n,...p}));return mats.get(key);},tileSize:()=>1,aspect:()=>1};
 const environment=new Environment(W.scene,null,lib);environment.setupGround();
 const zone=W.zones.find(z=>z.json.id==='west-six').json,builder=new ZoneBase(lib,zone),data=builder.build();W.scene.add(data.group);W.scene.updateMatrixWorld(true);
 const zoneManager={zones:new Map(W.zones.map(z=>[z.json.id,z.json])),loaded:new Map([['west-six',{builder,data}]]),getLoadedIds(){return [...this.loaded.keys()];}};
 const adapter=new CharacterWorldAdapter({scene:W.scene,collisionManager:W.cm,zoneManager,registry:CHARACTER_REGISTRY});
 return{...W,adapter,zoneManager,environment,zoneBuilder:builder,zoneData:data};
}
if(import.meta.url===`file://${process.argv[1]}`){const W=await buildCharacterWorld();const actors=CHARACTER_REGISTRY.actors.map(a=>({id:a.id,...W.adapter.resolve(a)}));const paths=CHARACTER_REGISTRY.paths.map(p=>{const r=W.adapter.validatePath(p);return{id:p.id,status:r.status,reason:r.reason,collision:r.collision,samples:r.samples?.length,lengthMeters:r.lengthMeters,points:r.points}});console.log(JSON.stringify({actors:actors.map(a=>({id:a.id,status:a.status,reason:a.reason,position:a.position,support:a.support,collision:a.collision})),paths},null,2));}
