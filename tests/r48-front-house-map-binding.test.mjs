import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{PlaceCatalog}from'../src/ui/PlaceCatalog.js';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';import{library}from'./lib/inner-palace-fixture.mjs';
import{resolveRemainingProfile}from'../src/scene/palace/special/RemainingOuterHalls.js';
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))),catalog=new PlaceCatalog();
for(const name of['含清斋','延寿堂'])test(`R48 ${name} real fitted front-house map footprint retains exact original catalog identity and rejects drift`,()=>{
 const item=data.items.find(i=>i.name===name),p=resolveRemainingProfile(data.id,item),b=new ZoneBase(library(),data);
 try{b.buildHall(item);const maps=b.kit.mapItems.filter(m=>m.name===name);assert.equal(maps.length,1);const m=maps[0];assert.ok(p.mapFootprint);assert.notEqual(m.z,item.z,'actual enclosure center changes while original source anchor stays retained');
  assert.equal(catalog.forMapItem(m,maps)?.id,p.id);assert.deepEqual(Object.fromEntries(['kind','x','z','w','d'].map(k=>[k,m[k]])),p.mapFootprint);
  for(const key of['x','z','w','d']){const bad={...m,[key]:m[key]+.001};assert.equal(catalog.forMapItem(bad,[bad]),null,key+' drift');}
  assert.equal(catalog.forMapItem(m,[m,{...m}]),null,'duplicate identity remains ambiguous');
  const oldCenter={...m,x:item.x,z:item.z};assert.equal(catalog.forMapItem(oldCenter,[oldCenter]),null,'old source center cannot impersonate the revised real footprint');
 }finally{b.kit.dispose(b.kit.root);}
});
