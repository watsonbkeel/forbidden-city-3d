import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{library}from'./lib/inner-palace-fixture.mjs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
for(const[zone,name]of[['east-six','永和宫'],['west-six','重华宫']])test(name+': exact roof geometry roles work with production and ordinary inert-library naming',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),z=new ZoneBase(library(),d);const r=z.buildHall(d.items.find(i=>i.name===name));let caps=0;r.f.traverse(m=>{if(m.name==='r49b-concealed-canopy-roof-joint-cap')caps++;});assert.equal(caps,1);z.dispose();
});
