import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from 'three';import {GLTFLoader}from'three/examples/jsm/loaders/GLTFLoader.js';
import{buildWorld}from'../../scripts/r118/world.mjs';import{CharacterSystem}from'../../src/scene/characters/CharacterSystem.js';import{InteriorLoader}from'../../src/scene/interior/InteriorLoader.js';
test('actual S interior remains compatible with 21:00/06:00 roundtrip at 10/30/60Hz',async()=>{
 const W=await buildWorld({loadAll:false,initialPosition:{x:0,z:10}}),interiors=new InteriorLoader(W.scene,W.cm);
 W.zoneManager.loadZone('west-six');const b=fs.readFileSync(new URL('../../public'+interiors.halls.get('taihe').cfg.model,import.meta.url));
 const root=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'')).scene;
 interiors.gltf.load=(_u,ok)=>ok({scene:root});assert.equal(await interiors.load('taihe'),true);
 try{for(const fps of[10,30,60]){const camera=new T.PerspectiveCamera(60,1,.1,2000),s=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,interiors,documentObject:null}),states=['taihe-emperor-01','chuxiu-consort-01'].map(id=>s.manager.states.get(id)),r=s.manager.routines;
 try{r.update(states,1/fps,{minutesOfDay:720});const day=states.map(a=>[...a.binding.position]);let outbound=0,back=0;
 for(;outbound<fps*160&&!states.every(q=>q.routine?.phase==='sleeping');outbound++)r.update(states,1/fps,{minutesOfDay:1260});
 assert.equal(r.shared.status,'ready',r.shared.navigation.reason);assert.ok(states.every(q=>q.routine?.phase==='sleeping'),`${fps}Hz night arrival`);
 assert.ok(states.every(q=>q.actor.behavior.basePose==='sleeping'));assert.ok(states.every(q=>q.routineSample.position[0]>103&&q.routineSample.position[2]>433));
 for(;back<fps*160&&!states.every(q=>!q.routine);back++)r.update(states,1/fps,{minutesOfDay:360});
 assert.equal(r.shared.status,'ready',r.shared.navigation.reason);assert.ok(states.every(q=>!q.routine),`${fps}Hz morning return`);assert.deepEqual(states.map(q=>q.binding.position),day);assert.ok(states.every(q=>q.actor.behavior.basePose==='seated'));
 console.log(JSON.stringify({fps,outboundFrames:outbound,returnFrames:back,dayPositions:day,actualTaiheSurfaces:r.shared.navigation.surfaces.rows.filter(v=>v.zone==='interior:taihe').length}));
 }finally{s.dispose();}}
 }finally{interiors.dispose();W.dispose();}
});
