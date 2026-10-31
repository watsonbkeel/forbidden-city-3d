import '../../../lib/inner-palace-fixture.mjs';
import * as THREE from 'three';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import './shared-hooks.mjs';
import {realTextureLibrary} from '../../../lib/r48-real-texture-library.mjs';
const url=new URL('../../../../src/scene/palace/special/WenhuaGateApproaches.js',import.meta.url);
const {CourtKit}=await import('../../../../src/scene/palace/kit.js');
const builderURL=new URL('../../../../src/scene/palace/special/SouthCourtGates.js',import.meta.url);
const builderSource=readFileSync(builderURL,'utf8').replace(/^import \{applyWenhuaGateApproaches\} from ['"].\/WenhuaGateApproaches.js['"];\n/m,'').replace('applyWenhuaGateApproaches(kit,f);','').replace(/from (['"])([^'"]+)\1/g,(_,q,id)=>`from '${id==='three'?import.meta.resolve('three'):new URL(id,builderURL).href}'`);
const {buildSouthCourtGate}=await import('data:text/javascript;base64,'+Buffer.from(builderSource).toString('base64'));
const {CollisionManager}=await import('../../../../src/utils/Collision.js');
export const api=existsSync(url)?await import(url):{};
export {THREE};
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const meshes=o=>{const a=[];o.traverse(m=>{if(m.isMesh)a.push(m);});return a;};
export const oldStairs=f=>f.frame.children.filter(o=>o.isGroup&&o.children.length===7&&o.children.every(m=>m.isMesh&&m.material===f.lib.material('marble')));
export function row(m){return{position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),material:m.material?.name??null,visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)])),index:m.geometry.index?Array.from(m.geometry.index.array):null};}
export const parts=f=>meshes(f.frame).filter(m=>m.userData.wenhuaGateApproach);
export function nonTarget(f){const excluded=new Set(oldStairs(f).flatMap(g=>g.children));return hash(meshes(f.frame).filter(m=>!excluded.has(m)&&!m.userData.wenhuaGateApproach).map(row));}
export function fixture(candidate=false,profile='wenhua'){
 const lib=realTextureLibrary(),zone=profile==='wenhua'?'outer-east':'outer-west',kit=new CourtKit(lib,zone);
 const item=JSON.parse(readFileSync(new URL(`../../../../data/zones/${zone}.json`,import.meta.url))).items.find(i=>i.southGateProfile===profile);
 const {f:frame,g}=buildSouthCourtGate(kit,item),f={lib,kit,frame,g,item};
 if(candidate)api.applyWenhuaGateApproaches?.(kit,frame);
 if(process.env.WENHUA_MUTANT==='no-north-collision')kit.colliders=kit.colliders.filter(c=>c.wenhuaGateApproach?.id!=='wenhua-gate-approach-north');
 frame.updateMatrixWorld(true);return f;
}
export function world(f,merged=false){f.scene=merged?f.kit.finish():f.kit.root;f.scene.updateMatrixWorld(true);f.cm=new CollisionManager();f.cm.rivers=[];f.cm.moats=[];f.cm.addColliders(f.kit.colliders);f.cm.addWalkables(f.kit.walkables);return{THREE,scene:f.scene,cm:f.cm};}
export const dispose=f=>{f.kit.dispose(f.scene??f.kit.root);f.lib.dispose();};
export function ray(f,point,direction,far=50){return new THREE.Raycaster(new THREE.Vector3(f.g.x+point[0],point[1],f.g.z+point[2]),new THREE.Vector3(...direction),0,far).intersectObject(f.scene??f.kit.root,true);}
