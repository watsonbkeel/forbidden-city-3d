import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {TAIHE_CORE as P} from '../../src/scene/palace/special/TaiheCoreProfile.js';
import {installTaihePlaqueSurround} from '../../src/scene/palace/special/TaihePlaqueFrame.js';
import {library} from './inner-palace-fixture.mjs';
export const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url));
export const taiheConfig=JSON.parse(read('data/interiors/taihe.json'));
export const allMeshes=root=>{const list=[];root.traverse(m=>{if(m.isMesh)list.push(m);});return list;};
export async function taiheAsset(){const b=read('public'+taiheConfig.model);return(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;}
export function taiheHall(){const builder=new PalaceBuilder(new T.Scene(),library()),group=new T.Group();builder.buildHall(group,PALACE_LAYOUT.find(h=>h.name==='太和殿'),P.frame.floorY);builder.addObject(group);group.updateMatrixWorld(true);return{builder,group};}
export async function captureTaiheSightlines({omitCores=false}={}){
 const f=taiheHall(),fine=await taiheAsset();installTaihePlaqueSurround(fine);fine.position.y=P.frame.floorY;f.group.add(fine);f.group.updateMatrixWorld(true);
 const permanent=allMeshes(f.group).filter(m=>!m.userData.taiheCoreOwner&&!allMeshes(fine).includes(m)),coarse=allMeshes(f.group).filter(m=>m.userData.taiheCoreOwner);
 const eyes=[[-6.2,-18.5],[0,-18.5],[6.2,-18.5],[-6.2,-10],[0,-10],[6.2,-10],[-6.2,0],[0,0],[6.2,0],[-6.2,5],[6.2,5],[-6.2,10],[6.2,10],[-6.2,15],[0,16.5],[6.2,15]];
 const targets={plaque:[-2.8,0,2.8].flatMap(x=>[6.7,7.8,8.9].map(y=>[x,y,P.plaque.z-.081])),screen:[-1.4,0,1.4].flatMap(x=>[3.1,4.1,4.7].map(y=>[x,y,P.screen.z-.13])),throne:[-.5,0,.5].flatMap(x=>[3.05,3.4,3.8].map(y=>[x,y,P.throne.z+.35])),caisson:[[0,P.caisson.sphereY,P.caisson.z]]};
 const rows=[];
 for(const [tier,core] of [['B',omitCores?[]:coarse],['S',omitCores?[]:allMeshes(fine)]])for(const [x,z]of eyes){
 const eye=new T.Vector3(x,P.frame.floorY+1.7,z),row={tier,eye:[x,1.7,z],targets:{}};
 for(const[name,points]of Object.entries(targets)){let visible=0,missed=0;const blocked=[];
 for(const [tx,ty,tz]of points){const target=new T.Vector3(tx,P.frame.floorY+ty,tz),direction=target.clone().sub(eye),distance=direction.length();const hits=new T.Raycaster(eye,direction.normalize(),0,distance+1).intersectObjects([...permanent,...core],false),hit=hits[0];
 const local=hit?.point.clone().sub(new T.Vector3(0,P.frame.floorY,0));
 const onTarget=local&&core.includes(hit.object)&&({
 plaque:()=>Math.abs(local.x)<=3.41&&local.y>=6.39&&local.y<=9.21&&Math.abs(local.z-P.plaque.z)<.18,
 screen:()=>Math.abs(local.x)<=2.15&&local.y>=P.screen.baseY-.02&&local.y<=5.9&&Math.abs(local.z-P.screen.z)<.3,
 throne:()=>Math.abs(local.x)<=.95&&local.y>=P.throne.baseY-.03&&local.y<=4.02&&Math.abs(local.z-P.throne.z)<.85,
 caisson:()=>Math.abs(local.x)<1&&local.y>8&&local.y<11.3&&Math.abs(local.z-P.caisson.z)<1,
 }[name]());
 if(hit&&hit.distance>=distance-.4&&onTarget)visible++;
 else if(!hit)missed++;
 else blocked.push({object:hit.object.name,material:hit.object.material.name,distance:hit.distance,point:local.toArray(),onTarget:!!onTarget});}
 row.targets[name]={clearSamples:visible,totalSamples:points.length,missedSamples:missed,blockers:blocked};
 }
 const az=t=>Math.atan2(-x,t-z)*180/Math.PI;
 row.throneCaissonBearingGapDegrees=Math.abs(az(P.throne.z)-az(P.caisson.z));row.priorThroneCaissonBearingGapDegrees=Math.abs(az(11.26)-az(P.caisson.z));rows.push(row);
 }
 fine.removeFromParent();for(const m of allMeshes(fine)){m.geometry.dispose();m.material.dispose();}f.builder.dispose();return rows;
}
