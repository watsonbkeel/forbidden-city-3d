import os from 'node:os';import path from 'node:path';
import {CollisionManager} from '../../src/utils/Collision.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {library} from '../lib/inner-palace-fixture.mjs';import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';import {PALACE_LAYOUT} from '../../src/scene/Layout.js';import {CourtKit} from '../../src/scene/palace/kit.js';import {KUNNING_PROFILE} from '../../src/scene/palace/special/KunningProfile.js';import {createXinuanTopologyMassing} from '../../src/scene/palace/special/XinuanTopologyMassing.js';
const evidenceDir=process.env.EVIDENCE_DIR?path.resolve(process.env.EVIDENCE_DIR):fs.mkdtempSync(path.join(os.tmpdir(),'d26-neighbors-'));fs.mkdirSync(evidenceDir,{recursive:true});
test('D26 actual three-palace shared deck and independent west gate/corridor owners, preserved contacts',()=>{
 const lib=library(),scene=new T.Scene(),builder=new PalaceBuilder(scene,lib),kit=new CourtKit(lib,'garden'),a=createXinuanTopologyMassing({enabled:true});
 try{
 builder.buildPalaces(PALACE_LAYOUT.filter(h=>['乾清宫','交泰殿','坤宁宫'].includes(h.name)));
 const z=JSON.parse(fs.readFileSync(new URL('../../data/zones/garden.json',import.meta.url)));
 for(const i of [8,9])kit.gate({...z.items[i],rot:-Math.PI/2});const c=z.items[24];assert.equal(c.from[1],390.2);assert.equal(c.facing,'x-');kit.corridor(...c.from,...c.to,c.facing,{...c,furnishingTarget:'garden/items/24',furnishingKind:'corridor'});
 scene.updateMatrixWorld(true);kit.root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(a.group),owners=[...builder.colliders,...kit.colliders],overlap=[],visual=[];
 owners.forEach((b,i)=>{assert.ok(!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));if(b.max.y>0&&bounds.intersectsBox(b))overlap.push(i);});
 for(const root of [scene,kit.root])root.traverse(m=>{if(m.isMesh){const b=new T.Box3().setFromObject(m);assert.ok(!b.isEmpty());if(bounds.intersectsBox(b))visual.push(m.name);}});
 const cm=new CollisionManager();cm.addColliders(owners);cm.addWalkables([...builder.walkables,...kit.walkables]);
 const support=[];for(const x of[31.1,35,38.9])for(const z of[394.2,397.1,400])support.push(cm.getGroundHeight(x,z,2.16));assert.ok(support.every(y=>y===0),'actual current exterior support must remain ground0');
 const routes=[];for(const [name,ids]of Object.entries(KUNNING_PROFILE.navigation.routes)){routes.push({name:'retained-profile:'+name,points:ids.map(id=>{const[x,y,z]=KUNNING_PROFILE.navigation.points[id];return new T.Vector3(x,2.16+y+1.7,386.1+z);})});}
 // West-specific finite witnesses; source gates/corridor, not changed old route inputs.
 for(const z of[384.2,410])routes.push({name:'west-gate:'+z,points:[new T.Vector3(58,1.7,z),new T.Vector3(44,1.7,z)]});
 routes.push({name:'west-inner-court-existing-ground',points:[new T.Vector3(43,1.7,384.2),new T.Vector3(43,1.7,410)]});
 routes.push({name:'west-corridor-center',points:[new T.Vector3(51.15,2.15,390.7),new T.Vector3(51.15,2.15,403.5)]});
 const samples=[];for(const r of routes)for(let n=1;n<r.points.length;n++){const v=r.points[n-1],w=r.points[n],count=Math.ceil(v.distanceTo(w)/.1);for(let i=0;i<=count;i++){const p=v.clone().lerp(w,i/count);samples.push({name:r.name,p,blocked:cm.checkCollision(p,.5),ground:cm.getGroundHeight(p.x,p.z,p.y-1.7)});}}
 cm.addColliders(a.contacts);for(const s of samples){assert.equal(cm.checkCollision(s.p,.5),s.blocked);assert.equal(cm.getGroundHeight(s.p.x,s.p.z,s.p.y-1.7),s.ground);}
 const counts=routes.map(r=>{const rows=samples.filter(s=>s.name===r.name);return{name:r.name,samples:rows.length,baselineBlocked:rows.filter(s=>s.blocked).length};});assert.equal(counts.find(r=>r.name==='west-inner-court-existing-ground').baselineBlocked,0);
 fs.writeFileSync(path.join(evidenceDir,'D26-NEIGHBORS.json'),JSON.stringify({scope:'REAL_FINITE_THREE_PALACES_SHARED_DECK_PLUS_WEST_GATES8_9_CORRIDOR24_NOT_WORLD',owners:owners.length,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},support,overlap,visualOverlap:visual,routes:counts,unchangedContactSamples:samples.length},null,2));assert.deepEqual(overlap,[]);assert.deepEqual(visual,[]);
 }finally{a.dispose();kit.dispose(kit.root);builder.dispose();}
});
