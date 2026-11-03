import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from './fixture.mjs';

test('actual main error hook stops inputs, presents one reload dialog, and never auto-restarts the failed frame',async t=>{
 const f=await fixture(t);f.a.startAnimationLoop();f.tick();f.c.moveForward=true;f.c.jumpQueued=true;f.setFail(true);
 assert.doesNotThrow(()=>f.tick());assert.equal(f.queue.size,0);assert.equal(f.a.frameLoop.failed,true);assert.equal(f.c.moveForward,false);assert.equal(f.c.jumpQueued,false);
 const button=f.document.getElementById('tour-reload-btn');assert.ok(button);assert.equal(f.document.activeElement,button);assert.equal(f.map.container.inert,true);
 assert.equal(f.errors.length,1);assert.ok(f.errors[0].includes(f.error));
 f.visibility(true);f.visibility(false);f.a.startAnimationLoop();assert.equal(f.queue.size,0);assert.equal(f.renders.length,1);
 f.a.handleFrameFailure(new Error('later failure'));assert.equal(f.errors.length,1);assert.equal(f.document.body.querySelectorAll('#tour-failure-dialog').length,1);
 button.click();button.click();assert.equal(f.reloads(),1);
});
test('main failure still shows recovery when clearing held controls itself throws',async t=>{
 const f=await fixture(t);assert.equal(typeof f.a.handleFrameFailure,'function');const original=f.c.stop;f.c.stop=()=>{throw Error('stop failed');};
 try{assert.doesNotThrow(()=>f.a.handleFrameFailure(f.error));assert.ok(f.document.getElementById('tour-reload-btn'));}finally{f.c.stop=original;}
});
test('unchanged normal frame cadence and real map travel continue without any failure notice',async t=>{
 const f=await fixture(t);f.a.startAnimationLoop();f.tick();f.travel();assert.ok(f.tp.lastPoint);assert.equal(f.map.visible,false);f.tick();
 assert.equal(f.renders.length,2);assert.deepEqual(f.renders.at(-1),f.camera.position.toArray());assert.equal(f.queue.size,1);assert.equal(f.errors.length,0);assert.equal(f.document.getElementById('tour-failure-dialog'),null);
});
test('real map target-load exception preserves player, keeps map usable and announces failure; next successful attempt clears it',async t=>{
 const f=await fixture(t),before=f.camera.position.toArray(),failure=new Error('injected target-load failure'),load=f.a.zoneManager.ensureLoadedAt;
 let loads=0;f.a.zoneManager.ensureLoadedAt=()=>{loads++;throw failure;};assert.doesNotThrow(()=>f.travel());assert.deepEqual(f.camera.position.toArray(),before);assert.equal(f.map.visible,true);
 assert.equal(f.tp.overlay.getAttribute('role'),'alert');assert.match(f.tp.overlay.textContent,/失败/);assert.match(f.tp.overlay.textContent,/未改变/);assert.doesNotMatch(f.tp.overlay.textContent,/前往 .*…/);assert.equal(f.tp.lastPoint,undefined);
 assert.equal(f.tp.overlay.style.width,'min(88vw, 480px)');
 f.a.startAnimationLoop();for(let i=0;i<10;i++)f.tick();assert.equal(loads,1,'frames do not automatically retry travel');
 for(let i=0;i<3;i++)f.travel();assert.equal(loads,4,'each explicit attempt runs once');assert.equal(f.document.body.querySelectorAll('#teleport-overlay').length,1);
 f.a.zoneManager.ensureLoadedAt=load;f.travel();assert.ok(f.tp.lastPoint);assert.equal(f.map.visible,false);assert.equal(f.tp.overlay.getAttribute('role'),'status');assert.equal(f.tp.overlay.style.width,'');
});
test('post-move zone failure truthfully reports changed pose and never rolls the camera back',async t=>{
 const f=await fixture(t),before=f.camera.position.toArray();f.a.zoneManager.update=()=>{throw Error('injected post-move update');};
 assert.doesNotThrow(()=>f.travel());assert.notDeepEqual(f.camera.position.toArray(),before);assert.equal(f.map.visible,true);assert.match(f.tp.overlay.textContent,/已改变/);assert.doesNotMatch(f.tp.overlay.textContent,/未改变|已回到|已恢复/);
});
test('partially throwing movement and orientation-only changes are not called unchanged',async t=>{
 const f=await fixture(t),move=f.c.teleportTo.bind(f.c);f.c.teleportTo=()=>{f.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),.7);throw Error('partial turn');};
 assert.doesNotThrow(()=>f.travel());assert.match(f.tp.overlay.textContent,/已改变/);f.c.teleportTo=move;
});
test('unavailable position diagnostics never invent an unchanged or rolled-back location',async t=>{
 const f=await fixture(t);f.c.getPosition=()=>{throw Error('state unavailable');};f.a.zoneManager.ensureLoadedAt=()=>{throw Error('load failure');};
 assert.doesNotThrow(()=>f.travel());assert.match(f.tp.overlay.textContent,/失败/);assert.doesNotMatch(f.tp.overlay.textContent,/未改变|已回到|已恢复/);
});
test('unsafe real collision landing remains rejected, without fallback or an exception-state claim',async t=>{
 const f=await fixture(t),before=f.camera.position.toArray();f.cm.addCollider(new THREE.Box3(new THREE.Vector3(-100,-1,-100),new THREE.Vector3(100,10,50)));
 f.travel();assert.deepEqual(f.camera.position.toArray(),before);assert.equal(f.tp.lastPoint,undefined);assert.equal(f.map.visible,true);assert.match(f.tp.overlay.textContent,/受阻/);assert.equal(f.tp.overlay.getAttribute('role'),'status');
});

test('a failed real mobile control frame releases held joystick and exposes the same reload action',async t=>{
 const f=await fixture(t,{mobile:true});f.touch('touchstart');f.a.startAnimationLoop();f.tick();f.setFail(true);assert.doesNotThrow(()=>f.tick());
 assert.equal(f.c.joystick.active,false);assert.equal(f.queue.size,0);const b=f.document.getElementById('tour-reload-btn');assert.ok(b);f.dispatch(b,'pointerdown',{pointerType:'touch'});f.dispatch(b,'pointerup',{pointerType:'touch'});b.click();assert.equal(f.reloads(),1);
});
