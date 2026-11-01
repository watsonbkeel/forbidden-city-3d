import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
const data=JSON.parse(fs.readFileSync('data/zones/axis-courts.json'));
const targets=[{index:26,x:-100.65,near:-309,far:-400},{index:27,x:-100.65,near:-291,far:-230},{index:32,x:105.1,near:-310,far:-400},{index:33,x:105.1,near:-292,far:-230}];
function fixture(){const lib=realTextureLibrary(),zone=new ZoneBase(lib,structuredClone(data)),frames=new Map();for(const i of[0,1])zone.buildGate(zone.zoneJson.items[i]);for(const i of[26,27,32,33,28]){zone.buildCorridor(zone.zoneJson.items[i]);frames.set(i,zone.kit.root.children.at(-1));}zone.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(zone.kit.colliders);cm.addWalkables(zone.kit.walkables);return{lib,zone,frames,cm,dispose(){zone.kit.dispose(zone.kit.root);lib.dispose();}};}
test('Four actual adjacent galleries have source-bounded raised visible floors, not a 2.17m gate-side cliff',()=>{const h=fixture();try{for(const t of targets){const z=(data.items[t.index].from[1]+data.items[t.index].to[1])/2,y=h.cm.getGroundHeight(t.x,z,2.4,.3);assert.ok(y>=2.3&&y<=2.62,`gallery ${t.index} actual support ${y}`);const hits=new THREE.Raycaster(new THREE.Vector3(t.x,3.5,z),new THREE.Vector3(0,-1,0),0,1.5).intersectObject(h.frames.get(t.index),true);assert.ok(hits.some(v=>v.face.normal.y>.5&&Math.abs(v.point.y-y)<.04),'real floor under authority, no invisible bridge');}}finally{h.dispose();}});
test('All four front porches remain physically open along their length and through their real gate joins',()=>{const h=fixture();try{for(const t of targets){for(let k=0;k<=80;k++){const z=t.near+(t.far-t.near)*k/80,y=h.cm.getGroundHeight(t.x,z,2.4,.3);assert.ok(y>=2.3&&y<=2.65,`missing real support ${t.index}/${z}/${y}`);assert.equal(h.cm.checkCollision(new THREE.Vector3(t.x,y+1.7,z),.5),false,`wall/rail blocks porch ${t.index}/${z}`);}}}finally{h.dispose();}});
test('Gallery rooms retain explicit unknown-inventory rather than fabricated contents, with distinct named object identities',()=>{const h=fixture();try{const ids=new Set();for(const t of targets){const f=h.frames.get(t.index);assert.equal(f.userData.sideGateGallery?.platformHeight,2.4);assert.equal(f.userData.sideGateGallery?.surveyed,false);ids.add(f.userData.sideGateGallery.objectId);}assert.equal(ids.size,4);for(const room of h.zone.kit.rooms)assert.equal(room.cover.length,0);}finally{h.dispose();}});
test('The unrelated retained north corridor still uses its old low platform and no new gallery profile',()=>{const h=fixture();try{const f=h.frames.get(28);assert.equal(f.userData.sideGateGallery,undefined);const y=h.cm.getGroundHeight(-103.37,-180,0,.6);assert.ok(Math.abs(y-.45)<.03);}finally{h.dispose();}});
test('Actual north gallery decks cross their underlying water without granting a water-level shortcut',async()=>{
 const {PALACE_LAYOUT}=await import('../src/scene/Layout.js');const h=fixture();try{
  h.cm.rivers=PALACE_LAYOUT.filter(p=>p.type==='river');
  for(const x of[-100.65,105.1]){
   const high=new THREE.Vector3(x,2.4+1.7,-278),low=new THREE.Vector3(x,1.7,-278);
   assert.equal(h.cm.checkRiverCrossing(high,.5,null,2.4),true,'real raised north gallery must not be an air wall');
   assert.equal(h.cm.checkCollision(high,.5),false,'ordinary physical body remains clear');
   assert.equal(h.cm.checkRiverCrossing(new THREE.Vector3(x,3.6+1.7,-278),.5,null,3.6),true,'jumping over the same real deck must not hit a height-only air wall');
   assert.equal(h.cm.checkRiverCrossing(low,.5,null,0),false,'water level remains blocked');
  }
  h.cm.walkables=[];
  assert.equal(h.cm.checkRiverCrossing(new THREE.Vector3(-100.65,4.1,-278),.5,null,2.4),false,'removing the actual registered floor revokes crossing');
 }finally{h.dispose();}
});
