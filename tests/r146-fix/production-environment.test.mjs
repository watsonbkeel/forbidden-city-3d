import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {buildWorld} from '../../scripts/r118/world.mjs';import {CharacterSystem} from '../../src/scene/characters/CharacterSystem.js';
test('actual view-following sky and skyline do not invalidate the two imperial routines while architectural source guards remain strict',async()=>{
 const W=await buildWorld({loadAll:false});W.environment.setupSky();W.environment.setupSkyline();W.environment.setupLights();W.environment.applyDayCycle(new Date('2026-10-28T04:00:00Z'),true);W.zoneManager.loadZone('west-six');
 const camera=new T.PerspectiveCamera();camera.position.set(0,13,6);const s=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,documentObject:null});const nav=s.manager.routines.shared.navigation;
 try{assert.equal(nav.status,'ready');W.environment.update(camera,1/60);s.update(1/60,{beijingTime:{minutesOfDay:720}});assert.equal(nav.status,'ready',nav.reason);for(const id of['taihe-emperor-01','chuxiu-consort-01'])assert.equal(s.manager.states.get(id).routineRenderable,true,id);
 assert.ok(!nav.staticMeshes.some(r=>r.object.deref()===W.environment.sky));assert.ok(!nav.staticMeshes.some(r=>{for(let p=r.object.deref();p;p=p.parent)if(p===W.environment.skylineRing)return true;return false;}));
 const row=nav.staticMeshes.find(r=>r.object.deref()?.userData.taiheCoreOwner),mesh=row.object.deref(),x=mesh.position.x;mesh.position.x+=.01;assert.equal(nav.validate(),false,'real architecture transform still fails');mesh.position.x=x;assert.equal(nav.validate(),true);
 const ground=W.environment.objects.find(o=>o.isMesh&&o!==W.environment.sky&&nav.staticMeshes.some(r=>r.object.deref()===o));assert.ok(ground,'actual Environment ground remains owned');const gy=ground.position.y;ground.position.y+=.01;assert.equal(nav.validate(),false,'actual ground source transform still fails');ground.position.y=gy;assert.equal(nav.validate(),true);
 }finally{s.dispose();W.dispose();}
});
