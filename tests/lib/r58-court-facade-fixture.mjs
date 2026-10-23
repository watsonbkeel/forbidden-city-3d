import * as THREE from 'three';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import './inner-palace-fixture.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {buildSideGate} from '../../src/scene/palace/special/SideGate.js';
import {buildSurveyedPavilion} from '../../src/scene/palace/special/SurveyedPavilion.js';
import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';
import {pavilionGeometry} from '../../src/scene/palace/special/PavilionProfiles.js';
import {CollisionManager} from '../../src/utils/Collision.js';
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const nodes=root=>{const a=[];root.traverse(o=>a.push(o));return a;};
export const meshes=root=>nodes(root).filter(o=>o.isMesh);
export const roles=(root,role)=>nodes(root).filter(o=>o.userData.role===role);
export const triangles=root=>meshes(root).reduce((n,o)=>n+(o.geometry.index?.count??o.geometry.attributes.position.count)/3,0);
const axis=JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
export function fixture(profile,extra={},builder=null,setup=()=>{}){
 const lib=new TextureLibrary();lib.manifest=JSON.parse(readFileSync(new URL('../../public/textures/hd/manifest.json',import.meta.url)));
 for(const name of Object.keys(TEXTURE_SPECS)){
  const entry=lib.manifest.textures[name],size=entry?.hd??{width:1,height:1};
  lib.colors.set(name,lib.configure(new THREE.Texture(size),name,'color'));
  if(entry?.normal)lib.normals.set(name,lib.configure(new THREE.Texture(size),name,'normal'));
 }
 const key=['tiren','hongyi'].includes(profile)?'pavilionProfile':'gateProfile';
 const opts={...axis.items.find(o=>o[key]===profile),plaque:false,...extra},kit=new CourtKit(lib);
 let frame,g;setup(kit);
 if(key==='pavilionProfile'){const built=(builder??buildSurveyedPavilion)(kit,opts);frame=built.f;g=pavilionGeometry(opts);}
 else{(builder??buildSideGate)(kit,opts);frame=kit.root.children[0];g=sideGateGeometry(opts);}
 frame.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
 return{lib,kit,frame,g,opts,cm};
}
function materialRow(m){return{name:m.name,type:m.type,color:m.color?.toArray(),emissive:m.emissive?.toArray(),roughness:m.roughness,metalness:m.metalness,side:m.side,opacity:m.opacity,transparent:m.transparent,alphaTest:m.alphaTest,depthWrite:m.depthWrite,maps:['map','normalMap','roughnessMap'].map(k=>m[k]?{kind:k,name:m[k].name,repeat:m[k].repeat.toArray(),offset:m[k].offset.toArray(),wrapS:m[k].wrapS,wrapT:m[k].wrapT,colorSpace:m[k].colorSpace,anisotropy:m[k].anisotropy,flipY:m[k].flipY}:null)};}
export function meshRows(root,exclude=()=>false){root.updateMatrixWorld(true);return meshes(root).filter(o=>!exclude(o)).map(o=>({role:o.userData.role??o.name,matrix:o.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,array:Array.from(a.array)}])),index:o.geometry.index?Array.from(o.geometry.index.array):null,material:materialRow(o.material),castShadow:o.castShadow,receiveShadow:o.receiveShadow,visible:o.visible}));}
export function physical(kit){return{colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions};}
export function lowerWindow(o){for(let p=o;p;p=p.parent)if(p.userData.role==='lower-window')return true;return false;}
export function snapshot(f){const rows=meshRows(f.frame);return{triangles:triangles(f.frame),meshes:rows.length,all:hash(rows),retainedWithoutLowerWindows:hash(meshRows(f.frame,lowerWindow)),materials:hash(rows.map(r=>r.material)),physics:hash(physical(f.kit)),physicalCounts:Object.fromEntries(Object.entries(physical(f.kit)).map(([k,v])=>[k,v.length]))};}
export function rayLocal(root,g,p,dir,far=100){const [x,z]=g.toWorld(p[0],p[2]),direction=new THREE.Vector3(...dir).applyAxisAngle(new THREE.Vector3(0,1,0),g.rot),ray=new THREE.Raycaster(new THREE.Vector3(x,p[1],z),direction);ray.far=far;return ray.intersectObject(root,true);}
export function geometryHealth(root){let total=0,minArea=Infinity;for(const m of meshes(root)){const g=m.geometry,p=g.attributes.position,i=g.index,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();for(const attr of Object.values(g.attributes))for(const x of attr.array)if(!Number.isFinite(x))throw Error('nonfinite attribute');for(let k=0;k<(i?.count??p.count);k+=3){a.fromBufferAttribute(p,i?i.getX(k):k);b.fromBufferAttribute(p,i?i.getX(k+1):k+1);c.fromBufferAttribute(p,i?i.getX(k+2):k+2);const area=b.sub(a).cross(c.sub(a)).length()/2;if(area<1e-10)throw Error(`degenerate ${m.name}`);minArea=Math.min(minArea,area);total++;}}return{triangles:total,minArea};}
