import {createActualLibrary} from './r158-cumulative-1600/library.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';import {setupInput} from './lib/input-fixture.mjs';import {runGalleryControllerRoute} from './lib/r58-gallery-world-check.mjs';
import {buildNansansuoCommonGate} from '../src/scene/palace/special/NansansuoCommonGate.js';
const source=JSON.parse(fs.readFileSync(new URL('../data/zones/outer-east.json',import.meta.url)));
const kit=new CourtKit(library(),'outer-east');buildNansansuoCommonGate(kit,source.items[10],{zoneId:source.id,itemIndex:10,zoneJson:source});
const results=[];
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`actual FirstPerson common gate two-sided ramp round trip ${fps}Hz ${sprint?'sprint':'walk'} ${backward?'S':'W'}`,t=>{
 const p=setupInput(t);p.cm.addColliders(kit.colliders);p.cm.addWalkables(kit.walkables);
 const r=runGalleryControllerRoute({cm:p.cm,camera:p.camera,controls:p.c},[[-285,12],[-285,28],[-285,12]],{fps,sprint,backward,tick:p.advance});
 assert.equal(r.arrived,true,JSON.stringify(r));assert.ok(r.minFeet>=-.001&&r.maxFeet>=.499&&r.maxFeet<=.501,JSON.stringify(r));results.push(r);
});

test('ordinary outer-east build with candidate dispatch retains original walls and six halls / inventory, single real gate only',()=>{
 const build=candidate=>{const data=structuredClone(source),resources=createActualLibrary(),z=new ZoneBase(resources.library,data),g=z.buildGate.bind(z);if(candidate)z.buildGate=function(item){if(item===data.items[10]){const b=buildNansansuoCommonGate(this.kit,item,{zoneId:data.id,itemIndex:10,zoneJson:data});this.gateGeometries.set(item.name,b.geometry);return b.width}return g(item)};const random=Math.random;Math.random=()=>.5;try{return {z,result:z.build(),data,resources}}finally{Math.random=random}};
 const a=build(false),b=build(true);try{assert.equal(a.result.group.userData.architecture.filter(r=>r.objectId==='FC-B0B56A63EE').length,1,'normal production hook without fallback');assert.equal(a.z.gateWidths.get('南三所宫门'),14.8);assert.equal(b.z.gateWidths.get('南三所宫门'),14.8);assert.equal(hash(a.result.rooms),hash(b.result.rooms));assert.equal(hash(a.data),hash(b.data));const records=b.result.group.userData.architecture.filter(r=>r.objectId==='FC-B0B56A63EE');assert.equal(records.length,1);assert.equal(records[0].scope,'OWN_COMMON_GATE_ONLY_SIX_HALLS_AND_THIRD_ROW_UNCHANGED');const nonTarget=root=>{const m=new Map();root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,ix=o.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const vs=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(o.matrixWorld).toArray());if(vs.some(v=>v[0]>=-295&&v[0]<=-275&&v[2]>=11&&v[2]<=29))continue;const key=JSON.stringify([o.material.name,vs]);m.set(key,(m.get(key)??0)+1)}});return [...m].sort((a,b)=>a[0].localeCompare(b[0]))};const ka=nonTarget(a.result.group),kb=nonTarget(b.result.group);if(process.env.R158_NANSANSUO_DEBUG){const ma=new Map(ka),mb=new Map(kb);console.log('nonTarget delta',JSON.stringify({before:ka.filter(([k,n])=>mb.get(k)!==n).slice(0,6),after:kb.filter(([k,n])=>ma.get(k)!==n).slice(0,6)}))}assert.equal(hash(ka),hash(kb));}finally{a.z.dispose();b.z.dispose();a.resources.dispose();b.resources.dispose()}
});

test.after(()=>{if(process.env.R158_NANSANSUO_REPORT){fs.mkdirSync(process.env.R158_NANSANSUO_REPORT,{recursive:true});fs.writeFileSync(`${process.env.R158_NANSANSUO_REPORT}/controller.json`,JSON.stringify({scope:'Actual production FirstPerson and Collision; private isolated module / dispatch only, not installed shared hook or browser acceptance',results},null,2)+'\n')}kit.dispose(kit.root)});

for(const fps of[10,60])for(const [x,z]of[[0,0],[0,-2.5],[0,2.5],[-4,0],[4,0]])test(`actual controller high drop and walk away ${fps}Hz local ${x},${z}`,t=>{
 const p=setupInput(t);p.cm.addColliders(kit.colliders);p.cm.addWalkables(kit.walkables);p.c.setHeadBob(false);p.c.setPosition(-285+x,14+1.7,20+z);p.c.airborne=true;p.c.verticalVelocity=0;
 for(let i=0;i<fps*14;i++){p.advance(1000/fps);p.c.update();p.camera.updateMatrixWorld(true);assert.ok(Number.isFinite(p.c.feetY)&&p.c.feetY>=-.001)}
 const before={x:p.camera.position.x,y:p.c.feetY,z:p.camera.position.z,airborne:p.c.airborne};p.c.moveForward=true;
 for(let i=0;i<fps*12&&p.camera.position.z>11.5;i++){p.camera.lookAt(p.camera.position.x,p.camera.position.y,0);p.camera.updateMatrixWorld(true);p.advance(1000/fps);p.c.update();p.camera.updateMatrixWorld(true)}
 p.c.moveForward=false;assert.ok(p.camera.position.z<12,JSON.stringify({before,end:p.camera.position.toArray(),feet:p.c.feetY}));assert.ok(p.c.feetY<.1,JSON.stringify({before,end:p.camera.position.toArray(),feet:p.c.feetY}));
});

for(const fps of[10,60])for(const side of[-1,1])for(const face of[-1,1])test(`actual low ramp side exit returns to ground ${fps}Hz ${side}/${face}`,t=>{
 const p=setupInput(t);p.cm.addColliders(kit.colliders);p.cm.addWalkables(kit.walkables);const Z=20+face*4.5;
 const r=runGalleryControllerRoute({cm:p.cm,camera:p.camera,controls:p.c},[[-285+side*1.4,Z],[-285+side*3.5,Z]],{fps,tick:p.advance,initialFeet:.25});assert.ok(r.arrived,JSON.stringify(r));for(let i=0;i<fps*2;i++){p.advance(1000/fps);p.c.update()}assert.ok(p.c.feetY>=-.001&&p.c.feetY<.05,JSON.stringify({r,feet:p.c.feetY}));
});
