// Read-only preparation. Captures actual R46 GardenBuilder phases before R47 changes.
import * as THREE from 'three';
import {GardenBuilder} from '../src/scene/GardenBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import{createHash}from'node:crypto';
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),mats=new Map(),lib={material:(n,p={})=>{const k=n+JSON.stringify(p);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name:n,...p}));return mats.get(k)},tileSize:()=>1,aspect:()=>1,color:()=>null,normal:()=>null,owns:m=>[...mats.values()].includes(m)};
export function signature(objects){const a=[];for(const o of objects){o.updateWorldMatrix(true,true);o.traverse(m=>{if(!m.isMesh)return;a.push({name:m.name,matrix:m.matrixWorld.toArray(),material:Array.isArray(m.material)?m.material.map(x=>x.name):m.material.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null,instances:m.isInstancedMesh?[m.count,...m.instanceMatrix.array]:null});});}return{meshes:a.length,hash:hash(a)};}
export function capture(){
const b=new GardenBuilder(new THREE.Scene(),lib),out={baseline:'2be93eaec66d309f21da1b72ddf8cb6b43d4714f',phases:{},pavilions:{}};
for(const name of['buildGround','buildPonds','buildPavilions','buildOrnaments','buildRockeryAndTop']){const old=b[name];b[name]=function(root,...args){const n=root.children.length,c=this.colliders.length,w=this.walkables.length;const r=old.call(this,root,...args);out.phases[name]={geometry:signature(root.children.slice(n)),colliders:hash(this.colliders.slice(c)),walkables:hash(this.walkables.slice(w)),rawWalkables:this.walkables.slice(w),rawColliders:this.colliders.slice(c)};return r;};}
const old=b.makePavilion;b.makePavilion=function(root,args){const c=this.colliders.length,w=this.walkables.length,g=old.call(this,root,args);out.pavilions[args.x+','+args.z]={args,retainedBase:signature(g.children.slice(0,8)),geometry:signature([g]),colliders:hash(this.colliders.slice(c)),walkables:hash(this.walkables.slice(w)),rawWalkables:this.walkables.slice(w),rawColliders:this.colliders.slice(c)};return g;};
b.build(PALACE_LAYOUT.find(i=>i.type==='garden'));out.final=signature([b.group]);out.trees=signature(b.group.children.filter(x=>x.name!=='garden_static'));out.colliders=hash(b.colliders);out.walkables=hash(b.walkables);out.stats=b.stats;out.paths=b.paths;out.beds=b.beds;return {out:JSON.parse(JSON.stringify(out)),b};
}
