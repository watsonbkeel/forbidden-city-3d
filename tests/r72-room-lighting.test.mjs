import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {RoomNightLights} from '../src/scene/sky/RoomNightLights.js';
const rooms=[{name:'wide',floorY:2,min:{x:-15,y:2,z:-10},max:{x:15,y:9,z:10}},{name:'other',floorY:0,min:{x:30,y:0,z:0},max:{x:40,y:5,z:10}}];
test('each room has fitted lamps; bounded light pool follows camera without day changes',()=>{
 const scene=new THREE.Scene(),s=new RoomNightLights({scene,rooms});assert.equal(s.rooms.length,2);assert.ok(s.sites.length>2);assert.equal(s.lights.length,4);
 s.update(0,new THREE.Vector3(0,3.7,0),'high');assert.equal(s.lights.filter(l=>l.intensity>0).length,4);assert.ok(s.lights.every(l=>!l.castShadow));
 s.update(0,new THREE.Vector3(35,1.7,5),'low');assert.equal(s.lights.filter(l=>l.intensity>0).length,2);assert.ok(s.lights[0].position.x>=30);
 s.update(1,new THREE.Vector3(0,3.7,0),'high');assert.ok(s.lights.every(l=>l.intensity===0));assert.equal(s.lampMaterial.emissiveIntensity,0);s.dispose();assert.equal(scene.children.length,0);
});
