import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace} from './lib/terrace-walk.mjs';
import {assertArrowSouthKneesInWorld} from './lib/r59-arrow-knees-world-check.mjs';
import {fixture,item} from './lib/r158-arrow-south-lattice-fixture.mjs';
import {meshes,kneeMeshHealth,sha} from './lib/r59-arrow-knees-qa.mjs';
const url=new URL('../src/scene/palace/special/ArrowSouthDoorLattice.js',import.meta.url);
const api=fs.existsSync(url)?await import(url):{};
const role='arrow-south-secondary-diagonal-lattice',backingRole='arrow-south-secondary-dark-infill';
const isNew=m=>[role,backingRole].includes(m.userData.role);
function apply(f){assert.equal(typeof api.applyArrowSouthDoorLattice,'function','bounded Arrow south lattice builder exists');return api.applyArrowSouthDoorLattice(f.kit,f.frame,f.item);}
const rows=list=>sha(JSON.stringify(list.map(m=>({name:m.name,data:m.userData,transform:[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()],visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow,material:m.material?[m.material.name,m.material.color?.getHex(),m.material.side]:null,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null}))));
const physics=k=>sha(JSON.stringify({physical:Object.fromEntries(['colliders','walkables','rooms','regions','mapItems'].map(key=>[key,k[key]])),plaques:k.plaques.map(p=>({text:p.text,position:p.mesh.position.toArray(),rotation:p.mesh.rotation.toArray(),scale:p.mesh.scale.toArray()}))}));
function targets(f){return meshes(f.frame).filter(m=>m.userData.role==='arrow-plain-lattice'&&Math.abs(m.position.z+6.8)<1e-7&&Math.abs(m.position.x)>2.75&&Math.abs(m.position.x)<8.25);}

test('only the 64 orthogonal cues on eight south secondary closed leaves change; all other actual objects and physics remain byte exact',()=>{
 const f=fixture();try{const old=targets(f);assert.equal(old.length,64);const excluded=new Set(old),retained=rows(meshes(f.frame).filter(m=>!excluded.has(m))),p=physics(f.kit),before=meshes(f.frame).length;const r=apply(f);
 assert.equal(r.replacedMeshes,64);assert.equal(r.leafCount,8);assert.equal(r.visualAcceptance,'VERIFY_PENDING');assert.equal(r.wholeObjectAccepted,false);assert.equal(r.patternStatus,'DIAGONAL_DIRECTION_CUE_NOT_LITERAL_LINGHUA_PATTERN');assert.equal(physics(f.kit),p);assert.equal(rows(meshes(f.frame).filter(m=>!isNew(m))),retained);assert.equal(meshes(f.frame).length,before-64+16);assert.ok(old.every(m=>!m.parent));assert.equal(meshes(f.frame).filter(m=>m.userData.role==='arrow-south-central-knee').length,2);
 }finally{f.dispose();}
});

test('new upper-leaf members are closed finite nondegenerate solid geometry, clipped to the eight existing leaves and use dark private non-textured wood',()=>{
 const f=fixture();try{apply(f);const list=meshes(f.frame).filter(m=>m.userData.role===role);assert.equal(list.length,8);const material=list[0].material;assert.equal(new Set(list.map(m=>m.material)).size,1);assert.equal(f.kit.owned.filter(m=>m===material).length,1);assert.equal(material.map,null);assert.equal(material.side,THREE.FrontSide);assert.equal(material.emissive.getHex(),0);assert.equal(material.name,'arrow_south_secondary_lattice_fit');assert.notEqual(material.color.getHex(),0xb49a53);
 let tris=0;for(const m of list){const h=kneeMeshHealth(m);assert.ok(h.finite&&h.closed&&h.minArea>1e-8&&h.signedVolume>0);tris+=h.triangles;const bounds=new THREE.Box3().setFromObject(m),leaf=m.userData.leaf;assert.ok(bounds.min.x>=item.x+leaf.x-leaf.width/2-1e-5);assert.ok(bounds.max.x<=item.x+leaf.x+leaf.width/2+1e-5);assert.ok(bounds.min.y>=item.ph+2.05-1e-5);assert.ok(bounds.max.y<=item.ph+4.35+1e-5);assert.ok(bounds.max.z<item.z-6.8);assert.deepEqual(m.userData.directions,[-1,1]);assert.equal(m.userData.captureDate,null);assert.equal(m.userData.dimensionStatus,'PHOTO_FIT_NOT_SURVEYED');assert.ok(m.castShadow&&m.receiveShadow);}
 assert.ok(tris>768&&tris<4000,`bounded triangles ${tris}`);
 }finally{f.dispose();}
});

