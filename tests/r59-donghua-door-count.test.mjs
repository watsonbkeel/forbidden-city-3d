import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {library,gate,goldRuns,binding} from './lib/r59-donghua-door-fixture.mjs';
const moduleURL=new URL('../src/scene/palace/special/DonghuaCentralDoorFront.js',import.meta.url);
// The missing helper leaves real production geometry and assets unchanged.
// RED therefore measures ten real rows, never an import/module failure.
const {applyDonghuaCentralDoorFront}=existsSync(moduleURL)?await import(moduleURL):{applyDonghuaCentralDoorFront:()=>false};
for(const quality of ['hd','sd'])test(`${quality}: actual central passage-front albedo has nine gold rows`,async()=>{
 const lib=await library(quality),c=gate(lib);
 try{
  assert.equal(goldRuns(lib.color('door_studded').image).length,10,'source is successfully loaded ten-row project image');
  applyDonghuaCentralDoorFront(c.kit,c.frame,binding);
  for(const leaf of c.leaves){const front=leaf.children.find(m=>m.name==='donghua-central-nine-row-front')??leaf;
   assert.equal(goldRuns(front.material.map.image).length,9,'actual production central door texture must have 9 rows, not generic 10');
  }
 }finally{c.kit.dispose(c.kit.root);lib.dispose();}
});
