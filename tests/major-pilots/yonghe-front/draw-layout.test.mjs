import test from 'node:test';
import assert from 'node:assert/strict';
import {make} from './fixture.mjs';
// Executed canvas-command coverage only: this is not raster or GPU validation.
test('private draws distinguish dense stepped upper fields, pale gray glazing and abstract dark timber doors',()=>{
 const original=globalThis.document,draws=[];
 globalThis.document={...original,createElement(){const calls=[],ctx=new Proxy({},{get(target,key){if(key in target)return target[key];return(...args)=>calls.push([key,...args]);},set(target,key,value){target[key]=value;calls.push(['set',key,value]);return true;}});draws.push(calls);return{width:0,height:0,getContext:()=>ctx};}};
 let a;try{a=make();const materials=a.kit.owned.filter(m=>m.name.startsWith('yonghe-south-')&&m.map);assert.equal(materials.length,3);const [upper,glass,door]=draws.slice(-3);assert.equal(upper.filter(c=>c[0]==='stroke').length,3);assert.ok(upper.filter(c=>c[0]==='lineTo').length>=36);assert.ok(glass.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]==='#bfc4c2'));assert.equal(door.filter(c=>c[0]==='strokeRect').length,3);assert.equal(door.filter(c=>c[0]==='lineTo').length,0);for(const m of materials){assert.equal(m.transparent,false);assert.equal(m.depthWrite,true);assert.equal(m.userData.exactCarving,false);}}finally{a?.dispose();globalThis.document=original;}
});
