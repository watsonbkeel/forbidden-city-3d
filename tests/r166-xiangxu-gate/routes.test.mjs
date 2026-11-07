import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as THREE from 'three';import {CourtKit} from '../../src/scene/palace/kit.js';
import {buildXiangxuGlazedGate} from '../../src/scene/palace/special/XiangxuGlazedGate.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/east-six.json',import.meta.url)));
// Component-only real-controller checks. The unmodified production ground and
// actual surrounding routes have a separate bounded integration fixture.
function fixture(t){const lib=realTextureLibrary(),kit=new CourtKit(lib,'east-six'),cm=new CollisionManager();buildXiangxuGlazedGate(kit,zone);cm.addColliders(kit.colliders,'e46-component');cm.addWalkables(kit.walkables,'e46-component');t.after(()=>{cm.clear();kit.dispose(kit.root);lib.dispose()});return{THREE,cm};}
for(const fps of[10,60])for(const sprint of[false,true])test(`closed E46 blocks both directions at ${fps}Hz ${sprint?'run':'walk'}`,t=>{const W=fixture(t);for(const points of[[[-134.5,205.6],[-134.5,208.5]],[[-134.5,208.5],[-134.5,205.6]]]){const r=withBoundedQaMocks(t,m=>replayKunning(m,W,points,{fps,sprint,startFeet:0,recordFrames:true}));assert.equal(r.arrived,false);assert.ok(r.frames.length>0);assert.ok(r.frames.every(f=>Number.isFinite(f.feet)&&f.feet>=-1e-6&&f.feet<.2));}});
test('short wings end visibly and do not create an invisible full courtyard partition',t=>{const W=fixture(t);for(const x of[-141,-128]){const r=withBoundedQaMocks(t,m=>replayKunning(m,W,[[x,205.6],[x,208.5],[x,205.6]],{fps:30,sprint:true,startFeet:0,recordFrames:true}));assert.equal(r.arrived,true);assert.ok(r.frames.every(f=>Math.abs(f.feet)<1e-6));}});
test('front and rear viewing points remain outside the closed portal contacts',t=>{const{cm}=fixture(t);for(const [x,z]of[[-134.5,205.6],[-134.5,208.5]]){const y=cm.getGroundHeight(x,z,0,.6,.5);assert.ok(y>=0&&y<=.12);assert.equal(cm.checkCollision(new THREE.Vector3(x,y+1.7,z),.5),false);}});
