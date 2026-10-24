import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from './lib/r72-player-fixture.mjs';
import {buildTaiheNavigation} from '../src/scene/palace/special/TaiheCore.js';
import {buildRockery} from '../src/scene/garden/rocks.js';
import {PLAYER} from '../src/config/constants.js';
function taihe(f) {
 const b={walkables:[], col(...a){f.cm.addCollider(new THREE.Box3(new THREE.Vector3(...a.slice(0,3)),new THREE.Vector3(...a.slice(3))),'taihe');}};
 buildTaiheNavigation(b,{x0:0,z0:0,y:0});f.cm.addWalkables(b.walkables,'taihe');return b;
}
for(const fps of [10,60])test(`Taihe landing matches visible 2.06m dais, can leave without map at ${fps}fps`,t=>{
 const f=fixture(t,{position:[2.5,8,8]});taihe(f);f.controls.feetY=8;f.camera.position.y=8+PLAYER.HEIGHT;f.controls.airborne=true;
 for(let i=0;i<fps*3;i++)f.step(1/fps);
 assert.ok(Math.abs(f.controls.feetY-2.06)<.01,`feet ${f.controls.feetY}, visual dais top 2.06`);
 f.key('KeyD');for(let i=0;i<fps*3;i++)f.step(1/fps);
 assert.ok(f.camera.position.x>5);assert.equal(f.controls.feetY,0);
});
for(const fps of [10,60])test(`rockery high drop lands on sealed summit instead of internal void at ${fps}fps`,t=>{
 const f=fixture(t,{position:[0,15,0]});const rock=buildRockery({center:new THREE.Vector3(0,0,0),topY:8,seed:2024});
 f.cm.addColliders(rock.colliders,'rock');f.cm.addWalkables(rock.walkables??[],'rock');f.controls.feetY=15;f.camera.position.y=15+PLAYER.HEIGHT;f.controls.airborne=true;
 for(let i=0;i<fps*4;i++)f.step(1/fps);
 assert.ok(f.controls.feetY>=8,`feet ${f.controls.feetY} is inside the visible mountain`);
 f.key('KeyD');for(let i=0;i<fps*4;i++)f.step(1/fps);
 assert.ok(f.camera.position.x>10,JSON.stringify(f.player()));assert.equal(f.controls.feetY,0);
 rock.geometries.forEach(g=>g.dispose());
});
for(const fps of [10,60])for(const [key,x,z]of [['KeyD',1,0],['KeyA',-1,0],['KeyS',0,1],['KeyW',0,-1]])test(`rockery summit ${key} jump escape at ${fps}fps`,t=>{
 const f=fixture(t),r=buildRockery({center:new THREE.Vector3(),topY:8,seed:2024});f.cm.addColliders(r.colliders,'rock');f.cm.addWalkables(r.walkables,'rock');f.controls.setPosition(0,8.5+PLAYER.HEIGHT,0);f.key(key);f.key('Space');
 for(let i=0;i<fps*5;i++)f.step(1/fps);
 assert.ok(f.camera.position.x*x+f.camera.position.z*z>10,JSON.stringify(f.player()));assert.equal(f.controls.feetY,0);r.geometries.forEach(g=>g.dispose());
});
for(const fps of [10,60])test(`Taihe centre flight reaches dais, throne remains solid, can back away ${fps}fps`,t=>{
 const f=fixture(t,{position:[0,0,1]});taihe(f);f.key('KeyS');
 for(let i=0;i<fps*3;i++)f.step(1/fps);
 assert.ok(f.camera.position.z>=5&&f.camera.position.z<9.1,JSON.stringify(f.player()));
 assert.ok(f.controls.feetY>=2.06);f.key('KeyS','keyup');f.key('KeyW');
 for(let i=0;i<fps*4;i++)f.step(1/fps);assert.ok(f.camera.position.z<2,JSON.stringify(f.player()));
});
