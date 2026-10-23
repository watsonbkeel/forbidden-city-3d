import * as THREE from 'three';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {CollisionManager} from '../../src/utils/Collision.js';
const url=new URL('../../src/scene/palace/special/ZhenduGate.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
export const ZHENDU_ITEM={gateProfile:'zhendu',gateKind:'three-bay',x:64.4,z:-214.2,name:'贞度门',open:true,plaque:false};
export function zhenduFixture(extra={}){
 const old=globalThis.document,ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
 globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 const materials=new Map(),lib={material:n=>materials.get(n)??(materials.set(n,new THREE.MeshStandardMaterial({name:n})),materials.get(n)),tileSize:()=>1,aspect:()=>1};
 try{
  const kit=new CourtKit(lib);assert.equal(typeof api.buildZhenduGate,'function','dedicated actual Zhendu builder is required');
  const width=api.buildZhenduGate(kit,{...ZHENDU_ITEM,...extra}),frame=kit.root.children[0];frame.updateMatrixWorld(true);
  const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'zhendu-fixture');cm.addWalkables(kit.walkables,'zhendu-fixture');
  const scene=new THREE.Scene();scene.add(kit.root);scene.updateMatrixWorld(true);
  return{THREE,lib,materials,kit,frame,scene,cm,width,p:frame.userData.gateGeometry};
 }finally{globalThis.document=old;}
}
export function roles(root,role){const rows=[];root.traverse(o=>{if(o.userData.role===role)rows.push(o);});return rows;}
export function rayLocal(root,p,[x,y,z],dir,far=100){const [wx,wz]=p.toWorld(x,z),d=new THREE.Vector3(...dir).applyAxisAngle(new THREE.Vector3(0,1,0),p.rot);const ray=new THREE.Raycaster(new THREE.Vector3(wx,y,wz),d);ray.far=far;return ray.intersectObject(root,true);}
