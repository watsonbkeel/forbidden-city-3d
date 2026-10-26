import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance,triangleFootContact} from '../src/utils/TriangleSupport.js';
const url=new URL('../src/scene/garden/DuixiuTerrain.js',import.meta.url),api=fs.existsSync(url)?await import(url):{};
function shape(vertices){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));const s=triangleInstance(createTriangleTemplate(g),[0,0,0],'contact-test');g.dispose();return s;}
test('Duixiu exact square bottom contacts a real corner beyond old circular foot',()=>{assert.equal(typeof api.duixiuFootContact,'function');const s=shape([.4,1,.4,.4,1,.8,.8,1,.4]);assert.equal(triangleFootContact(s,0,0,.3,2),null);const hit=api.duixiuFootContact(s,0,0,2,.5);assert.ok(hit);assert.equal(hit.height,1);assert.ok(hit.witness.x>=.4-1e-7&&hit.witness.x<=.5+1e-7&&hit.witness.z>=.4-1e-7&&hit.witness.z<=.5+1e-7);assert.equal(hit.terrainId,'duixiu');});
test('Duixiu footprint rejects empty bounding-box corner and unreachable top',()=>{assert.equal(typeof api.duixiuFootContact,'function');const s=shape([0,1,0,0,1,2,2,1,0]);assert.equal(api.duixiuFootContact(s,1.8,1.8,2,.5),null);assert.equal(api.duixiuFootContact(s,.2,.2,.9,.5),null);});
test('Duixiu sloping top returns its real clipped highest witness, not broadphase height',()=>{assert.equal(typeof api.duixiuFootContact,'function');const s=shape([0,0,0,0,0,2,2,2,0]);const hit=api.duixiuFootContact(s,.6,.2,3,.5);assert.ok(hit);assert.ok(Math.abs(hit.height-1.1)<1e-7);assert.ok(Math.abs(hit.witness.x-hit.height)<1e-7);});
test('Duixiu reachable floor is not hidden by a higher roof up-face',()=>{assert.equal(typeof api.duixiuFootContact,'function');const s=shape([0,1,0,0,1,2,2,1,0,0,4,0,0,4,2,2,4,0]);const hit=api.duixiuFootContact(s,.4,.4,1.6,.5);assert.ok(hit);assert.equal(hit.height,1);});
test('physical floor contact survives a too-low roof; pose admission is separate',()=>{assert.equal(typeof api.duixiuFootContact,'function');const s=shape([0,0,0,0,0,2,2,0,0,0,1,0,0,1,2,2,1,0]);const hit=api.duixiuFootContact(s,.4,.4,.1,.5);assert.ok(hit);assert.equal(hit.height,0);});