test('wrong identity, changed doors/grids, duplicate call and missing host reject before any new allocation, disposal or mutation',()=>{
 assert.equal(typeof api.applyArrowSouthDoorLattice,'function');for(const change of[{name:'临溪亭'},{w:30},{x:0},{z:0},{ph:1},{colH:7},{bays:7},{rot:Math.PI},{enclosureProfile:'other'},{enter:false}]){const f=fixture();try{const before=rows(meshes(f.frame)),p=physics(f.kit),n=f.kit.owned.length;assert.throws(()=>api.applyArrowSouthDoorLattice(f.kit,f.frame,{...f.item,...change}),/Arrow south lattice/);assert.equal(rows(meshes(f.frame)),before);assert.equal(physics(f.kit),p);assert.equal(f.kit.owned.length,n);}finally{f.dispose();}}
 for(const mode of['missing-grid','moved-grid','missing-leaf','rotated-leaf','missing-knee']){const f=fixture();try{const all=meshes(f.frame);if(mode==='missing-grid')targets(f)[0].removeFromParent();if(mode==='moved-grid')targets(f)[0].position.y+=.1;if(mode==='missing-leaf')all.find(m=>m.userData.role==='arrow-door-leaf'&&Math.abs(m.position.z+6.8)<1e-7&&m.position.x>2.75&&m.position.x<8.25).removeFromParent();if(mode==='rotated-leaf')all.find(m=>m.userData.role==='arrow-door-leaf'&&Math.abs(m.position.z+6.8)<1e-7&&m.position.x>2.75&&m.position.x<8.25).rotation.y=.1;if(mode==='missing-knee')all.find(m=>m.userData.role==='arrow-south-central-knee').removeFromParent();const b=rows(meshes(f.frame)),n=f.kit.owned.length;assert.throws(()=>apply(f),/Arrow south lattice/);assert.equal(rows(meshes(f.frame)),b);assert.equal(f.kit.owned.length,n);}finally{f.dispose();}}
 const f=fixture();try{apply(f);const n=f.kit.owned.length,b=rows(meshes(f.frame));assert.throws(()=>apply(f),/already/);assert.equal(rows(meshes(f.frame)),b);assert.equal(f.kit.owned.length,n);assert.throws(()=>api.applyArrowSouthDoorLattice(f.kit,new THREE.Group(),f.item),/host/);}finally{f.dispose();}
});

test('replaced geometry is disposed once; new source/merged geometry and private material dispose once; host-owned material is not disposed early',()=>{
 const f=fixture(),old=targets(f),watch=new Map(),track=o=>{if(watch.has(o))return;watch.set(o,0);o.addEventListener('dispose',()=>watch.set(o,watch.get(o)+1));};old.forEach(m=>track(m.geometry));const shared=old[0].material;let disposed=0;shared.addEventListener('dispose',()=>disposed++);
 apply(f);assert.ok(old.every(m=>watch.get(m.geometry)===1));const allAdded=meshes(f.frame).filter(isNew);for(const m of allAdded){track(m.geometry);track(m.material);}const added=allAdded.filter(m=>m.userData.role===role);const material=added[0].material,triangles=added.reduce((n,m)=>n+kneeMeshHealth(m).triangles,0);const merged=f.kit.finish(),bucket=meshes(merged).filter(m=>m.material===material);assert.equal(bucket.length,1);assert.equal(kneeMeshHealth(bucket[0]).triangles,triangles);for(const m of added)assert.equal(watch.get(m.geometry),1);for(const m of meshes(merged).filter(m=>m.material.name.startsWith('arrow_south_secondary_')))track(m.geometry);assert.equal(disposed,0);f.kit.dispose(merged);for(const value of watch.values())assert.equal(value,1);assert.equal(disposed,1,'host owns its original private yellow material and disposes at final kit disposal, not during replacement');
});

