/** Consume an existing real world and its InteriorLoader. Never build a second world or character system. */
import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {ROOT,config,hash,contract,inventory,actualKunningRoot as decodeActual} from './r55-kunning-asset.mjs';
export async function actualKunningRoot(){const root=await decodeActual();root.updateMatrixWorld(true);assert.equal(contract(root).sourceSHA256,hash(fs.readFileSync(new URL('assets-src/interiors/kunning.py',ROOT))));return root;}
const boxJSON=b=>({min:b.min.toArray(),max:b.max.toArray()});
export const R55_KUNNING_STOVE_BOUNDS={old:{min:[-7.25,0,4.5],max:[-3.05,1.9,7.05]},current:{min:[-7.22,0,4.625],max:[-3.22,.43,6.925]},frame:{x:0,y:2.16,z:386.1}};
export const R55_KUNNING_OBSERVATION_ROUTE=[[0,371],[0,375.2],[0,377.35],[-5.111111,377.35],[-5.111111,381.2],[-1,384.1],[-3.8,386.6],[-5.15,388.8],[-6.2,389.7],[-5.15,388.8],[-3.8,386.6],[-1,384.1],[-5.111111,381.2],[-5.111111,377.35],[0,377.35],[0,375.2],[0,371]];
const baselines=new WeakMap();
const nonSState=W=>({colliders:W.cm.colliders.filter(c=>c.tag!=='interior:kunning').map(c=>({tag:c.tag,...boxJSON(c.box)})),walkables:W.cm.walkables.filter(c=>c.tag!=='interior:kunning').map(c=>c.type==='box'?{tag:c.tag,type:c.type,rescue:c.rescue,...boxJSON(c.box)}:c)});
const assetSignature=root=>{const rows=[];root.traverse(m=>{if(!m.isMesh)return;rows.push([m.name,m.matrix.toArray(),Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,data:Array.from(a.array)}])),m.geometry.index?Array.from(m.geometry.index.array):null,m.material.name,m.material.color?.toArray(),m.material.roughness,m.material.metalness,m.material.side]);});return hash(rows);};
let expected;
export async function assertKunningStovesInWorld(W,{interiors,layer}){
 assert.equal(interiors.cm,W.cm,'same real CollisionManager');assert.equal(interiors.scene,W.scene,'same real world scene');
 if(!baselines.has(W)){assert.notEqual(layer,'S','capture B before installing S');baselines.set(W,nonSState(W));}
 assert.deepEqual(nonSState(W),baselines.get(W),'B collision and support registrations are preserved');
 const records=W.cm.colliders.filter(c=>c.tag==='interior:kunning');const h=interiors.halls.get('kunning');
 if(layer!=='S'){assert.equal(records.length,0);assert.equal(W.cm.walkables.filter(w=>w.tag==='interior:kunning').length,0);assert.equal(interiors.getGroup('kunning'),null);assert.equal(W.scene.getObjectByName('interior:kunning'),undefined);return{layer,proxies:0,BPreserved:true};}
 assert.equal(h.state,'loaded');assert.equal(h.fade,null,'consume after real fade completion');assert.equal(h.cfg.model,config.model);assert.equal(records.length,8);
 const root=h.group.children.find(c=>c.getObjectByName('KUNNING_CONTRACT'));assert.ok(root);if(!expected){const reference=await actualKunningRoot();expected=assetSignature(reference);const resources=new Set();reference.traverse(m=>{if(m.isMesh){resources.add(m.geometry);for(const mat of(Array.isArray(m.material)?m.material:[m.material]))resources.add(mat);}});resources.forEach(r=>r.dispose());}assert.equal(assetSignature(root),expected,'actual final GLB geometry and materials, not name-only group');
 assert.equal(contract(root).sourceSHA256,hash(fs.readFileSync(new URL('assets-src/interiors/kunning.py',ROOT))));assert.equal(inventory(root).filter(r=>/^r55_stove_lid_\d$/.test(r.name)).length,3);
 assert.equal(W.cm.walkables.filter(w=>w.tag==='interior:kunning').length,0,'S does not invent structural ground/walkable');
 const proxy=root.getObjectByName('COL_stove');assert.equal(proxy.visible,false);const b=new THREE.Box3().setFromObject(proxy);
 const expectedBounds={min:[-7.22,2.16,390.725],max:[-3.22,2.59,393.025]};for(const side of['min','max'])for(let i=0;i<3;i++)assert.ok(Math.abs(b[side].getComponent(i)-expectedBounds[side][i])<1e-5);
 assert.equal(records.filter(c=>c.box.min.distanceTo(b.min)<1e-6&&c.box.max.distanceTo(b.max)<1e-6).length,1,'exactly one low stove collider');
 const at=new THREE.Vector3(-5.15,2.16+1.7,391.98);assert.equal(W.cm.checkCollision(at,.5),true,'grounded body cannot pass through .43m stove');
 assert.ok(Math.abs(W.cm.getGroundHeight(at.x,at.z,2.16,.6)-2.16)<1e-5,'stove is not a new walkable or upward rescue');
 assert.ok(Math.abs(W.cm.supportHeight(at.x,at.z,2.60,.0)-2.59)<1e-5,'jump/landing support coincides with actual .43m top');
 assert.equal(interiors.history.kunning.tris,config.asset.renderableTriangles);
 return{layer,proxies:records.length,stove:boxJSON(b),sourceHash:contract(root).sourceSHA256,renderableTriangles:interiors.history.kunning.tris,newStructuralSupports:0,BPreserved:true};
}
