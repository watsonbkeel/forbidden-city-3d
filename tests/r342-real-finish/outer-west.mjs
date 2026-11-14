import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';import{createCanvas}from'@napi-rs/canvas';
import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';import{CourtKit}from'../../src/scene/palace/kit.js';import{CollisionManager}from'../../src/utils/Collision.js';import{realTextureLibrary}from'../lib/r48-real-texture-library.mjs';
import{createDafotangPhotoSession}from'../../src/scene/palace/special/DafotangPhotoPresentation.js';import{getXiananManagedBirth,hasXiananRegistration,queryXiananContact}from'../../src/scene/palace/special/XiananContactSources.js';
const previous={document:globalThis.document,fetch:globalThis.fetch};let canvases=0,imageElements=0,fetches=0;
globalThis.document={createElement(tag){assert.equal(tag,'canvas');canvases++;return createCanvas(1,1);},createElementNS(ns,tag){assert.equal(tag,'img');imageElements++;return{addEventListener(){},removeEventListener(){}};}};
globalThis.fetch=()=>{fetches++;throw Error('Unexpected network request in offline finished-zone qualification');};
const lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),zone=JSON.parse(fs.readFileSync('data/zones/outer-west.json'));const builder=new ZoneBase(lib,zone);const errors=[];let report,session;
try{
 assert.equal(builder.kit.finish,CourtKit.prototype.finish);assert.equal(builder.kit.dafotangOriginalArtwork,false);
 const data=builder.build(),group=data.group;assert.equal(group,builder.group);assert.equal(group.name,'outer-west');assert.equal(group.isGroup,true);
 scene.add(group);cm.addColliders(data.colliders,'outer-west');cm.addWalkables(data.walkables,'outer-west');
 const architecture=group.userData.architecture.filter(r=>r.id==='place-outer-west-6cae88b6a2');assert.equal(architecture.length,1);assert.equal(architecture[0].historicalPrincipal.id,'dafotang-shakyamuni-historical-fit');assert.equal(architecture[0].inventory.status,'UNKNOWN');
 const names=['dafotang_principal_worn_gold','dafotang_principal_red_lacquer','dafotang_principal_dark_curls','dafotang_principal_fitted_support'];const buckets=names.map(name=>{const found=group.children.filter(m=>m.isMesh&&!Array.isArray(m.material)&&m.material.name===name);assert.equal(found.length,1);assert.ok(found[0].geometry.attributes.position.count>0);assert.equal(found[0].visible,true);return{name,vertices:found[0].geometry.attributes.position.count};});
 session=builder.dafotangPhotoSession;assert.ok(session);assert.equal(builder.dafotangOriginalSession,undefined);assert.equal(session.status,'BLOCKED');await session.ready;assert.equal(session.status,'BLOCKED');assert.equal(session.presentation,null);assert.equal(fetches,0);assert.equal(lib.loadedFromFile.size,0);assert.equal(lib.normals.size,0);
 const birth=getXiananManagedBirth(builder,data);assert.ok(birth);assert.equal(hasXiananRegistration(cm,birth),true);const from=new T.Vector3(300.9,0,-240.1),to=from.clone();const contact=queryXiananContact(cm,from,to,.5);assert.equal(contact?.status,'valid');assert.equal(contact.scene,scene);assert.equal(contact.boxes.length,5);
 const legacy=new T.Group();legacy.userData.architecture=structuredClone(group.userData.architecture);assert.throws(()=>createDafotangPhotoSession(legacy),/Exact finished Dafotang architecture required/);legacy.name='outer-west';assert.throws(()=>createDafotangPhotoSession(legacy),/Exact unique merged principal material required/);
 report={status:'PASS',scope:'ACTUAL_FULL_OUTER_WEST_PRODUCTION_FINISH_CPU_NO_RENDER',zoneItems:zone.items.length,colliders:cm.colliders.length,walkables:cm.walkables.length,mergedChildren:group.children.length,buckets,photoSession:session.status,originalArtworkDefaultOff:true,xiananContact:contact.status,xiananBoxes:contact.boxes.length,canvases,imageElements,fetches,normals:lib.normals.size,fileTextures:lib.loadedFromFile.size};
 cm.clear();assert.equal(queryXiananContact(cm,from,to,.5)?.status,'invalid');assert.equal(cm.colliders.length,0);assert.equal(cm.walkables.length,0);
}catch(error){errors.push(error);}
finally{
 for(const fn of[()=>cm.clear(),()=>builder.dispose(),()=>lib.dispose()])try{fn();}catch(error){errors.push(error);}
 globalThis.document=previous.document;globalThis.fetch=previous.fetch;
}
if(errors.length)throw new AggregateError(errors,'Finished outer-west validation/cleanup failed');
assert.equal(builder.group,null);assert.equal(builder.disposed,true);assert.equal(scene.children.length,0);assert.equal(session.status,'DISPOSED');report.ownerCleanup='ACTUAL_CM_CLEAR_ZONE_DISPOSE_LIBRARY_DISPOSE_COMPLETED';console.log(JSON.stringify(report));
