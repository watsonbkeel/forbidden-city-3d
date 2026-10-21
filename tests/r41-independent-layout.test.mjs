import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const item=config.items.find(i=>i.name==='储秀宫'&&i.kind==='hall');
// Independently exercise both near-edge capsule lanes, not just opening centres.
// Local +x is west; all four apertures must work eastbound and westbound.
for(const fps of[10,60])for(const lane of[-1.4,-.2])for(const backward of[false,true])test(`R41 independent aperture edge lane ${lane}, ${fps}Hz, ${backward?'S':'W'} movement`,t=>{
 const b=new ZoneBase(library(),config);b.build();b.kit.root.updateMatrixWorld(true);
 const kang=[];b.kit.root.traverse(o=>{if(o.userData.role==='chuxiu-restored-kang')kang.push(o);});assert.equal(kang.length,3);
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);
 const local=[[0,-9],[0,lane],[-10.8,lane],[10.8,lane],[-10.8,lane],[0,lane],[0,-9]];
 const points=local.map(([x,z])=>[item.x+x,item.z+z]),trace=traceTerraceGround(cm,{flights:[]});
 try{const r=replayTerrace(t,{cm,THREE},points,{fps,sprint:true,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=item.ph-.01);assert.equal(trace.samples.some(s=>['rescue','unverified'].includes(s.source)),false);assert.ok(r.frames.every(f=>Number.isFinite(f.feet)&&Number.isFinite(f.ground)));}finally{trace.restore();b.dispose();}
});
