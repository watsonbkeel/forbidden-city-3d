import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync}from'node:fs';
import './lib/inner-palace-fixture.mjs';import {realTextureLibrary}from'./lib/r48-real-texture-library.mjs';import {ZoneBase}from'../src/scene/zones/ZoneBase.js';
for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(x=>x.endsWith('.json'))){
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));
 for(const [idx,item]of d.items.entries())if(item.kind==='hall'&&item.name)test(`R49 plaque backing/face pairing: ${d.id}/${idx} ${item.name}`,()=>{
  const lib=realTextureLibrary(),b=new ZoneBase(lib,d);
  try{b.buildHall(item);for(const p of b.kit.plaques){const {width:w,height:h}=p.mesh.geometry.parameters;
   const matches=p.mesh.parent.children.filter(m=>m.isMesh&&m.material===b.kit.gold&&Math.abs(m.geometry.parameters?.width-w-.12)<1e-7&&Math.abs(m.geometry.parameters?.height-h-.12)<1e-7&&Math.abs(m.position.x-p.mesh.position.x)<1e-7&&Math.abs(m.position.y-p.mesh.position.y)<1e-7&&Math.abs(m.position.z-p.mesh.position.z-.06)<1e-7);
   assert.equal(matches.length,1,`${p.text} needs one adjacent frame, no orphan displaced backing`);
  }}finally{b.kit.dispose(b.kit.root);lib.dispose();}
 });
}
