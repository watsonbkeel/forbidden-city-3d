import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import './lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
for(const name of ['古华轩','遂初堂','畅音阁','阅是楼'])test(name+': official horizontal form has a real horizontal glyph atlas, not a stretched vertical bitmap',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))),lib=realTextureLibrary(),z=new ZoneBase(lib,d);
 try{z.buildHall(d.items.find(i=>i.name===name));const p=z.kit.plaques.find(p=>p.text===name);
 assert.equal(p.layout,'horizontal');assert.equal(p.readingOrder,'right-to-left');
 assert.ok(p.mesh.geometry.parameters.width*p.mesh.scale.x>2.5*p.mesh.geometry.parameters.height*p.mesh.scale.y);
 const calls=[],saved=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({fillText:(...a)=>calls.push(a)},{get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>(o[k]=v,true)})})};
 try{z.kit.buildPlaqueAtlas();}finally{globalThis.document=saved;}
 const chars=calls.filter(c=>[...name].includes(c[0]));assert.equal(chars.length,3);assert.equal(chars[0][2],chars[1][2]);assert.ok(chars[0][1]>chars[1][1]&&chars[1][1]>chars[2][1],'historical horizontal reading order');
 assert.equal(p.mesh.material.userData.nameboardLayout,'horizontal');assert.equal(p.mesh.position.x,p.frame.position.x);assert.equal(p.mesh.position.y,p.frame.position.y);
 }finally{z.dispose();lib.dispose();}
});