test('moved, rotated, scaled or detached Arrow frame rejects before changing any visible host',()=>{
 for(const mode of['translated','rotated','scaled','detached']){const f=fixture();try{if(mode==='translated')f.frame.position.x+=1;if(mode==='rotated')f.frame.rotation.y=.1;if(mode==='scaled')f.frame.scale.x=1.1;if(mode==='detached')f.frame.removeFromParent();const b=rows(meshes(f.frame)),n=f.kit.owned.length;assert.throws(()=>apply(f),/Arrow south lattice.*host/);assert.equal(rows(meshes(f.frame)),b);assert.equal(f.kit.owned.length,n);}finally{f.dispose();}}
});

for(const fps of[10,60])for(const backward of[false,true])test(`new south leaf detail preserves actual controller galleries and N/S doors at ${fps} Hz ${backward?'backward':'forward'}`,t=>{
 const f=fixture();let merged;try{apply(f);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);const points=[[0,-13],[0,-7.8],[14.65,-7.8],[14.65,7.8],[0,7.8],[0,13],[0,0],[0,-7.8],[-14.65,-7.8],[-14.65,7.8],[0,7.8],[0,-13]].map(([x,z])=>[x+item.x,z+item.z]);const r=replayTerrace(t,{THREE,cm},points,{fps,backward,sprint:true,recordFrames:true});assert.equal(r.arrived,true);assert.ok(r.frames.every(p=>Number.isFinite(p.feet)&&Number.isFinite(p.ground)));const scene=new THREE.Scene();merged=f.kit.finish();scene.add(merged);const knee=assertArrowSouthKneesInWorld({scene,cm});assert.equal(knee.triangles,88);assert.equal(knee.browserAcceptance,false);
 }finally{f.kit.dispose(merged??f.kit.root);}
});

test('pure world consumer audits the actual merged lattice bucket and detects its absence or translation',async()=>{
 const url=new URL('./lib/r158-arrow-south-lattice-world-check.mjs',import.meta.url),world=fs.existsSync(url)?await import(url):{};assert.equal(typeof world.assertArrowSouthDoorLatticeInWorld,'function','pure merged-triangle consumer exists');
 const f=fixture();let merged;try{apply(f);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);merged=f.kit.finish();const scene=new THREE.Scene();scene.add(merged);const W={scene,cm},r=world.assertArrowSouthDoorLatticeInWorld(W);assert.equal(r.triangles,1728);assert.equal(r.infillTriangles,96);assert.equal(r.leafCount,8);assert.equal(r.browserAcceptance,false);const bucket=meshes(merged).find(m=>m.material.name==='arrow_south_secondary_lattice_fit');bucket.position.y+=.5;assert.throws(()=>world.assertArrowSouthDoorLatticeInWorld(W),/lattice.*bound/);bucket.position.y-=.5;bucket.removeFromParent();assert.throws(()=>world.assertArrowSouthDoorLatticeInWorld(W),/1728/);merged.add(bucket);const infill=meshes(merged).find(m=>m.material.name==='arrow_south_secondary_infill_fit');infill.removeFromParent();assert.throws(()=>world.assertArrowSouthDoorLatticeInWorld(W),/infill.*96/);merged.add(infill);
 }finally{f.kit.dispose(merged??f.kit.root);}
});

test('only the eight reviewed upper leaf panels receive opaque dark infill cues; no glass or openwork is asserted',()=>{
 const f=fixture();try{apply(f);const panels=meshes(f.frame).filter(m=>m.userData.role===backingRole);assert.equal(panels.length,8);assert.equal(new Set(panels.map(m=>m.material)).size,1);assert.equal(panels[0].material.color.getHex(),0x242725);assert.equal(f.kit.owned.filter(m=>m===panels[0].material).length,1);for(const m of panels){assert.equal(m.material.transparent,false);assert.equal(m.material.opacity,1);assert.equal(m.material.map,null);assert.equal(m.userData.surfaceStatus,'OPAQUE_DARK_SURFACE_CUE_NOT_GLASS_OPENWORK_OR_MEASURED_SHADOW');const b=new THREE.Box3().setFromObject(m);assert.ok(Math.abs(b.min.y-2.95)<1e-5&&Math.abs(b.max.y-5.25)<1e-5);assert.ok(b.min.z>item.z-6.93&&b.max.z<item.z-6.87);assert.equal(kneeMeshHealth(m).triangles,12);}
 }finally{f.dispose();}
});
