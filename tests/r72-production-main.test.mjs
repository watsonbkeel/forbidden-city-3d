import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';import {compileProductionMain,lightWorld,installMainEnvironment,advanceMain} from './lib/r51-production-main.mjs';
const compiled=await compileProductionMain();
test('production main owns real room lamps, passes same Beijing snapshot, updates budgets and disposes',async()=>{
 const world=lightWorld(),host=installMainEnvironment(world),app=new compiled.module.ForbiddenCityApp();let disposed=0;try{await app.init();app.flight.position=new THREE.Vector3(22,0,-494);const lamps=app.roomNightLights;assert.equal(lamps.root.parent,app.scene);assert.equal(lamps.rooms.length,6);lamps.fixtures.addEventListener('dispose',()=>disposed++);
 const real=app.characters.update.bind(app.characters);let seen;app.characters.update=(dt,options)=>{seen=options.beijingTime;real(dt,options);};const snapshot={minutesOfDay:1260};app.environment.dayCycle.beijingTime=snapshot;
 const site=lamps.sites[0];app.camera.position.set(site.x,site.y-1.5,site.z);app.currentQuality='high';await advanceMain(app,{daylight:0,maxFrames:2});assert.equal(seen,snapshot);assert.equal(app.characters.manager.routines.night,true);assert.equal(lamps.lights.filter(l=>l.visible).length,4);
 app.currentQuality='low';await advanceMain(app,{daylight:0,maxFrames:2});assert.equal(lamps.lights.filter(l=>l.visible).length,2);app.environment.dayCycle.beijingTime={minutesOfDay:360};await advanceMain(app,{daylight:1,maxFrames:2});assert.equal(lamps.lights.filter(l=>l.visible).length,0);assert.equal(app.characters.manager.routines.night,false);
 app.dispose();assert.equal(disposed,1);assert.equal(lamps.root.parent,null);
 }finally{if(!disposed)app.dispose();host.restore();}
});
