// Isolated local candidate hookup. The production owner alone edits PalaceBuilder.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {library} from './inner-palace-fixture.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
export const SHA=x=>createHash('sha256').update(x).digest('hex');
export const ARGS={x0:0,y:0,H:7.22,ztb0:1,ztb1:8,thW:49.7/9*1.6,bayW:49.7/9,text:'',caisson:false,baohe:true};
export const DAIS_HUNKS=[
 ["import {buildBaoheWarmRooms}","import { buildBaoheDaisApproach, registerBaoheDaisFurnishingSolids } from './palace/BaoheDaisApproach.js';\nimport {buildBaoheWarmRooms}"],
 ['    // 地平床：两级，金边','    if (baohe) buildBaoheDaisApproach(this,g,{x0,y,ztb0,ztb1,thW});\n    else {\n    // 地平床：两级，金边'],
 ['    // 宝座 + 屏风','    }\n    // 宝座 + 屏风'],
 ['    // Qianqing selected-display vessels have one permanent dedicated owner.',"    if (baohe) registerBaoheDaisFurnishingSolids(this,g);\n    // Qianqing selected-display vessels have one permanent dedicated owner."]
];
export const sourceURL=new URL('../../src/scene/PalaceBuilder.js',import.meta.url),baselineSource=fs.readFileSync(new URL('../fixtures/r58-baohe-dais-baseline-owner.txt',import.meta.url),'utf8');
if(SHA(baselineSource)!=='2b4a010aa797d4a7c4d26ff2cfc1016851a29562b019a27aa06d049349a3c464')throw Error('Frozen bf7b399 owner bytes changed');
const asModule=text=>'data:text/javascript;base64,'+Buffer.from(text.replace(/from '([^']+)'/g,(_,s)=>`from '${s.startsWith('.')?new URL(s,sourceURL).href:s==='three'?import.meta.resolve('three'):s}'`)).toString('base64');
export const {PalaceBuilder:Baseline}=await import(asModule(baselineSource));
export function hookSource(source){for(const [before,after] of DAIS_HUNKS){if(source.split(before).length!==2)throw Error('Unique owner hookup required: '+before);source=source.replace(before,after);}return source;}
export let Candidate=Baseline;
if(fs.existsSync(new URL('../../src/scene/palace/BaoheDaisApproach.js',import.meta.url))){
 Candidate=(await import(asModule(hookSource(baselineSource)))).PalaceBuilder;
}
export function fixture({candidate=true,y=0,x0=0,zOffset=0}={}){
 const scene=new THREE.Scene(),b=new (candidate?Candidate:Baseline)(scene,library()),g=new THREE.Group();scene.add(g);
 const args={...ARGS,y,x0,ztb0:ARGS.ztb0+zOffset,ztb1:ARGS.ztb1+zOffset};
 b.throneArea(g,args);scene.updateMatrixWorld(true);
 const cm=new CollisionManager();cm.addColliders(b.colliders);cm.addWalkables(b.walkables);
 return {THREE,scene,b,g,cm,args,dispose(){scene.traverse(o=>o.geometry?.dispose());b.dispose();}};
}
export async function hallFixture({candidate=true,name='保和殿'}={}){
 const {PALACE_LAYOUT}=await import('../../src/scene/Layout.js');
 const hall=structuredClone(PALACE_LAYOUT.find(h=>h.name===name));hall.position.x=hall.position.z=0;
 const scene=new THREE.Scene(),b=new(candidate?Candidate:Baseline)(scene,library()),g=new THREE.Group();g.name=name;scene.add(g);
 b.buildHall(g,hall,0,{heightReferenceY:10});scene.updateMatrixWorld(true);
 const cm=new CollisionManager();cm.addColliders(b.colliders);cm.addWalkables(b.walkables);
 return {THREE,scene,b,g,cm,dispose(){scene.traverse(o=>o.geometry?.dispose());b.dispose();}};
}
