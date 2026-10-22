import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import * as T from 'three';
import './lib/inner-palace-fixture.mjs';import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
test('all generic gate assemblies have complete backing outside actual wall/head boxes',()=>{
 const rows=[];
 for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json'))){
  const data=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));
  for(const item of data.items.filter(i=>i.kind==='gate'&&i.name&&!i.historicalSite&&!i.gateProfile&&!i.southGateProfile)){
   const lib=realTextureLibrary(),z=new ZoneBase(lib,data),boxes=[],box=z.kit.box.bind(z.kit);
   z.kit.box=(...args)=>{const mesh=box(...args);boxes.push(mesh);return mesh;};
   try{z.buildGate(item);z.kit.root.updateMatrixWorld(true);for(const p of z.kit.plaques){
    const a=new T.Box3().setFromObject(p.frame),hits=boxes.filter(m=>{const b=new T.Box3().setFromObject(m);return ['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-5);});
    rows.push({name:item.name,hits:hits.length});
    assert.equal(p.mesh.position.y,p.frame.position.y,'lettering and own backing remain paired');
   }}finally{z.dispose();lib.dispose();}
  }
 }
 assert.equal(rows.length,58,'explicit generic-only inventory; no historical authenticity claim');
 assert.deepEqual(rows.filter(r=>r.hits),[],'complete backings may not embed in closed structural boxes');
});
