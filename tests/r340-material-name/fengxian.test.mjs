import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';import {finishFengxianFrontSteps} from '../../src/scene/palace/special/FengxianFrontSteps.js';import {stubLibrary} from '../lib/material-stub.mjs';
const ctx=new Proxy({}, {get:()=>()=>({data:[]}),set:()=>true});globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const zone=JSON.parse(fs.readFileSync('data/zones/east-six.json'));
function fixture(){const lib=stubLibrary(T),z=new ZoneBase(lib,zone);z.buildHall(zone.items[53]);return{lib,z};}
test('actual Fengxian producer and guard accept default stub material naming',()=>{const{lib,z}=fixture();try{const r=finishFengxianFrontSteps(z.kit);assert.equal(r.meta.newFlights,2);assert.equal(lib.materials.get('sumeru_band|{}').name,'sumeru_band_material');}finally{z.kit.dispose(z.kit.root);}});
test('tampered cached material name still fails unchanged production guard',()=>{const{lib,z}=fixture();try{lib.materials.get('sumeru_band|{}').name='wrong';assert.throws(()=>finishFengxianFrontSteps(z.kit),/existing dimensions\/platform mismatch/);}finally{z.kit.dispose(z.kit.root);}});
