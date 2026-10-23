import fs from 'node:fs';
import crypto from 'node:crypto';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from './inner-palace-fixture.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {augmentRemainingHall,resolveRemainingProfile} from '../../src/scene/palace/special/RemainingResidentialHalls.js';
import {actualYangxinRoot} from '../r53-yangxin/glb-fixture.mjs';
registerHooks({load(url,ctx,next){if(url.endsWith('.json'))return{format:'module',source:`export default ${fs.readFileSync(new URL(url),'utf8')}`,shortCircuit:true};return next(url,ctx);}});
const {InteriorLoader}=await import('../../src/scene/interior/InteriorLoader.js');
const helper=new URL('../../src/scene/palace/special/QinzhengFootstool.js',import.meta.url);
export const api=fs.existsSync(helper)?await import(helper):{};
export const item=JSON.parse(fs.readFileSync(new URL('../../docs/current-state/r48-remaining/residential-scope.json',import.meta.url))).find(r=>r.name==='养心殿').baselineItem;
const cfg=JSON.parse(fs.readFileSync(new URL('../../data/interiors/yangxin.json',import.meta.url)));
export const prefix='r63-qinzheng-footstool';
export const hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
// Exact baseline owner bytes, isolated from any later live-owner integration.
// Only dependency specifiers are made absolute for the test-only data module.
export const frozenOwnerSha256='0e9c32f33c9df590dba98f8fc32990bbb8f601f7d17cc80b9013ec7d28bfeba8';
const frozenOwnerSource=fs.readFileSync(new URL('../fixtures/r63-qinzheng-footstool/RemainingResidentialHalls.baseline.js.txt',import.meta.url),'utf8');
if(hash(frozenOwnerSource)!==frozenOwnerSha256)throw Error('R63 frozen pre-hook owner bytes mismatch');
const baselineOwnerURL=new URL('../../src/scene/palace/special/RemainingResidentialHalls.js',import.meta.url);
const frozenOwner=await import('data:text/javascript;base64,'+Buffer.from(frozenOwnerSource.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,baselineOwnerURL).href}${q}`)).toString('base64'));
const liveOwnerURL=new URL(import.meta.resolve('../../src/scene/palace/special/RemainingResidentialHalls.js'));
export const liveOwnerDeclaresFootstool=/from\s*['"][^'"]*QinzhengFootstool\.js['"]/.test(fs.readFileSync(liveOwnerURL,'utf8'));

export function meshes(root){const a=[];root.updateWorldMatrix(true,true);root.traverse(m=>{if(m.isMesh)a.push(m);});return a;}
const box=b=>[...b.min.toArray(),...b.max.toArray()];
const material=m=>Array.isArray(m)?m.map(material):m?{name:m.name,color:m.color?.toArray(),roughness:m.roughness,metalness:m.metalness,side:m.side,opacity:m.opacity,transparent:m.transparent}:null;
export function snapshot(w,{retained=true}={}){
 const keep=m=>!retained||!m.userData.role?.startsWith(prefix);
 const rows=meshes(w.kit.root).filter(keep).map(m=>({name:m.name,userData:m.userData,matrix:m.matrixWorld.toArray(),geometry:Object.fromEntries([...Object.entries(m.geometry.attributes),['index',m.geometry.index]].filter(([,a])=>a).map(([k,a])=>[k,{itemSize:a.itemSize,type:a.array.constructor.name,sha256:hash(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}])),material:material(m.material)}));
 const cols=w.kit.colliders.filter(b=>!retained||!b.sourceRole?.startsWith(prefix)).map(box),walk=w.kit.walkables.filter(b=>!retained||!b.sourceRole?.startsWith(prefix)).map(w=>({...w,box:w.box?box(w.box):undefined}));
 return{meshes:rows.length,triangles:meshes(w.kit.root).filter(keep).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),geometryMaterial:hash(rows),colliders:cols.length,collision:hash(cols),supports:walk.length,support:hash(walk)};
}
export function fixture({candidate=true}={}){
 const kit=new CourtKit(library(),'west-six'),b=kit.hall(item),owner=candidate?{augmentRemainingHall,resolveRemainingProfile}:frozenOwner;
 owner.augmentRemainingHall(kit,item,b,owner.resolveRemainingProfile('west-six',item));
 const ownerHookApplied=!!b.f.userData.qinzhengFootstool;
 // An integrated live import must actually execute its hook. The unit-only
 // fallback must never conceal an accidentally omitted production invocation.
 if(candidate&&liveOwnerDeclaresFootstool&&!ownerHookApplied)throw Error('R63 live owner imports footstool but did not invoke the hook');
 const fixtureFallbackApplied=candidate&&!ownerHookApplied;
 if(fixtureFallbackApplied){if(!api.buildQinzhengFootstool)throw Error('R63 helper absent');api.buildQinzhengFootstool(kit,item,b.f);}
 kit.root.updateMatrixWorld(true);const scene=new THREE.Scene();scene.add(kit.root);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'west-six');cm.addWalkables(kit.walkables,'west-six');const loader=new InteriorLoader(scene,cm,{registry:{yangxin:cfg}});return{THREE,kit,...b,scene,cm,loader,ownerSource:candidate?'actual-live-owner':'frozen-pre-hook-owner',ownerHookApplied,fixtureFallbackApplied};
}
export async function loadS(w){const root=await actualYangxinRoot();w.loader.gltf.load=(_u,ok)=>ok({scene:root});if(!await w.loader.load('yangxin'))throw Error('Actual Yangxin S failed to load');w.loader.update({x:item.x,z:item.z},performance.now()+500);return root;}
export function dispose(w){w.loader.dispose();w.kit.dispose(w.merged??w.kit.root);}
