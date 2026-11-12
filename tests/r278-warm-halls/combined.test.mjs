import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as T from 'three';
import {library} from '../lib/inner-palace-fixture.mjs';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {KUNNING_PROFILE} from '../../src/scene/palace/special/KunningProfile.js';
import {buildDongnuanTopologyMassing} from '../../src/scene/palace/special/DongnuanTopologyBuilder.js';
import {buildXinuanTopologyMassing} from '../../src/scene/palace/special/XinuanTopologyBuilder.js';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/garden.json',import.meta.url)));
const counts=k=>[k.root.children.length,k.colliders.length,k.owned.length,k.rooms.length,k.mapItems.length,k.walkables.length];

test('both normal warm-hall hooks coexist on actual finite neighbors; preserve real routes and lifecycle',()=>{
 const lib=library(),scene=new T.Scene(),builder=new PalaceBuilder(scene,lib),zoneBuilder=new ZoneBase(lib,zone),kit=zoneBuilder.kit;let disposed=false;
 try{
  builder.buildPalaces(PALACE_LAYOUT.filter(h=>['乾清宫','交泰殿','坤宁宫'].includes(h.name)));
  for(const i of [3,4,8,9])zoneBuilder.gateWidths.set(zone.items[i].name,zoneBuilder.buildGate(zone.items[i]));
  for(const i of [18,24])zoneBuilder.buildCorridor(zone.items[i]);
  scene.updateMatrixWorld(true);kit.root.updateMatrixWorld(true);
  const before=counts(kit),oldContacts=[...kit.colliders],owners=[...builder.colliders,...kit.colliders],oldVisual=[];
  for(const root of [scene,kit.root])root.traverse(m=>{if(m.isMesh){const b=new T.Box3().setFromObject(m);assert.ok(!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));oldVisual.push(b);}});
  const cm=new CollisionManager();cm.addColliders(owners);cm.addWalkables([...builder.walkables,...kit.walkables]);
  const routes=[];for(const[name,ids]of Object.entries(KUNNING_PROFILE.navigation.routes))routes.push({name:'retained-profile:'+name,points:ids.map(id=>{const[x,y,z]=KUNNING_PROFILE.navigation.points[id];return new T.Vector3(x,2.16+y+1.7,386.1+z);})});
  for(const [side,x0,x1,zs]of [['east',-58,-44,[383.7,410]],['west',58,44,[384.2,410]]])for(const z of zs)routes.push({name:`${side}-gate:${z}`,points:[new T.Vector3(x0,1.7,z),new T.Vector3(x1,1.7,z)]});
  for(const [side,x,z]of [['east',-43,383.7],['west',43,384.2]])routes.push({name:side+'-inner-court',points:[new T.Vector3(x,1.7,z),new T.Vector3(x,1.7,410)]});
  routes.push({name:'west-corridor-center',points:[new T.Vector3(51.15,2.15,390.7),new T.Vector3(51.15,2.15,403.5)]});
  const samples=[];for(const r of routes)for(let n=1;n<r.points.length;n++){const v=r.points[n-1],w=r.points[n],steps=Math.ceil(v.distanceTo(w)/.1);for(let i=0;i<=steps;i++){const p=v.clone().lerp(w,i/steps);samples.push({name:r.name,p,blocked:cm.checkCollision(p,.5),ground:cm.getGroundHeight(p.x,p.z,p.y-1.7)});}}
  const bodies=[buildDongnuanTopologyMassing(kit,zone),buildXinuanTopologyMassing(kit,zone)];
  assert.deepEqual(counts(kit),before.map((v,i)=>v+[2,6,6,0,0,0][i]));oldContacts.forEach((c,i)=>assert.equal(kit.colliders[i],c));
  const bounds=bodies.map(a=>new T.Box3().setFromObject(a.group));assert.equal(bounds[0].intersectsBox(bounds[1]),false);
  for(const b of bounds){assert.ok(!b.isEmpty());for(const old of owners)if(old.max.y>0)assert.equal(b.intersectsBox(old),false);for(const old of oldVisual)assert.equal(b.intersectsBox(old),false);}
  cm.addColliders(bodies.flatMap(a=>a.contacts));for(const s of samples){assert.equal(cm.checkCollision(s.p,.5),s.blocked);assert.equal(cm.getGroundHeight(s.p.x,s.p.z,s.p.y-1.7),s.ground);}
  const support=[];for(const [xs,zs]of [[[-38.9,-35,-31.1],[393.1,396,398.9]],[[31.1,35,38.9],[394.2,397.1,400]]])for(const x of xs)for(const z of zs)support.push({x,z,ground:cm.getGroundHeight(x,z,2.16)});
  assert.ok(support.every(p=>p.ground===0),'massings do not invent walkable support');
  const routeCounts=routes.map(r=>{const rows=samples.filter(s=>s.name===r.name);return{name:r.name,samples:rows.length,baselineBlocked:rows.filter(s=>s.blocked).length};});
  assert.equal(routeCounts.find(r=>r.name==='west-corridor-center').baselineBlocked,31);assert.equal(routeCounts.find(r=>r.name==='east-inner-court').baselineBlocked,0);assert.equal(routeCounts.find(r=>r.name==='west-inner-court').baselineBlocked,0);
  assert.deepEqual(bodies.map(a=>a.meta.sourceObjectId),['FC-0651110E09','FC-C3BA7692B4']);assert.ok(bodies.every(a=>a.meta.defaultEnabled&&a.meta.wholeObjectAccepted===false));
  let releases=0;bodies.flatMap(a=>a.materials).forEach(m=>m.addEventListener('dispose',()=>releases++));const merged=kit.finish();
  for(const id of ['FC-0651110E09','FC-C3BA7692B4'])assert.equal(merged.userData.architecture.filter(a=>a.sourceObjectId===id).length,1);
  kit.dispose(merged);disposed=true;assert.equal(releases,6);
  const dir=process.env.EVIDENCE_DIR?path.resolve(process.env.EVIDENCE_DIR):fs.mkdtempSync(path.join(os.tmpdir(),'r278-combined-'));fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'COMBINED-NEIGHBORS.json'),JSON.stringify({scope:'ACTUAL_ZONEBASE_FOUR_GATE_AND_TWO_CORRIDOR_DISPATCH_PLUS_THREE_PALACES_NOT_FULL_ZONE_WORLD_OR_RENDER',ids:bodies.map(a=>a.meta.sourceObjectId),oldOwners:owners.length,newContacts:6,visualOwners:oldVisual.length,bounds:bounds.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),routeSamples:samples.length,routes:routeCounts,support,oldContactReferencesPreserved:true,materialsReleasedOnce:releases,normalDefaults:true,wholeObjectAccepted:false},null,2)+'\n');
 }finally{if(!disposed)kit.dispose(kit.root);builder.dispose();}
});
